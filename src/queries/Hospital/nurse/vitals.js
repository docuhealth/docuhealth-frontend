import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchPatientVitalSigns = async ({ queryKey }) => {
    const [_key, hin, page] = queryKey;
    const pageSize = 7;
    const res = await axiosInstanceHos.get(
        `api/nurses/${hin}/vital-signs?page=${page}&size=${pageSize}`,
    );

    return res.data;
};
