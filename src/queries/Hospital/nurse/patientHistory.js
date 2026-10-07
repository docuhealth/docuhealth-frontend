import axiosInstanceHos from "../../../lib/axios/hospital";

// Walks every page so a discharged stay can be filtered client-side (the APIs only filter by patient)
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

export const fetchAllSharedSoapNotes = (hin) => fetchAllPages(`api/nurses/${hin}/shared-soap-notes`);

export const fetchAllPatientVitalSigns = (hin) => fetchAllPages(`api/nurses/${hin}/vital-signs`);

export const fetchPatientAdmissionNotes = (hin) => fetchAllPages(`api/records/patients/${hin}/admission-notes`);

export const isWithinStay = (dateString, stayWindow) => {
    if (!stayWindow) return true;
    const t = new Date(dateString).getTime();
    return t >= new Date(stayWindow.start).getTime() && t <= new Date(stayWindow.end).getTime();
};
