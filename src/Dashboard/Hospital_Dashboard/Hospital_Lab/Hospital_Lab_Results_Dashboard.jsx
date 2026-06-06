import { useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { Search, Eye } from "lucide-react";
import { LabResultsContext } from "../../../context/HospitalContext/Lab/LabResultsContext";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";

const flagColors = {
  Normal:   "bg-green-100 text-green-700",
  Abnormal: "bg-red-100 text-red-700",
};

const Hospital_Lab_Results_Dashboard = () => {
  const {
    results,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    searchQuery,
    setSearchQuery,
  } = useContext(LabResultsContext);

  const getPatient = (r) =>
    r.patient_name ||
    (r.patient ? `${r.patient.firstname || ""} ${r.patient.lastname || ""}`.trim() : "") ||
    r.patient ||
    "—";

  const getTest = (r) => r.test_name || r.test || "—";

  const getValue = (r) => r.result_value || r.value || r.result || "—";

  const getDate = (r) => {
    if (r.date) return r.date;
    const raw = r.uploaded_at || r.created_at;
    if (!raw) return "—";
    return new Date(raw).toLocaleDateString("en-CA");
  };

  const getFlag = (r) => r.flag || (r.is_abnormal ? "Abnormal" : "Normal");

  const getResultId = (r) => r.result_id || r.id || "—";

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-md p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[#1B2B40]">Lab Results</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {count} result{count !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-full sm:w-auto">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search patient or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs text-gray-600 bg-transparent outline-none flex-1 sm:w-44"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No results found</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-semibold">Result ID</th>
                    <th className="pb-3 pr-4 font-semibold">Patient</th>
                    <th className="pb-3 pr-4 font-semibold">Test Type</th>
                    <th className="pb-3 pr-4 font-semibold">Result / Value</th>
                    <th className="pb-3 pr-4 font-semibold">Date</th>
                    <th className="pb-3 pr-4 font-semibold">Flag</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.map((res) => {
                    const flag = getFlag(res);
                    return (
                      <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 text-gray-400 font-mono">{getResultId(res)}</td>
                        <td className="py-3 pr-4 font-medium text-[#1B2B40]">{getPatient(res)}</td>
                        <td className="py-3 pr-4 text-gray-500">{getTest(res)}</td>
                        <td className="py-3 pr-4 text-gray-600">{getValue(res)}</td>
                        <td className="py-3 pr-4 text-gray-400">{getDate(res)}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${flagColors[flag] || "bg-gray-100 text-gray-500"}`}>
                            {flag}
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="flex items-center gap-1 text-[#3E4095] hover:underline">
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden flex flex-col gap-3">
              {results.map((res) => {
                const flag = getFlag(res);
                return (
                  <div key={res.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1B2B40] truncate">{getPatient(res)}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {getResultId(res)}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${flagColors[flag] || "bg-gray-100 text-gray-500"}`}>
                        {flag}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Test</p>
                        <p className="text-gray-600 leading-snug">{getTest(res)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Result</p>
                        <p className="text-gray-600">{getValue(res)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Date</p>
                        <p className="text-gray-500">{getDate(res)}</p>
                      </div>
                    </div>
                    <button className="flex items-center justify-center gap-1.5 w-full border border-[#3E4095] text-[#3E4095] text-xs font-medium py-2.5 rounded-full hover:bg-indigo-50 transition-colors">
                      <Eye size={13} /> View Result
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <Pagination2
          count={count}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};

export default Hospital_Lab_Results_Dashboard;
