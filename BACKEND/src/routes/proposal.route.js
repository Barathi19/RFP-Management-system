const express = require("express");
const validator = require("../middleware/validator");
const proposalController = require("../controller/proposal.controller");
const proposalValidate = require("../validate/proposal.validate");

const proposalRouter = express.Router();

proposalRouter
  .get(
    "/:id",
    validator(proposalValidate.getProposalDetail),
    proposalController.getProposalDetail
  )
  .get(
    "/rfp/:id",
    validator(proposalValidate.getProposalDetail),
    proposalController.getProposal
  )
  .get(
    "/rfp/:id/recommend",
    validator(proposalValidate.getProposalDetail),
    proposalController.recommendVendor
  );

module.exports = proposalRouter;
