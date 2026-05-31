import { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { Search, Eye } from "lucide-react";

const allResults = [
  { id: "RES-001", patient: "Chidi Eze", test: "Blood Glucose", result: "Normal", value: "5.4 mmol/L", date: "2026-05-29", flag: "Normal" },
  { id: "RES-002", patient: "Ngozi Adeyemi", test: "Malaria RDT", result: "Positive", value: "Positive", date: "2026-05-28", flag: "Abnormal" },
  { id: "RES-003", patient: "Blessing Obi", test: "HIV Screening", result: "Non-Reactive", value: "Non-Reactive", date: "2026-05-27", flag: "Normal" },
  { id: "RES-004", patient: "Halima Usman", test: "Widal Test", result: "Positive", value: "1:160", date: "2026-05-26", flag: "Abnormal" },
  { id: "RES-005", patient: "Tunde Afolabi", test: "Electrolytes & Urea", result: "Normal", value: "Na: 138, K: 4.1", date: "2026-05-26", flag: "Normal" },
  { id: "RES-006", patient: "Amara Okafor", test: "Full Blood Count", result: "Low Haemoglobin", value: "Hb: 8.2 g/dL", date: "2026-05-25", flag: "Abnormal" },
  { id: "RES-007", patient: "Kelechi Nnadi", test: "Thyroid Function Test", result: "Elevated TSH", value: "TSH: 8.5 mIU/L", date: "2026-05-24", flag: "Abnormal" },
  { id: "RES-008", patient: "Yusuf Lawal", test: "Hepatitis B Screen", result: "Non-Reactive", value: "HBsAg: Negative", date: "2026-05-23", flag: "Normal" },
];

const flagColors = {
  Normal: "bg-green-100 text-green-700",
  Abnormal: "bg-red-100 text-red-700",
};

const Hospital_Lab_Results_Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = allResults.filter(
    (r) =>
      r.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.test.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-md p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[#1B2B40]">Lab Results</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search patient or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs text-gray-600 bg-transparent outline-none w-44"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-gray-400 font-mono">{res.id}</td>
                  <td className="py-3 pr-4 font-medium text-[#1B2B40]">{res.patient}</td>
                  <td className="py-3 pr-4 text-gray-500">{res.test}</td>
                  <td className="py-3 pr-4 text-gray-600">{res.value}</td>
                  <td className="py-3 pr-4 text-gray-400">{res.date}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${flagColors[res.flag]}`}>
                      {res.flag}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="flex items-center gap-1 text-[#3E4095] hover:underline">
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Hospital_Lab_Results_Dashboard;
