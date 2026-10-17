const TARGET_LABELS = {
  lab_test_order: "Lab test order",
  lab_test_order_item: "Lab test",
  lab_test_result: "Lab test result",
  scan_result: "Scan result",
};

export const FIELD_LABELS = {
  status: "Status",
  aggregate_status: "Overall status",
  specimen_collected_at: "Sample collection time",
  rejection_reason: "Rejection reason",
  interpretation: "Interpretation",
  clinical_correlation: "Clinical correlation",
  comments: "Comments",
  note: "Note",
};

export const humanize = (key = "") => {
  const s = key.replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
};

export const targetLabel = (type) => TARGET_LABELS[type] || humanize(type) || "Record";
export const fieldLabel = (field) => FIELD_LABELS[field] || humanize(field);

export const personName = (p) => `${p?.firstname || ""} ${p?.lastname || ""}`.trim();

// Test names on a result snapshot; results carry parameter names, not the test name
export const resultTestNames = (state) =>
  (state?.parameters_info || []).map((p) => p.parameter_info?.name).filter(Boolean);
