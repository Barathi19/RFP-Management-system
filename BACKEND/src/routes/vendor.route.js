const express = require("express");
const validator = require("../middleware/validator");
const vendorController = require("../controller/vendor.controller");
const vendorValidate = require("../validate/vendor.validate");

const vendorRouter = express.Router();

vendorRouter
  .post(
    "/",
    validator(vendorValidate.createVendor),
    vendorController.createVendor
  )
  .get("/", vendorController.getAllVendor);

module.exports = vendorRouter;
