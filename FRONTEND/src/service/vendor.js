import apiInstance from "../api/instance";
import { API_ENDPOINTS } from "../constant";

export const CreateVendor = async (vendorData) => {
    const response = await apiInstance.post(API_ENDPOINTS.vendor, vendorData);
    return response.data;
};

export const GetAllVendor = async () => {
    const response = await apiInstance.get(API_ENDPOINTS.vendor);
    return response.data;
};