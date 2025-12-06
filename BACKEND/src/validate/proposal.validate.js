const { param } = require("express-validator");

const getProposalDetail = [
  param("id").isMongoId().withMessage("Invalid ObjectId"),
];

module.exports = { getProposalDetail };
