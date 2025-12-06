const mongoose = require("mongoose");
const { ENUM, RFP_STATUS } = require("../constant");

const RFPItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required."],
  },
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },
});

const RFPSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
    },
    description: {
      type: String,
      default: null,
    },
    budgetTotal: {
      type: Number,
      required: [true, "Budget is required."],
    },
    deliveryDays: {
      type: Number,
      default: null,
    },
    warrantyMonths: {
      type: Number,
      default: null,
    },
    items: { type: [RFPItemSchema], required: true },
    status: {
      type: String,
      enum: ENUM.status,
      default: RFP_STATUS.created,
      required: true,
    },
    vendorIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
          required: true,
        },
      ],
      default: null,
    },
  },
  { timestamps: true }
);

const RFP = mongoose.model("RFP", RFPSchema);

module.exports = RFP;
