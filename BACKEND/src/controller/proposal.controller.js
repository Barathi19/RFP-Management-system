const asynHandler = require("../middleware/asyn");
const Proposal = require("../models/proposal.model");
const aiService = require("../service/ai.service");
const ErrorResponse = require("../utils/errorResponse");
const { fetchRFPReplies } = require("../utils/imap");

const getProposal = asynHandler(async (req, res) => {
  const { id } = req.params;

  let processedCount = 0;
  try {
    processedCount = await fetchRFPReplies(id);
  } catch (err) {
    console.error("IMAP Fetch Failed (continuing):", err.message);
  }

  const proposals = await Proposal.find({ rfpId: id })
    .populate("rfpId", "title budgetTotal status")
    .populate("vendorId", "name email contactName")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    message: `${processedCount} new replies processed`,
    count: proposals.length,
    data: proposals,
  });
});

const getRFPProposals = asynHandler(async (req, res) => {
  const { id } = req.params;

  const proposals = await Proposal.find({ rfpId: id })
    .populate("rfpId", "title budgetTotal status items")
    .populate("vendorId", "name email contactName")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    count: proposals.length,
    data: proposals,
  });
});

const getProposalDetail = asynHandler(async (req, res) => {
  const { id: proposalId } = req.params;

  const proposal = await Proposal.findById(proposalId)
    .populate("rfpId", "title budgetTotal items")
    .populate("vendorId", "name email contactName");

  if (!proposal) {
    throw new ErrorResponse("Proposal not found.", 404);
  }

  return res.json({
    success: true,
    data: proposal,
  });
});

const recommendVendor = asynHandler(async (req, res) => {
  const { id } = req.params;

  const proposals = await Proposal.find({ rfpId: id })
    .populate("rfpId")
    .populate("vendorId");

  if (!proposals.length) {
    throw new ErrorResponse("No proposals found for this RFP.", 404);
  }

  const rfpData = proposals[0].rfpId;
  const proposalData = proposals.map((p) => ({
    vendorId: p.vendorId._id,
    vendorName: p.vendorId.name,
    ...p.parsedResponse,
    scores: p.scores || {},
  }));

  const recommendation = await aiService.generateRecommendation(
    rfpData,
    proposalData
  );

  return res.json({
    success: true,
    data: {
      recommendedVendorId: recommendation.recommendedVendorId,
      rationale: recommendation.rationale,
      proposals,
    },
  });
});

module.exports = {
  getProposal,
  getRFPProposals,
  getProposalDetail,
  recommendVendor,
};
