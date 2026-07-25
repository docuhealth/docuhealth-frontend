import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchPharmacistTrend = async ({ queryKey }) => {
    const [_key, period] = queryKey;
    const response = await axiosInstanceHos.get(`/api/pharmacy/orders/trend?period=${period.toLowerCase()}`);
    return response.data;
};
