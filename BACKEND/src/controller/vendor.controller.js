const asynHandler = require("../middleware/asyn");
const Vendor = require("../models/vendor.model");

const createVendor = asynHandler(async (req, res) => {
  const { body } = req;
  const newVendor = new Vendor(body);
  await newVendor.save();

  res.status(201).json({
    success: true,
    message: "Vendor created successfully.",
    data: newVendor.toJSON(),
  });
});

const getAllVendor = asynHandler(async (_, res) => {
  const allVendors = await Vendor.find({});

  return res.json({ success: true, data: allVendors });
});

module.exports = { getAllVendor, createVendor };
