import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchPatientCaseNotes = async ({ queryKey }) => {
    const [_key, hin, page, search] = queryKey;
    const pageSize = 7;
    let url = `api/nurses/case-notes/patient/${hin}?page=${page}&size=${pageSize}`;
    if (search) url += `&search=${search}`;
    const res = await axiosInstanceHos.get(url);

    return res.data;
};
