import axiosInstanceHos from "../../../lib/axios/hospital";

// Every drug record for one patient (orders, nurse drug chart, medication
// tasks, discharge medicines, across stays and visits). The activity feed is
// scoped to the HIN server-side and lists each one as a `DrugRecord` row;
// the event detail holds the drug itself. Doctor-only (nurses get 403).
export const fetchMedicationHistory = async ({ queryKey }) => {
  const [, hin] = queryKey;
  if (!hin) return [];

  const rows = [];
  for (let page = 1; ; page += 1) {
    const { data } = await axiosInstanceHos.get(
      `api/doctors/patient/activities/${hin}?size=100&page=${page}`,
    );
    rows.push(...(data?.results || []));
    if (!data?.next) break;
  }

  const drugRows = rows.filter((row) => row.record?.type === "DrugRecord");
  const details = await Promise.all(
    drugRows.map((row) =>
      axiosInstanceHos
        .get(`api/records/events/${row.sqid}`)
        .then((res) => res.data)
        // An event whose record is gone 404s; leave just that one out. Any other
        // failure fails the tab, so a slow network never reads as "no drugs".
        .catch((err) => {
          if (err?.response?.status === 404) return null;
          throw err;
        }),
    ),
  );

  return drugRows
    .map((event, i) => ({ event, drug: details[i] }))
    // Order-made records have `patient_info: null`; any record that names a patient must name this one.
    .filter(({ drug }) => drug && (!drug.patient_info?.hin || drug.patient_info.hin === hin))
    .sort((a, b) => new Date(b.event.created_at) - new Date(a.event.created_at));
};
