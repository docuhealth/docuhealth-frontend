import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchPharmacistTrend = async ({ queryKey }) => {
    const [_key, period] = queryKey;
    const response = await axiosInstanceHos.get(`/api/pharmacy/orders/trend?period=${period.toLowerCase()}`);
    return response.data;
};
