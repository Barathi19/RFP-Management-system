import apiInstance from "../api/instance";
import { API_ENDPOINTS } from "../constant";

export const GetProposalsByRFPId = async (rfpId) => {
    const response = await apiInstance.get(`${API_ENDPOINTS.getProposalByRFPId}/${rfpId}`);
    return response.data;
};

export const GetProposalRecommendation = async (rfpId) => {
    const response = await apiInstance.get(`${API_ENDPOINTS.getProposalByRFPId}/${rfpId}/recommend`);
    return response.data;
};