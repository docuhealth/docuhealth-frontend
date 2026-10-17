export const RESULT_TABS = [
  { key: "scan", label: "Scan results" },
  { key: "lab", label: "Lab results" },
];

export const maskHIN = (hin) => {
  if (!hin) return "—";
  return hin.length >= 6 ? `${hin.slice(0, 4)}••••${hin.slice(-2)}` : hin;
};
export const formatOrderStatus = (status) => {
  if (!status) return { label: "N/A", className: "text-gray-500" };
  switch (status) {
    case "result_accepted_by_doctor":
    case "completed":
      return { label: "Doctor Approved", className: "text-docuhealth-green" };
    case "result_accepted_by_lab_admin":
      return { label: "Lab Admin Approved", className: "text-indigo-600" };
    case "result_ready":
      return { label: "Result Ready", className: "text-blue-600" };
    case "sample_collected":
      return { label: "Sample Collected", className: "text-blue-600" };
    case "in_progress":
      return { label: "In Progress", className: "text-amber-600" };
    case "rejected":
      return { label: "Rejected", className: "text-red-500" };
    case "pending":
    default:
      return { label: status.replace(/_/g, " "), className: "text-gray-600" };
  }
};

export const formatApprovalStatus = (resultStatus, orderStatus) => {
  if (
    resultStatus === "approved" ||
    resultStatus === "accepted" ||
    orderStatus === "result_accepted_by_doctor"
  ) {
    return { label: "Approved", className: "text-docuhealth-green" };
  }
  if (
    resultStatus === "rejected" ||
    resultStatus === "lab_admin_rejected" ||
    orderStatus === "rejected"
  ) {
    return { label: "Rejected", className: "text-red-500" };
  }
  if (
    resultStatus === "lab_admin_approved" ||
    orderStatus === "result_accepted_by_lab_admin"
  ) {
    return { label: "Awaiting Doctor Approval", className: "text-amber-500" };
  }
  if (resultStatus === "pending") {
    return { label: "Pending Lab Admin", className: "text-amber-500" };
  }
  return {
    label: resultStatus ? resultStatus.replace(/_/g, " ") : "Pending",
    className: "text-amber-500",
  };
};

// lab_admin_approved = waiting for the doctor; accepted / rejected = already reviewed by the doctor.
// Results still with the lab (pending, lab_admin_rejected) never reach the doctor.
export const DOCTOR_RESULT_STATUSES = ["lab_admin_approved", "accepted", "rejected"];

// Flattens doctor-test-orders into one row per test the doctor can see, awaiting-doctor first
export const flattenDoctorLabResults = (orders = []) => {
  const rows = orders.flatMap((order) =>
    (order.items_info || [])
      .filter((item) => DOCTOR_RESULT_STATUSES.includes(item.result_info?.status))
      .map((item) => ({
        ...item,
        order_sqid: order.sqid,
        patient_info: order.patient_info,
        hospital_info: order.hospital_info,
        ordered_by_info: order.ordered_by_info,
      }))
  );
  const awaiting = rows.filter((r) => r.result_info.status === "lab_admin_approved");
  const reviewed = rows.filter((r) => r.result_info.status !== "lab_admin_approved");
  return [...awaiting, ...reviewed];
};
