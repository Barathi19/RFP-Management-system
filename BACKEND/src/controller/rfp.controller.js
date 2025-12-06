const { RFP_STATUS } = require("../constant");
const asynHandler = require("../middleware/asyn");
const RFP = require("../models/rfp.model");
const Vendor = require("../models/vendor.model");
const aiService = require("../service/ai.service");
const ErrorResponse = require("../utils/errorResponse");
const sendMail = require("../utils/mailer");

const getRFP = async (id) => {
  const rfp = await RFP.findById(id);
  if (!rfp) {
    throw new ErrorResponse("RFP not found.", 404);
  }

  return rfp;
};

const getAllRFP = asynHandler(async (_, res) => {
  const allRFP = await RFP.find({}).populate("vendorIds");

  return res.json({ success: true, data: allRFP });
});

const getRFPDetail = asynHandler(async (req, res) => {
  const { id } = req.params;

  const rfp = await RFP.findById(id).populate("vendorIds");
  if (!rfp) {
    throw new ErrorResponse("RFP not found.", 404);
  }

  return res.json({ success: true, data: rfp });
});

const generateRFPPreview = asynHandler(async (req, res) => {
  const { text } = req.body;

  const data = await aiService.humanTextToData(text);

  return res.json({
    success: true,
    message: "RFP Data generated successfully.",
    data,
  });
});

const createRFP = asynHandler(async (req, res) => {
  const rfpData = req.body;

  const newRfp = new RFP(rfpData);
  await newRfp.save();

  return res.json({
    success: true,
    message: "New RFP created successfully.",
    data: newRfp.toJSON(),
  });
});

const sendRFP = asynHandler(async (req, res) => {
  const { vendorIds } = req.body;
  const { id } = req.params;

  const rfp = await getRFP(id);

  const existingVendorIds = new Set(rfp?.vendorIds?.map(id => id?.toString()) || []);
  const newVendorIds = vendorIds.filter(id => !existingVendorIds.has(id));

  if (newVendorIds.length === 0) {
    return res.status(200).json({
      success: true,
      message: "RFP already sent to all selected vendors.",
      data: rfp.toJSON(),
    });
  }

  const vendorList = await Vendor.find({ _id: { $in: newVendorIds } });

  const existIds = new Set(vendorList.map((v) => v._id.toString()));
  const missingIds = newVendorIds.filter((id) => !existIds.has(id));

  if (missingIds.length) {
    throw new ErrorResponse(`Invalid VendorId's: ${missingIds.join(",")}`);
  }


  const uniqueVendorIds = [...new Set([...(rfp?.vendorIds?.map(id => id.toString()) || []), ...newVendorIds])];
  rfp.vendorIds = uniqueVendorIds;

  rfp.status = RFP_STATUS.sent;
  await rfp.save();

  const emailPromises = vendorList.map((vendor) => {
    const emailBody = `
  <p>Hello ${vendor.contactName},</p>

  <p>We are sending you a new RFP:</p>

  <h2>${rfp.title}</h2>

  <p>${rfp.description || "No description provided."}</p>

  <table style="border-collapse: collapse;">
    <tr>
      <td><strong>Budget:</strong></td>
      <td>$${rfp.budgetTotal}</td>
    </tr>
    <tr>
      <td><strong>Delivery:</strong></td>
      <td>${rfp.deliveryDays || "Not specified"} days</td>
    </tr>
    <tr>
      <td><strong>Payment Terms:</strong></td>
      <td>${rfp.paymentTerms || "Not specified"}</td>
    </tr>
    <tr>
      <td><strong>Warranty:</strong></td>
      <td>${rfp.warrantyMonths || "Not specified"} months</td>
    </tr>
  </table>

  <p><strong>Items:</strong></p>
  <ul>
    ${rfp.items
        .map((item) => {
          const specs = item.specs
            ? Object.entries(item.specs)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")
            : "No specs provided";
          return `<li>${item.name} - Qty: ${item.quantity || 0
            }, Specs: ${specs}</li>`;
        })
        .join("")}
  </ul>

  <p>Thank you.</p>
  <p>— RFP Management System</p>
`;
    const subject = `New RFP #${rfp._id}: ${rfp.title}`;

    return sendMail({
      to: vendor.email,
      subject,
      html: emailBody,
    });
  });

  await Promise.all(emailPromises);

  return res.status(200).json({
    success: true,
    message: `RFP sent to ${newVendorIds.length} new vendors.`,
    data: rfp.toJSON(),
  });
});

const deleteRFP = asynHandler(async (req, res) => {
  const { id } = req.params;

  const rfp = await getRFP(id);

  if (rfp.status !== RFP_STATUS.created) {
    throw new ErrorResponse(
      "Only RFPs status with 'created' can be deleted.",
      404
    );
  }

  await RFP.findByIdAndDelete(id);

  return res
    .status(200)
    .json({ success: true, message: "RFP deleted successfully." });
});

module.exports = {
  getAllRFP,
  getRFPDetail,
  generateRFPPreview,
  createRFP,
  deleteRFP,
  sendRFP,
};
