import axiosInstanceHos from "../../../lib/axios/hospital";

// Wired to the reworked `api/radiology/*` API (2026-09-24): one paginated item list filtered by `status`, PATCH-only item actions, and results that a doctor approves unless the order was a walk-in.

export const RESULT_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"];

const ageFromDob = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
};

const mapPatient = (p = {}) => ({
  firstname: p.firstname,
  lastname: p.lastname,
  hin: p.hin,
  sex: p.gender,
  age: ageFromDob(p.dob),
  // Not part of the real patient_info shape, no payment-category concept on this endpoint's response.
  payment_category: null,
});

// New results store one plain string (entries joined by newlines); rows migrated from the old API hold a JSON-stringified array.
export const toLines = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Plain text, split below.
  }
  return String(raw)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

export const mapScanResult = (result) => {
  if (!result) return null;
  return {
    sqid: result.sqid,
    status: result.status,
    rejection_reason: result.rejection_reason || null,
    clinicalIndication: toLines(result.clinical_indication),
    findings: result.findings || [],
    impression: result.impression || [],
    recommendations: result.recommendation || [],
    extraComment: result.extra_comment || null,
    reporter: result.reporter_name,
    specialty: result.reporter_specialty,
    reported_at: result.reported_at,
    created_at: result.created_at,
  };
};

export const mapAttachments = (result) => {
  if (!result) return [];
  // `contentType` carries the API's own metadata: files uploaded before the storage fix are still served as text/plain, so the detail page must not trust the type of a re-fetched blob.
  return (result.attachments || []).map((a) => ({
    name: a.filename,
    kind: a.content_type?.startsWith("image/") ? "image" : "document",
    contentType: a.content_type,
    date: result.created_at,
    url: a.url,
  }));
};

// The approved result wins; otherwise the newest attempt (a rejected one stays visible until a fresh upload replaces it).
const pickResult = (results = []) =>
  results.find((r) => r.status === "approved") ||
  [...results].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] ||
  null;

// Maps a raw ScanOrderItem to the record shape the Scan Requests/Detail UI expects. Rows migrated from the old API have `scan_info: null`.
export const mapScanOrderItem = (item) => {
  const order = item.order_info || {};
  const orderedBy = order.ordered_by_info;
  const result = pickResult(item.results);
  return {
    sqid: item.sqid,
    patient_info: mapPatient(order.patient_info),
    scan_type: item.scan_info?.name || "Scan details unavailable",
    note: null,
    status: item.status,
    order_source: order.order_source,
    hospital_info: order.hospital_info,
    requested_by: orderedBy
      ? `${orderedBy.role === "doctor" ? "Dr. " : ""}${orderedBy.firstname || ""} ${orderedBy.lastname || ""}`.trim()
      : "—",
    created_at: item.created_at,
    image_collected_at: item.image_collected_at || null,
    report: mapScanResult(result),
    attachments: mapAttachments(result),
    rejection_reason: item.rejection_reason || null,
  };
};

// Scan catalog search; the API allows 60 requests a minute, so callers debounce and only search from 2 characters.
export const fetchRadiologyScans = async ({ queryKey }) => {
  const [, query] = queryKey;
  const res = await axiosInstanceHos.get(`api/radiology/scans?query=${encodeURIComponent((query || "").trim())}`);
  return res.data || [];
};

// Which link an order needs depends on its source (check_in / admission / appointment); walk_in takes none.
export const createScanOrder = async ({ patient, order_source, check_in, appointment, admission, items }) => {
  const payload = { patient, order_source, items };
  if (check_in) payload.check_in = check_in;
  if (appointment) payload.appointment = appointment;
  if (admission) payload.admission = admission;
  const res = await axiosInstanceHos.post("api/radiology/orders", payload);
  return res.data;
};

export const acceptScanOrderItem = async ({ sqid }) => {
  const res = await axiosInstanceHos.patch(`api/radiology/orders/items/${sqid}/accept`);
  return mapScanOrderItem(res.data);
};

export const rejectScanOrderItem = async ({ sqid, rejection_reason }) => {
  const res = await axiosInstanceHos.patch(`api/radiology/orders/items/${sqid}/reject`, { rejection_reason });
  return mapScanOrderItem(res.data);
};

// One-way: an image-collected item can no longer be edited or rejected.
export const logImageCollection = async ({ sqid, image_collected_at }) => {
  const res = await axiosInstanceHos.patch(`api/radiology/orders/items/${sqid}/collection-time`, { image_collected_at });
  return mapScanOrderItem(res.data);
};

export const uploadScanResult = async ({
  order_item,
  clinical_indication,
  findings,
  impression,
  recommendation,
  reporter_name,
  reporter_specialty,
  reported_at,
  extra_comment,
  files,
}) => {
  const formData = new FormData();
  formData.append("order_item", order_item);
  formData.append("clinical_indication", clinical_indication);
  formData.append("findings", JSON.stringify(findings || []));
  formData.append("impression", JSON.stringify(impression || []));
  formData.append("recommendation", JSON.stringify(recommendation || []));
  formData.append("reporter_name", reporter_name);
  formData.append("reporter_specialty", reporter_specialty);
  formData.append("reported_at", reported_at);
  if (extra_comment) formData.append("extra_comment", extra_comment);
  (files || []).forEach((file) => formData.append("attachments", file));

  const res = await axiosInstanceHos.post("api/radiology/results", formData);
  // "approved" means a walk-in order (item completed on the spot); "pending" waits for the ordering doctor.
  return { report: mapScanResult(res.data), attachments: mapAttachments(res.data), resultStatus: res.data.status };
};

// The list takes `status` and `search` server-side; sorting and paging stay client-side since ordering is fixed newest-first.
export const fetchRadiologyScanRequests = async ({ queryKey }) => {
  const [, status, page = 1, ordering = "-created_at", search = ""] = queryKey;
  const params = new URLSearchParams({ status, size: "100" });
  if (search.trim()) params.set("search", search.trim());
  const res = await axiosInstanceHos.get(`api/radiology/orders/items?${params.toString()}`);
  const allItems = (res.data?.results || []).map(mapScanOrderItem);

  const sorted = [...allItems].sort((a, b) => {
    const diff = new Date(a.created_at) - new Date(b.created_at);
    return ordering === "created_at" ? diff : -diff;
  });

  const count = sorted.length;
  const pageSize = 6;
  const start = (page - 1) * pageSize;
  const results = sorted.slice(start, start + pageSize);

  return { results, count };
};
