const mongoose = require("mongoose");

const ParsedResponseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number },
  specs: { type: mongoose.Schema.Types.Mixed },
  price: { type: Number },
});

const ParsedResponseSchema = new mongoose.Schema({
  items: [ParsedResponseItemSchema],
  totalPrice: Number,
  deliveryDays: Number,
  paymentTerms: String,
  warrantyMonths: Number,
  notes: String,
});

const ProposalSchema = new mongoose.Schema({
  rfpId: { type: mongoose.Schema.Types.ObjectId, ref: "RFP", required: true },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  messageId: { type: String, required: true },
  rawEmail: { type: String, required: true },
  parsedResponse: {
    type: ParsedResponseSchema,
    required: true,
  },
}, {
  timestamps: true
});

const Proposal = mongoose.model("proposal", ProposalSchema);

module.exports = Proposal;
