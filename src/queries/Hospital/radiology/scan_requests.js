import axiosInstanceHos from "../../../lib/axios/hospital";

// Wired to the real `api/radiology/*` v2 endpoints — patient(HIN)-based order creation, status lives on each item, so accept/reject/imaging-time/upload all operate on an item sqid.

const STATUS_URL = {
  pending: "pending",
  in_progress: "in-progress",
  completed: "completed",
  rejected: "rejected",
};

// API says "in progress" (space); rest of the UI uses "in_progress" (underscore).
const normalizeStatus = (raw) => (raw === "in progress" ? "in_progress" : raw);

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
  // Not part of the real patient_info shape — no payment-category concept
  // on this endpoint's response.
  payment_category: null,
});

const mapResult = (result) => {
  if (!result) return null;
  const reportedAt =
    result.date_of_reporting && result.time_of_reporting
      ? `${result.date_of_reporting}T${result.time_of_reporting}`
      : result.created_at;
  return {
    examination: result.examinations,
    clinicalIndication: result.clinical_indication || [],
    technique: result.technique,
    findings: result.findings || [],
    impression: result.impression || [],
    recommendations: result.recommendation || [],
    reporter: result.reporter_name,
    specialty: result.reporter_specialty,
    reported_at: reportedAt,
  };
};

const mapAttachments = (result) => {
  if (!result) return [];
  // `contentType` carries the API's own metadata, not a re-fetched blob's —
  // Supabase serves every uploaded file with `content-type: text/plain`
  // regardless of the real type (confirmed live 2026-09-22), so the detail
  // page must trust this field rather than whatever the browser reports
  // after fetching the URL.
  return (result.attachments || []).map((a) => ({
    name: a.filename,
    kind: a.content_type?.startsWith("image/") ? "image" : "document",
    contentType: a.content_type,
    date: result.created_at,
    url: a.url,
  }));
};

// Maps a raw ScanOrderItem to the record shape the Scan Requests/Detail UI expects.
export const mapScanOrderItem = (item) => {
  const status = normalizeStatus(item.status);
  const requestedBy = item.requested_by_info;
  return {
    sqid: item.sqid,
    patient_info: mapPatient(item.patient_info),
    scan_type: item.type,
    modality: item.loinc_rsna_description_info?.long_common_name || item.type,
    body_part: null,
    note: null,
    status,
    hospital_info: item.hospital_info,
    requested_by: requestedBy ? `Dr. ${requestedBy.firstname || ""} ${requestedBy.lastname || ""}`.trim() : "—",
    created_at: item.created_at,
    imaging_at: item.imaging_date && item.imaging_time ? `${item.imaging_date}T${item.imaging_time}` : null,
    report: status === "completed" ? mapResult(item.result_info) : null,
    attachments: status === "completed" ? mapAttachments(item.result_info) : [],
    rejection_reason: item.rejection_note || null,
  };
};

// <2 chars returns the full catalog per the API, so only query once there's enough to narrow it.
export const fetchRadiologyTestTypes = async ({ queryKey }) => {
  const [, query] = queryKey;
  const trimmed = (query || "").trim();
  const url =
    trimmed.length >= 2 ? `api/radiology/test-types?query=${encodeURIComponent(trimmed)}` : "api/radiology/test-types";
  const res = await axiosInstanceHos.get(url);
  return res.data || [];
};

export const createScanOrder = async ({ patient, order_source, check_in, items }) => {
  const payload = { patient, order_source: order_source || "walk_in", items };
  if (check_in) payload.check_in = check_in;
  const res = await axiosInstanceHos.post("api/radiology/orders", payload);
  return res.data;
};

export const acceptScanOrderItem = async ({ sqid, imaging_date, imaging_time }) => {
  const payload = {};
  if (imaging_date && imaging_time) {
    payload.imaging_date = imaging_date;
    payload.imaging_time = imaging_time;
  }
  const res = await axiosInstanceHos.patch(`api/radiology/orders/items/${sqid}/accepted`, payload);
  return mapScanOrderItem(res.data);
};

export const rejectScanOrderItem = async ({ sqid, rejection_note }) => {
  const res = await axiosInstanceHos.patch(`api/radiology/orders/items/${sqid}/rejected`, { rejection_note });
  return mapScanOrderItem(res.data);
};

export const logImagingDateTime = async ({ sqid, imaging_date, imaging_time }) => {
  const res = await axiosInstanceHos.patch(`api/radiology/orders/items/${sqid}/imaging-date-and-time`, {
    imaging_date,
    imaging_time,
  });
  return mapScanOrderItem(res.data);
};

export const uploadScanResult = async ({
  order_item,
  clinical_indication,
  findings,
  impression,
  recommendation,
  examinations,
  technique,
  reporter_name,
  reporter_specialty,
  time_of_reporting,
  date_of_reporting,
  extra_comment,
  files,
}) => {
  const formData = new FormData();
  formData.append("order_item", order_item);
  formData.append("clinical_indication", JSON.stringify(clinical_indication || []));
  formData.append("findings", JSON.stringify(findings || []));
  formData.append("impression", JSON.stringify(impression || []));
  formData.append("recommendation", JSON.stringify(recommendation || []));
  formData.append("examinations", examinations);
  formData.append("technique", technique);
  formData.append("reporter_name", reporter_name);
  formData.append("reporter_specialty", reporter_specialty);
  formData.append("time_of_reporting", time_of_reporting);
  formData.append("date_of_reporting", date_of_reporting);
  if (extra_comment) formData.append("extra_comment", extra_comment);
  (files || []).forEach((file) => formData.append("attachments", file));

  const res = await axiosInstanceHos.post("api/radiology/results", formData);
  return { report: mapResult(res.data), attachments: mapAttachments(res.data) };
};

// List endpoints have no search/ordering params (silently ignored), so pull size=100 and do it client-side, same as doctor/appointments.js.
export const fetchRadiologyScanRequests = async ({ queryKey }) => {
  const [, status, page = 1, ordering = "-created_at", search = ""] = queryKey;
  const urlStatus = STATUS_URL[status] || "pending";
  const res = await axiosInstanceHos.get(`api/radiology/orders/items/${urlStatus}?size=100`);
  const allItems = (res.data?.results || []).map(mapScanOrderItem);

  const term = search.trim().toLowerCase();
  const matching = term
    ? allItems.filter((r) => `${r.patient_info.firstname} ${r.patient_info.lastname}`.toLowerCase().includes(term))
    : allItems;

  const sorted = [...matching].sort((a, b) => {
    const diff = new Date(a.created_at) - new Date(b.created_at);
    return ordering === "created_at" ? diff : -diff;
  });

  const count = sorted.length;
  const pageSize = 6;
  const start = (page - 1) * pageSize;
  const results = sorted.slice(start, start + pageSize);

  return { results, count };
};
