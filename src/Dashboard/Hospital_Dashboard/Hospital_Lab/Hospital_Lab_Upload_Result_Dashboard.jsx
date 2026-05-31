import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import RichTextEditor from "../../../Components/RichTextEditor/RichTextEditor";
import { ArrowLeft, Save, Plus, X, Info, Check } from "lucide-react";

const days   = Array.from({ length: 31 }, (_, i) => i + 1);
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const years  = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const times  = Array.from({ length: 24 }, (_, i) => {
  const h   = i % 12 === 0 ? 12 : i % 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${String(h).padStart(2, "0")}:00 ${ampm}`;
});

const emptyRow = () => ({ id: Date.now() + Math.random(), test: "", result: "", reference: "", status: "Negative" });
const emptyTable = () => ({ id: Date.now() + Math.random(), title: "", rows: [emptyRow()] });

const Hospital_Lab_Upload_Result_Dashboard = () => {
  const navigate = useNavigate();

  const [tables, setTables]                 = useState([]);
  const [interpretNotes, setInterpretNotes] = useState([]);
  const [clinicalNotes, setClinicalNotes]   = useState([]);
  const [collectionDate, setCollectionDate] = useState({ day: "", month: "", year: "", time: "" });
  const [extraComment, setExtraComment]     = useState("");
  const [showConfirm, setShowConfirm]       = useState(false);
  const [showSuccess, setShowSuccess]       = useState(false);

  /* ── Table helpers ── */
  const addTable = () => setTables((prev) => [...prev, emptyTable()]);

  const removeTable = (tid) => setTables((prev) => prev.filter((t) => t.id !== tid));

  const updateTableTitle = (tid, val) =>
    setTables((prev) => prev.map((t) => (t.id === tid ? { ...t, title: val } : t)));

  const addRow = (tid) =>
    setTables((prev) =>
      prev.map((t) => (t.id === tid ? { ...t, rows: [...t.rows, emptyRow()] } : t))
    );

  const removeRow = (tid, rid) =>
    setTables((prev) =>
      prev.map((t) =>
        t.id === tid ? { ...t, rows: t.rows.filter((r) => r.id !== rid) } : t
      )
    );

  const updateRow = (tid, rid, field, val) =>
    setTables((prev) =>
      prev.map((t) =>
        t.id === tid
          ? { ...t, rows: t.rows.map((r) => (r.id === rid ? { ...r, [field]: val } : r)) }
          : t
      )
    );

  /* ── Note helpers ── */
  const addNote   = (setter) => setter((prev) => [...prev, { id: Date.now() + Math.random(), text: "" }]);
  const removeNote = (setter, id) => setter((prev) => prev.filter((n) => n.id !== id));
  const updateNote = (setter, id, val) =>
    setter((prev) => prev.map((n) => (n.id === id ? { ...n, text: val } : n)));

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

      {/* Main content card */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-6">

        {/* ── Test result tables ── */}
        <div className="flex flex-col gap-4">
          {tables.map((table) => (
            <div key={table.id} className="border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col gap-4">
              {/* Table title + remove */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Table title (e.g. Typhoid Fever Widal Test)"
                  value={table.title}
                  onChange={(e) => updateTableTitle(table.id, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#3E4095] transition-colors"
                />
                <button
                  onClick={() => removeTable(table.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Rows */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                      <th className="pb-2 pr-3 font-semibold text-left min-w-[120px]">Test</th>
                      <th className="pb-2 pr-3 font-semibold text-left min-w-[100px]">Result</th>
                      <th className="pb-2 pr-3 font-semibold text-left min-w-[120px]">Reference range</th>
                      <th className="pb-2 pr-3 font-semibold text-left min-w-[100px]">Status</th>
                      <th className="pb-2 font-semibold w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {table.rows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            placeholder="Test name"
                            value={row.test}
                            onChange={(e) => updateRow(table.id, row.id, "test", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#3E4095]"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            placeholder="e.g. 1:80"
                            value={row.result}
                            onChange={(e) => updateRow(table.id, row.id, "result", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#3E4095]"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            placeholder="e.g. <1:160"
                            value={row.reference}
                            onChange={(e) => updateRow(table.id, row.id, "reference", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#3E4095]"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <select
                            value={row.status}
                            onChange={(e) => updateRow(table.id, row.id, "status", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#3E4095] bg-white"
                          >
                            <option>Negative</option>
                            <option>Positive</option>
                            <option>Normal</option>
                            <option>Abnormal</option>
                          </select>
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => removeRow(table.id, row.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add row */}
              <button
                onClick={() => addRow(table.id)}
                className="self-start text-xs text-[#3E4095] hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add row
              </button>
            </div>
          ))}

          {/* Add new test result table button */}
          <button
            onClick={addTable}
            className="flex items-center gap-1 text-sm text-[#3E4095] hover:underline w-fit"
          >
            <Plus size={14} /> Add new test result table
          </button>
        </div>

        {/* ── Interpretation ── */}
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">Interpretation</p>
          <div className="border border-gray-100 rounded-lg p-3 sm:p-4 flex flex-col gap-3">
            {interpretNotes.map((note) => (
              <div key={note.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <RichTextEditor
                    placeholder="Enter interpretation note..."
                    onChange={(html) => updateNote(setInterpretNotes, note.id, html)}
                  />
                </div>
                <button
                  onClick={() => removeNote(setInterpretNotes, note.id)}
                  className="mt-2 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addNote(setInterpretNotes)}
              className="flex items-center gap-1 text-sm text-[#3E4095] hover:underline w-fit"
            >
              <Plus size={13} /> Add note
            </button>
          </div>
        </div>

        {/* ── Clinical correlation ── */}
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">Clinical correlation <span className="text-gray-400 font-normal">(optional)</span></p>
          <div className="border border-gray-100 rounded-lg p-3 sm:p-4 flex flex-col gap-3">
            {clinicalNotes.map((note) => (
              <div key={note.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <RichTextEditor
                    placeholder="Enter clinical correlation note..."
                    onChange={(html) => updateNote(setClinicalNotes, note.id, html)}
                  />
                </div>
                <button
                  onClick={() => removeNote(setClinicalNotes, note.id)}
                  className="mt-2 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addNote(setClinicalNotes)}
              className="flex items-center gap-1 text-sm text-[#3E4095] hover:underline w-fit"
            >
              <Plus size={13} /> Add note
            </button>
          </div>
        </div>

        {/* ── Collection date ── */}
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">Collection date</p>

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
            <label className="text-xs text-gray-500">Select time</label>
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

        {/* ── Extra comment ── */}
        <div className="border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">Extra comment (optional)</p>
          <textarea
            rows={4}
            placeholder="Enter any other optional comment"
            value={extraComment}
            onChange={(e) => setExtraComment(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#3E4095] resize-none transition-colors"
          />
        </div>

        {/* ── Action buttons ── */}
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

      {/* ── Confirm Upload Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-6 relative flex flex-col items-center text-center">
            {/* Close */}
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
              <Info size={22} className="text-gray-800" />
            </div>

            <h3 className="text-base font-semibold text-gray-800 mb-3">Confirm Upload</h3>

            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              By proceeding you confirm that you have carried out the requested test and you are certain of the results/finding. Once uploaded, result will be shared to both doctor and patient!
            </p>

            <button
              onClick={() => {
                setShowConfirm(false);
                setShowSuccess(true);
              }}
              className="w-full bg-[#3E4095] text-white text-sm font-semibold py-3 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Confirm upload
            </button>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-6 sm:p-8 flex flex-col items-center text-center">
            {/* Green check circle */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <Check size={28} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              You have successfully uploaded a<br />completed test result!
            </p>

            <button
              onClick={() => {
                setShowSuccess(false);
                navigate(-2);
              }}
              className="w-full bg-green-700 text-white text-sm font-semibold py-3 rounded-full hover:bg-green-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Hospital_Lab_Upload_Result_Dashboard;
