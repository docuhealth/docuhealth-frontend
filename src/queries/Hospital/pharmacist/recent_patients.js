import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchPharmacistRecentPatients = async ({ queryKey }) => {
    const [_key, page, days] = queryKey;
    const url = `/api/pharmacy/patients/recent?page=${page}${days ? `&days=${days}` : ''}`;
    const response = await axiosInstanceHos.get(url);
    return response.data;
};
