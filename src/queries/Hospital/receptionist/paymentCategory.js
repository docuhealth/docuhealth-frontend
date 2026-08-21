import axiosInstanceHos from "../../../lib/axios/hospital";

// GET /api/receptionists/payment-providers?category=hmo|company&search=...
// queryKey: ["payment-providers", category, search?]
//
// Docs say this returns a plain array, but in practice the response comes
// back wrapped (matching every other list endpoint in this codebase, e.g.
// recentPatients/admissionRequest use `{ results: [...] }`) — normalize
// here so callers can always treat the result as an array.
export const fetchPaymentProviders = async ({ queryKey }) => {
  const [_key, category, search] = queryKey;
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  const qs = params.toString();
  const res = await axiosInstanceHos.get(
    `api/receptionists/payment-providers${qs ? `?${qs}` : ""}`,
  );
  const data = res.data;
  if (Array.isArray(data)) return data;
  return data?.results || data?.data || data?.providers || [];
};

// GET /api/receptionists/patients/<hin>/payment-category
// Not currently called from the UI — the patient-details endpoint already
// embeds `payment_provider`, so this is here for completeness/future use.
export const fetchPatientPaymentCategory = async (hin) => {
  const res = await axiosInstanceHos.get(
    `api/receptionists/patients/${hin}/payment-category`,
  );
  return res.data;
};

// PUT /api/receptionists/patients/<hin>/payment-category
// payload: { type: "hmo" | "company" | "private", provider?: sqid, member_id?: string }
export const savePatientPaymentCategory = async ({ hin, payload }) => {
  const res = await axiosInstanceHos.put(
    `api/receptionists/patients/${hin}/payment-category`,
    payload,
  );
  return res.data;
};
