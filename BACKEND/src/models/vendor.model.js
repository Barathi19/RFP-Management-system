const mongoose = require("mongoose");
const { REGEX } = require("../constant");

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required."] },
    contactName: {
      type: String,
      required: [true, "Contact name is required."],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      match: [REGEX.email, "Invalid email."],
      required: [true, "Email is required"],
    },
    mobile: {
      type: String,
      trim: true,
      match: [REGEX.mobile, "Invalid mobile number."],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
    },
    note: {
      type: String,
      default: null
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", VendorSchema);

module.exports = Vendor;
