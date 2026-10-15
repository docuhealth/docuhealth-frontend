import axiosInstanceHos from "../../lib/axios/hospital";

// Walks every page of a paginated list (size 100 is the backend maximum)
const fetchAllPages = async (url) => {
    const results = [];
    let page = 1;
    while (true) {
        const res = await axiosInstanceHos.get(`${url}${url.includes("?") ? "&" : "?"}page=${page}&size=100`);
        const data = res.data;
        if (Array.isArray(data)) return data;
        results.push(...(data?.results || []));
        if (!data?.next) return results;
        page += 1;
    }
};

export const fetchPatientInfo = async (hin) => (await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`)).data;

// Everything recorded during one stay or visit, oldest first (backend order, do not re-sort)
export const fetchEncounterRecords = ({ kind, sqid }) =>
    fetchAllPages(`api/records/${kind === "admission" ? "admissions" : "check-ins"}/${sqid}/records`);

// A patient's discharged stays and closed visits, for the stay/visit picker
export const fetchPatientDischargedEncounters = async (hin) => {
    const [stays, visits] = await Promise.all([
        fetchAllPages("api/hospitals/patients?status=inpatient_discharge"),
        fetchAllPages("api/hospitals/patients?status=outpatient_discharge"),
    ]);
    const mine = (rows, kind) => rows
        .filter((r) => r?.patient_info?.hin === hin)
        .map((r) => ({ kind, row: r, endedAt: r.discharge_date || r.closed_at }));
    return [...mine(stays, "admission"), ...mine(visits, "check_in")]
        .sort((a, b) => new Date(b.endedAt || 0) - new Date(a.endedAt || 0));
};
