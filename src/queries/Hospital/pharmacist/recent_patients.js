import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchPharmacistRecentPatients = async ({ queryKey }) => {
    const [_key, page, size, search] = queryKey;
    const url = `/api/pharmacy/patients/recent?page=${page}&size=${size}${search ? `&search=${search}` : ''}`;
    const response = await axiosInstanceHos.get(url);
    return response.data;
};
