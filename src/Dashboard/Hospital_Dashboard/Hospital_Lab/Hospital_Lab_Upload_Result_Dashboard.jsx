import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { ArrowLeft, Save } from "lucide-react";
import ConfirmUploadModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/ConfirmUploadModal";
import SuccessModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/SuccessModal";
import toast from "react-hot-toast";
import { submitTestResult } from "../../../queries/Hospital/lab/requests";

const getRefRange = (p) => {
  if (p.ref_text) return p.ref_text;
  if (p.ref_low != null && p.ref_high != null) return `${p.ref_low} – ${p.ref_high}`;
  return "—";
};

const Hospital_Lab_Upload_Result_Dashboard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;
  const item = state?.item;

  const parameters = useMemo(
    () => item?.test_info?.parameters ?? [],
    [item]
  );

  const [paramValues, setParamValues]       = useState({});
  const [interpretation, setInterpretation] = useState("");
  const [clinicalCorrelation, setClinical]  = useState("");
  const [comments, setComments]             = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const submitMutation = useMutation({ mutationFn: submitTestResult });

  const handleConfirmUpload = async () => {
    const payload = {
      item: item?.sqid,
      parameters: parameters.map((p) => ({
        parameter: p.sqid,
        value: String(paramValues[p.sqid] ?? ""),
      })),
      comments,
      interpretation,
      clinical_correlation: clinicalCorrelation,
    };
    try {
      await submitMutation.mutateAsync({ order_sqid: order?.id, item_sqid: item?.sqid, payload });
      setShowConfirm(false);
      setShowSuccess(true);
    } catch {
      toast.error("Failed to upload result. Please try again.");
      setShowConfirm(false);
    }
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
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-docuhealth-primary transition-colors"
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
            {item?.test_info?.name && (
              <span className="ml-2 text-xs font-normal text-teal-600">({item.test_info.name})</span>
            )}
          </p>

          {parameters.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">
              No parameters defined for this test
            </p>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
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
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-docuhealth-primary transition-colors"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {parameters.map((p) => (
                  <div key={p.sqid} className="p-4 flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Parameter</p>
                      <p className="text-sm text-gray-700 font-medium">{p.name}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Unit</p>
                        <p className="text-sm text-gray-500">{p.unit || "—"}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Ref Range</p>
                        <p className="text-sm text-gray-500">{getRefRange(p)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Result value</p>
                      <input
                        type="text"
                        placeholder="Enter value"
                        value={paramValues[p.sqid] ?? ""}
                        onChange={(e) =>
                          setParamValues((prev) => ({ ...prev, [p.sqid]: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-docuhealth-primary transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
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
            className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-700 outline-none resize-none transition-colors ${attempted && !interpretation.trim() ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-docuhealth-primary"}`}
          />
          {attempted && !interpretation.trim() && (
            <p className="text-xs text-red-500">Interpretation is required.</p>
          )}
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
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-docuhealth-primary resize-none transition-colors"
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
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-docuhealth-primary resize-none transition-colors"
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 pt-2">
          <button className="flex items-center justify-center gap-2 border border-docuhealth-primary text-docuhealth-primary text-sm font-medium px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-colors">
            <Save size={14} /> Save as draft
          </button>
          <button
            onClick={() => { setAttempted(true); if (interpretation.trim()) setShowConfirm(true); }}
            className="bg-docuhealth-primary border border-transparent text-white text-sm font-medium px-8 py-2.5 rounded-full hover:bg-indigo-700 transition-colors text-center"
          >
            Upload result
          </button>
        </div>

      </div>

      <ConfirmUploadModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmUpload}
        isPending={submitMutation.isPending}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => { setShowSuccess(false); navigate(-2); }}
      />
    </>
  );
};

export default Hospital_Lab_Upload_Result_Dashboard;
