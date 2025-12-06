const ErrorResponse = require("../utils/errorResponse");
const geminiModel = require("../utils/gemini");

const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) throw error;

      console.warn(`Attempt ${attempt} failed:` + error.message.yellow);
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

const humanTextToData = async (text) =>
  retry(async () => {
    const prompt = `
          Convert the following procurement request into a structured JSON RFP:
          ---
          ${text}
          ---
        Return strictly valid JSON only.
    - For paymentTerms, use only one of: "Net 30", "Net 45", "Advance Payment", "Prepaid", "Other".
    - If the request does not specify payment terms clearly, leave the field as an empty string.
    - Do not include markdown, explanations, or extra text.
          {
            "title": "",
            "description": "",
            "budgetTotal": 0,
            "deliveryDays": 0,
            "paymentTerms": "",
            "warrantyMonths": 0,
            "items": [
              { "name": "", "quantity": 0, "specs": {} }
            ]
          }
        `;
    const result = await geminiModel.generateContent(prompt);
    const textContent = await result.response.text();
    const cleanText = textContent.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("LLM returned invalid JSON:" + textContent.red);
      throw new ErrorResponse(`Invalid JSON from LLM: ${parseError.message}`);
    }
  });

const parseVendorProposal = async (emailText) =>
  retry(async () => {
    const prompt = `
      Parse the following vendor proposal email into structured JSON:
      ---
      ${emailText}
      ---
      Return strictly valid JSON only. 
      Use this schema:

      {
        "vendorName": "",
        "vendorEmail": "",
        "totalPrice": 0,
        "deliveryDays": 0,
        "paymentTerms": "",
        "warrantyMonths": 0,
        "items": [
          { "name": "", "quantity": 0, "specs": {}, "unitPrice": 0 }
        ],
        "notes": ""
      }

      Rules:
      - Extract the vendor name and email if mentioned.
      - For paymentTerms, use only one of: "Net 30", "Net 45", "Advance Payment", "Prepaid", "Other".
      - If a field is not specified, leave it as empty string or 0 for numbers.
      - Do not include markdown, explanations, or extra text.
    `;

    const result = await geminiModel.generateContent(prompt);
    const textContent = await result.response.text();
    const cleanText = textContent.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("LLM returned invalid JSON:", textContent);
      throw new ErrorResponse(`Invalid JSON from LLM: ${parseError.message}`);
    }
  });

const generateRecommendation = async (rfpData, proposalsData) =>
  retry(async () => {
    const prompt = `
      You are a procurement expert. Analyze the following RFP and Vendor Proposals to recommend the best vendor.
      
      RFP Details:
      Title: ${rfpData.title}
      Budget: $${rfpData.budgetTotal}
      Required Delivery: ${rfpData.deliveryDays} days
      Required Warranty: ${rfpData.warrantyMonths} months

      Vendor Proposals:
      ${JSON.stringify(proposalsData, null, 2)}

      Task:
      1. Compare vendors based on Price, Delivery, Warranty, and overall value.
      2. Select the ONE best vendor.
      3. Provide a clear, professional rationale (2-3 sentences max).

      Return strictly valid JSON only:
      {
        "recommendedVendorId": "ID_OF_BEST_VENDOR",
        "rationale": "Markdown formatted rationale explaining why this vendor was chosen..."
      }
    `;

    const result = await geminiModel.generateContent(prompt);
    const textContent = await result.response.text();
    const cleanText = textContent.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("LLM returned invalid JSON:", textContent);
      throw new ErrorResponse(`Invalid JSON from LLM: ${parseError.message}`);
    }
  });

module.exports = {
  humanTextToData,
  parseVendorProposal,
  generateRecommendation,
};
