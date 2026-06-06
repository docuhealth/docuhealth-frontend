import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { ArrowLeft, Save } from "lucide-react";
import ConfirmUploadModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/ConfirmUploadModal";
import SuccessModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/SuccessModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadLabResult } from "../../../queries/Hospital/lab/results";
import toast from "react-hot-toast";

const days   = Array.from({ length: 31 }, (_, i) => i + 1);
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const years  = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const times  = Array.from({ length: 24 }, (_, i) => {
  const h    = i % 12 === 0 ? 12 : i % 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${String(h).padStart(2, "0")}:00 ${ampm}`;
});

const getRefRange = (p) => {
  if (p.ref_text) return p.ref_text;
  if (p.ref_low != null && p.ref_high != null) return `${p.ref_low} – ${p.ref_high}`;
  return "—";
};

const Hospital_Lab_Upload_Result_Dashboard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;
  const queryClient = useQueryClient();

  const parameters = useMemo(
    () => order?.test_info?.parameters ?? [],
    [order]
  );

  // { [sqid]: value }
  const [paramValues, setParamValues]         = useState({});
  const [interpretation, setInterpretation]   = useState("");
  const [clinicalCorrelation, setClinical]    = useState("");
  const [comments, setComments]               = useState("");
  const [collectionDate, setCollectionDate]   = useState({ day: "", month: "", year: "", time: "" });
  const [showConfirm, setShowConfirm]         = useState(false);
  const [showSuccess, setShowSuccess]         = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (payload) => uploadLabResult(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-orders"] });
      queryClient.invalidateQueries({ queryKey: ["lab-results"] });
      setShowConfirm(false);
      setShowSuccess(true);
    },
    onError: (err) => {
      setShowConfirm(false);
      toast.error(err?.response?.data?.message || "Failed to upload result");
    },
  });

  const handleConfirmUpload = () => {
    const collDate = collectionDate.day && collectionDate.month && collectionDate.year
      ? `${collectionDate.year}-${String(months.indexOf(collectionDate.month) + 1).padStart(2, "0")}-${String(collectionDate.day).padStart(2, "0")}`
      : undefined;

    const payload = {
      order:                order?.id,
      parameters:           parameters.map((p) => ({ parameter: p.sqid, value: paramValues[p.sqid] ?? "" })),
      interpretation:       interpretation || undefined,
      clinical_correlation: clinicalCorrelation || undefined,
      comments:             comments || undefined,
      specimen_collected_at: collDate,
    };
    uploadMutation.mutate(payload);
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      {/* Top bar */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#3E4095] transition-colors"
        >
          <ArrowLeft size={16} />
          Upload test result
        </button>
      </div>

      {/* Main content */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-6">

        {/* ── Parameters table ── */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">
            Test parameters
            {order?.test && (
              <span className="ml-2 text-xs font-normal text-teal-600">({order.test})</span>
            )}
          </p>

          {parameters.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">
              No parameters defined for this test
            </p>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-xs min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold text-left">Parameter</th>
                    <th className="py-3 px-4 font-semibold text-left">Unit</th>
                    <th className="py-3 px-4 font-semibold text-left">Reference range</th>
                    <th className="py-3 px-4 font-semibold text-left min-w-[140px]">Result value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {parameters.map((p) => (
                    <tr key={p.sqid}>
                      <td className="py-3 px-4 text-gray-700 font-medium">{p.name}</td>
                      <td className="py-3 px-4 text-gray-500">{p.unit || "—"}</td>
                      <td className="py-3 px-4 text-gray-500">{getRefRange(p)}</td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Enter value"
                          value={paramValues[p.sqid] ?? ""}
                          onChange={(e) =>
                            setParamValues((prev) => ({ ...prev, [p.sqid]: e.target.value }))
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-[#3E4095] transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Interpretation ── */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700">Interpretation</p>
          <textarea
            rows={4}
            placeholder="Enter interpretation..."
            value={interpretation}
            onChange={(e) => setInterpretation(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#3E4095] resize-none transition-colors"
          />
        </div>

        {/* ── Clinical correlation ── */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700">
            Clinical correlation{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </p>
          <textarea
            rows={3}
            placeholder="Enter clinical correlation..."
            value={clinicalCorrelation}
            onChange={(e) => setClinical(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#3E4095] resize-none transition-colors"
          />
        </div>

        {/* ── Comments ── */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700">
            Comments{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </p>
          <textarea
            rows={3}
            placeholder="Enter any additional comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#3E4095] resize-none transition-colors"
          />
        </div>

        {/* ── Collection date ── */}
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">Specimen collection date</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Day</label>
              <select
                value={collectionDate.day}
                onChange={(e) => setCollectionDate((p) => ({ ...p, day: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-[#3E4095] bg-white appearance-none"
              >
                <option value="">Select day</option>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Month</label>
              <select
                value={collectionDate.month}
                onChange={(e) => setCollectionDate((p) => ({ ...p, month: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-[#3E4095] bg-white appearance-none"
              >
                <option value="">Select month</option>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Year</label>
              <select
                value={collectionDate.year}
                onChange={(e) => setCollectionDate((p) => ({ ...p, year: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-[#3E4095] bg-white appearance-none"
              >
                <option value="">Select year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1 w-full sm:max-w-xs">
            <label className="text-xs text-gray-500">Time</label>
            <select
              value={collectionDate.time}
              onChange={(e) => setCollectionDate((p) => ({ ...p, time: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-[#3E4095] bg-white appearance-none"
            >
              <option value="">Select time</option>
              {times.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 pt-2">
          <button className="flex items-center justify-center gap-2 border border-[#3E4095] text-[#3E4095] text-sm font-medium px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-colors">
            <Save size={14} /> Save as draft
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="bg-[#3E4095] text-white text-sm font-medium px-8 py-2.5 rounded-full hover:bg-indigo-700 transition-colors text-center"
          >
            Upload result
          </button>
        </div>

      </div>

      <ConfirmUploadModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmUpload}
        isPending={uploadMutation.isPending}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => { setShowSuccess(false); navigate(-2); }}
      />
    </>
  );
};

export default Hospital_Lab_Upload_Result_Dashboard;
