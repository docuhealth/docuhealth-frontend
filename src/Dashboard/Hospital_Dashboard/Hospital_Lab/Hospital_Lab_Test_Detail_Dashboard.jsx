import { useLocation, useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { ArrowLeft, Printer, Download } from "lucide-react";

const statusStyles = {
  "Pending Test":   { label: "Pending",     color: "text-amber-500" },
  "In-progress":    { label: "In-progress",  color: "text-amber-500" },
  "Completed test": { label: "Completed",    color: "text-green-600" },
  "Rejected test":  { label: "Rejected",     color: "text-red-500"   },
};

const specimenMap = {
  "Malaria/Typhoid Test":  "Urine",
  "Full Blood Count":      "Blood (EDTA)",
  "Liver Function Test":   "Blood (Plain)",
  "Blood Glucose":         "Blood (Fluoride)",
  "Thyroid Function Test": "Blood (Plain)",
  "Widal Test":            "Blood (Plain)",
  "Hepatitis B Screen":    "Blood (Plain)",
  "Electrolytes & Urea":   "Blood (Plain)",
  "Urinalysis":            "Urine",
  "Malaria RDT":           "Blood",
  "HIV Screening":         "Blood",
  "Kidney Function Test":  "Blood (Plain)",
  "Blood Culture":         "Blood",
  "Sputum Culture":        "Sputum",
};

const noteText =
  "Axial CT images of the chest were obtained without intravenous contrast, from the lung apices through the diaphragm, using a 64-slice multidetector CT scanner. Images were reconstructed in 1.25 mm and 5 mm slices in the axial, coronal, and sagittal planes.";

const dummyResultGroups = [
  {
    title: "Typhoid Fever (Widal Test)",
    rows: [
      { test: "Salmonella Typhi O",  result: "1:80", reference: "<1:160", status: "Negative" },
      { test: "Salmonella Typhi H",  result: "1:80", reference: "<1:160", status: "Negative" },
      { test: "Salmonella Paratyphi A", result: "1:160", reference: "<1:160", status: "Positive" },
      { test: "Salmonella Paratyphi B", result: "1:80", reference: "<1:160", status: "Negative" },
    ],
  },
  {
    title: "Malaria Parasite Test",
    rows: [
      { test: "Malaria Microscopy", result: "No parasites seen", reference: "No parasites seen", status: "Negative" },
      { test: "Malaria RDT",        result: "No parasites seen", reference: "No parasites seen", status: "Negative" },
    ],
  },
];

const interpretationPoints = [
  "Typhoid Fever (Widal Test): All antibody titers (Salmonella Typhi and Paratyphi) are below the significant threshold of 1:160, indicating no serologic evidence of active typhoid fever.",
  "Malaria Parasite Test: Both microscopy and RDT are negative, showing no evidence of malaria parasitemia.",
];

const clinicalCorrelationPoints = [
  "Negative results for typhoid and malaria suggest that the patient's symptoms (e.g., fever, malaise) may be due to another etiology. Consider further diagnostic evaluation for other infectious or non-infectious causes.",
  "Widal test results should be interpreted cautiously, as low titers may occur in endemic areas without active infection. Clinical history and repeat testing may be warranted if symptoms persist.",
];

const rejectionReason =
  "Typhoid Fever (Widal Test): All antibody titers (Salmonella Typhi and Paratyphi) are below the significant threshold of 1:160, indicating no serologic evidence of active typhoid fever.";

/* ─── helpers ─── */
const PatientInfoCard = ({ order, isCompleted, isRejected }) => {
  const requestedBy = order.requestedBy ?? "Dr. Lois David";
  const email       = order.email       ?? "lab@hospital.com";
  const age         = order.age         ?? "30 years";
  const gender      = order.gender      ?? "Male";
  const dateLabel   = isCompleted || isRejected ? "Date/Time uploaded" : "Date/Time requested:";

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-[#1B2B40]">{order.name}</p>
          <p className="text-xs text-gray-500">Patient HIN: {order.hin}</p>
          <p className="text-xs text-gray-500">Age: {age}</p>
          <p className="text-xs text-gray-500">Gender: {gender}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Requested by:</p>
          <p className="text-sm font-bold text-[#1B2B40]">{requestedBy}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Provider information:</p>
          <p className="text-sm font-bold text-[#1B2B40]">{order.hospital}</p>
          <p className="text-xs text-gray-500">Email: {email}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">{dateLabel}</p>
          <p className="text-sm font-semibold text-[#1B2B40]">{order.datetime}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── main component ─── */
const Hospital_Lab_Test_Detail_Dashboard = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const order = state?.order ?? {
    name:     "Amara Okafor",
    hin:      "12456********",
    test:     "Malaria/Typhoid Test",
    hospital: "Lagos General Hospital",
    datetime: "30th, May., 2026/ 9:45 AM",
    tab:      "Pending Test",
  };

  const status       = statusStyles[order.tab] ?? statusStyles["Pending Test"];
  const specimen     = specimenMap[order.test]  ?? "Blood";
  const isPending    = order.tab === "Pending Test";
  const isInProgress = order.tab === "In-progress";
  const isCompleted  = order.tab === "Completed test";
  const isRejected   = order.tab === "Rejected test";

  const headerLabel = isCompleted || isRejected ? "Lab result" : "Test";

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      {/* ── Top bar ── */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#3E4095] transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          {headerLabel}
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <p className="text-xs sm:text-sm font-medium text-gray-700">
            Status:{" "}
            <span className={`font-semibold ${status.color}`}>{status.label}</span>
          </p>

          {/* Pending */}
          {isPending && (
            <>
              <button className="border border-red-400 text-red-500 text-xs font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-red-50 transition-colors">
                Reject request
              </button>
              <button className="border border-[#3E4095] text-[#3E4095] text-xs font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-indigo-50 transition-colors">
                Accept request
              </button>
            </>
          )}

          {/* In-progress */}
          {isInProgress && (
            <button
              onClick={() => navigate("/hospital-lab-upload-result", { state: { order } })}
              className="bg-[#3E4095] text-white text-xs font-medium px-4 sm:px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Upload test result
            </button>
          )}

          {/* Completed / Rejected */}
          {(isCompleted || isRejected) && (
            <>
              <button className="flex items-center gap-2 border border-gray-300 text-gray-600 text-xs font-medium px-3 sm:px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
                <Printer size={13} /> Print out
              </button>
              <button className="flex items-center gap-2 border border-gray-300 text-gray-600 text-xs font-medium px-3 sm:px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
                <Download size={13} /> Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Patient info card (all tabs) ── */}
      <PatientInfoCard order={order} isCompleted={isCompleted} isRejected={isRejected} />

      {/* ── PENDING: test details ── */}
      {isPending && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Test requested:</p>
            <p className="text-sm font-semibold text-teal-600">{order.test}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Specimen needed:</p>
            <p className="text-sm font-semibold text-[#3E4095]">{specimen}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Note:</p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{noteText}</p>
          </div>
        </div>
      )}

      {/* ── IN-PROGRESS: test details (no specimen) ── */}
      {isInProgress && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Test requested</p>
            <p className="text-sm font-semibold text-teal-600">{order.test}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Note:</p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{noteText}</p>
          </div>
        </div>
      )}

      {/* ── COMPLETED: result tables + interpretation ── */}
      {isCompleted && (
        <>
          {dummyResultGroups.map((group, gi) => (
            <div key={gi} className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
              <p className="text-xs sm:text-sm font-semibold text-[#1B2B40] mb-4">{group.title}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[420px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="pb-3 pr-4 font-medium text-xs sm:text-sm">Test</th>
                      <th className="pb-3 pr-4 font-medium text-xs sm:text-sm">Result</th>
                      <th className="pb-3 pr-4 font-medium text-xs sm:text-sm">Reference range</th>
                      <th className="pb-3 font-medium text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {group.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td className="py-3 pr-4 text-xs sm:text-sm text-gray-600">{row.test}</td>
                        <td className="py-3 pr-4 text-xs sm:text-sm text-gray-600">{row.result}</td>
                        <td className="py-3 pr-4 text-xs sm:text-sm text-gray-500">{row.reference}</td>
                        <td className={`py-3 text-xs sm:text-sm font-medium ${row.status === "Positive" ? "text-green-600" : "text-red-500"}`}>
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Interpretation + Clinical correlation */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-5">
            <div>
              <p className="text-xs text-gray-500 mb-2">Interpretation:</p>
              <ol className="list-decimal list-inside flex flex-col gap-2">
                {interpretationPoints.map((pt, i) => (
                  <li key={i} className="text-xs sm:text-sm text-gray-600 leading-relaxed">{pt}</li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Clinical correlation:</p>
              <ol className="list-decimal list-inside flex flex-col gap-2">
                {clinicalCorrelationPoints.map((pt, i) => (
                  <li key={i} className="text-xs sm:text-sm text-gray-600 leading-relaxed">{pt}</li>
                ))}
              </ol>
            </div>
          </div>
        </>
      )}

      {/* ── REJECTED: reason card ── */}
      {isRejected && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
          <p className="text-xs sm:text-sm font-semibold text-red-500 mb-2">Reason for rejection (note):</p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{rejectionReason}</p>
        </div>
      )}
    </>
  );
};

export default Hospital_Lab_Test_Detail_Dashboard;
