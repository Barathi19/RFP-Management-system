const express = require("express");
const rfpController = require("../controller/rfp.controller");
const validator = require("../middleware/validator");
const rfpValidate = require("../validate/rfp.validate");

const rfpRouter = express.Router();

rfpRouter
  .get("/", rfpController.getAllRFP)
  .post("/generate", validator(rfpValidate.generateRFP), rfpController.generateRFPPreview)
  .post("/", validator(rfpValidate.createRFP), rfpController.createRFP)
  .post("/:id/send", validator(rfpValidate.sendRFP), rfpController.sendRFP)
  .get("/:id", validator(rfpValidate.getRFPDetail), rfpController.getRFPDetail)
  .delete("/:id", validator(rfpValidate.getRFPDetail), rfpController.deleteRFP);

module.exports = rfpRouter;
