const Imap = require("imap");
const { simpleParser } = require("mailparser");
const Proposal = require("../models/proposal.model");
const RFP = require("../models/rfp.model");
const aiService = require("../service/ai.service");
const { RFP_STATUS } = require("../constant");

class ImapClient {
  constructor() {
    this.imap = new Imap({
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASS,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.imap.destroy();
        reject(new Error("Connection timed out"));
      }, 10000); // 10s timeout

      this.imap.once("ready", () => {
        clearTimeout(timeout);
        resolve();
      });
      this.imap.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
      this.imap.connect();
    });
  }

  async openInbox() {
    return new Promise((resolve, reject) => {
      this.imap.openBox("INBOX", false, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  async searchEmails(criteria) {
    return new Promise((resolve, reject) => {
      this.imap.search(criteria, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  async fetchEmails(uIds) {
    return new Promise((resolve, reject) => {
      if (!uIds.length) return resolve([]);

      const emails = [];
      const processes = [];
      const f = this.imap.fetch(uIds, { bodies: "" });

      f.on("message", (msg) => {
        msg.on("body", (stream) => {
          const p = simpleParser(stream)
            .then((parsed) => {
              emails.push(parsed);
            })
            .catch((err) => {
              console.error("Failed to parse email:", err);
            });
          processes.push(p);
        });
      });

      f.once("error", reject);
      f.once("end", () => {
        Promise.all(processes).then(() => resolve(emails));
      });
    });
  }

  async markAsSeen(uIds) {
    return new Promise((resolve, reject) => {
      this.imap.addFlags(uIds, "\\Seen", (err) => {
        if (err) {
          console.error("Failed to mark flags:", err);
          // Don't reject, just log
        }
        resolve();
      });
    });
  }

  async disconnect() {
    return new Promise((resolve) => {
      this.imap.end();
      this.imap.once("end", resolve);
    });
  }
}

const processRFPReply = async (parsedEmail, rfpId) => {
  try {
    // Find RFP
    const rfp = await RFP.findById(rfpId).populate("vendorIds");
    if (!rfp) {
      console.log("RFP not found:", rfpId);
      return;
    }

    // Match vendor by email (compare against RFP vendors)
    const vendorEmail = parsedEmail.from?.value?.[0]?.address?.toLowerCase();
    if (!vendorEmail) {
      console.log("Could not extract sender email");
      return;
    }

    // Ignore emails sent by the system itself (SMTP_USER)
    if (vendorEmail === process.env.SMTP_USER?.toLowerCase()) {
      console.log("Ignoring email from self (SMTP_USER)");
      return;
    }

    const vendor = rfp.vendorIds.find(
      (v) =>
        v.email && v.email.toLowerCase().includes(vendorEmail) ||
        vendorEmail.includes(v.email?.toLowerCase())
    );

    if (!vendor) {
      console.log("Unknown vendor reply from:", parsedEmail.from?.text);
      return;
    }

    const messageId = parsedEmail.messageId;
    if (!messageId) {
      console.log("No Message-ID found in email, skipping deduplication check properly but proceeding carefully.");
    }

    // Check for existing proposal
    if (messageId) {
      const existing = await Proposal.findOne({ messageId: messageId });
      if (existing) {
        console.log(`Proposal already exists from ${vendor.name} (Message-ID: ${messageId})`);
        return;
      }
    }

    // Combine email content + attachments
    let fullContent = (parsedEmail.text || parsedEmail.html || "").substring(
      0,
      8000
    );

    if (parsedEmail.attachments?.length) {
      for (const att of parsedEmail.attachments) {
        if (att.contentType.startsWith("text/")) {
          const attText = att.content.toString("utf8").substring(0, 2000);
          fullContent += `\n\nATTACHMENT ${att.filename}:\n${attText}`;
        }
      }
    }

    // Parse with YOUR AI service
    const parsedProposal = await aiService.parseVendorProposal(fullContent);

    // Prepare parsed response data matching ParsedResponseSchema
    const parsedResponseData = {
      items:
        parsedProposal.items?.map((i) => ({
          name: i.name || "",
          quantity: i.quantity || 0,
          specs: i.specs || {},
          price: i.unitPrice || 0,
        })) || [],
      totalPrice: parsedProposal.totalPrice || 0,
      deliveryDays: parsedProposal.deliveryDays || 0,
      paymentTerms: parsedProposal.paymentTerms || "",
      warrantyMonths: parsedProposal.warrantyMonths || 0,
      notes: parsedProposal.notes || "",
    };

    // Map to Proposal schema
    const proposalData = {
      rfpId: rfp._id,
      vendorId: vendor._id,
      messageId: messageId || `generated-${Date.now()}-${Math.random()}`, // Fallback if no messageId
      rawEmail: JSON.stringify({
        messageId: parsedEmail.messageId,
        subject: parsedEmail.subject,
        from: parsedEmail.from,
        text: parsedEmail.text,
        html: parsedEmail.html,
        attachments: parsedEmail.attachments?.map((a) => ({
          filename: a.filename,
          contentType: a.contentType,
        })),
      }),
      parsedResponse: parsedResponseData,
    };

    const proposal = new Proposal(proposalData);
    await proposal.save();
    console.log(`Saved NEW proposal from ${vendor.name}`);

    // Update RFP status if this is the first reply
    if (rfp.status === RFP_STATUS.sent) {
      rfp.status = RFP_STATUS.responseReceived;
      await rfp.save();
      console.log(`Updated RFP status to ${RFP_STATUS.responseReceived}`);
    }

  } catch (error) {
    console.error("Failed to process RFP reply:", error.message);
    return false;
  }
  return true;
};

const fetchRFPReplies = async (rfpId) => {
  const client = new ImapClient();

  try {
    await client.connect();
    await client.openInbox();

    // Search for RFP replies: Subject contains RFP ID (process both SEEN and UNSEEN)
    const results = await client.searchEmails([
      ["SUBJECT", `RFP #${rfpId}`],
    ]);

    console.log(results, "RESULTS");


    if (!results.length) {
      console.log("No new RFP replies found");
      return 0;
    }

    console.log(`Found ${results.length} potential RFP replies`);
    const emails = await client.fetchEmails(results);

    // Process each email
    let processedCount = 0;
    for (const email of emails) {
      const success = await processRFPReply(email, rfpId);
      if (success) processedCount++;
    }

    // Mark all fetched UIDs as SEEN
    if (results.length > 0) {
      await client.markAsSeen(results);
    }

    console.log(`Processed ${processedCount} RFP replies`);
    return processedCount;
  } catch (error) {
    console.error("IMAP Error:", error.message);
    throw error;
  } finally {
    try {
      await client.disconnect();
    } catch (e) {
      console.error("IMAP disconnect error:", e.message);
    }
  }
};

module.exports = { fetchRFPReplies };
