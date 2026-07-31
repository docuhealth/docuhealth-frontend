import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchPatientVitalSigns = async ({ queryKey }) => {
    const [_key, hin, page, search] = queryKey;
    const pageSize = 7;
    let url = `api/nurses/${hin}/vital-signs?page=${page}&size=${pageSize}`;
    if (search) url += `&search=${search}`;
    const res = await axiosInstanceHos.get(url);

    return res.data;
};
