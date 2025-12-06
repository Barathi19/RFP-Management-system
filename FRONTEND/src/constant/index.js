export const API_BASE_URL = import.meta.env.API_BASE_URL || "http://localhost:4000/api";

export const API_ENDPOINTS = {
    rfp: "/rfp",
    rfpGenerate: "/rfp/generate",
    vendor: "/vendor",
    proposal: "/proposal",
    getProposalByRFPId: "/proposal/rfp",
};
