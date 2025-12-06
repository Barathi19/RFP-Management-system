import apiInstance from "../api/instance";
import { API_ENDPOINTS } from "../constant";

export const GenerateRFP = async (data) => {
    const response = await apiInstance.post(API_ENDPOINTS.rfpGenerate, data);
    return response.data;
};

export const CreateRFP = async (rfpData) => {
    const response = await apiInstance.post(API_ENDPOINTS.rfp, rfpData);
    return response.data;
};

export const GetAllRFP = async () => {
    const response = await apiInstance.get(API_ENDPOINTS.rfp);
    return response.data;
};

export const GetRFPById = async (id) => {
    const response = await apiInstance.get(`${API_ENDPOINTS.rfp}/${id}`);
    return response.data;
};

export const SendRFP = async (id, vendorIds) => {
    const response = await apiInstance.post(`${API_ENDPOINTS.rfp}/${id}/send`, { vendorIds });
    return response.data;
};