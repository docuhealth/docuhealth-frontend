import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Search, Plus, Check, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../ui/Modal";
import { fetchLabTests, createLabTestDetails } from "../../../../queries/Hospital/lab/requests";
import { extractApiErrorMessage } from "../../../../utils/apiError";

const RESULT_FORMAT_CHOICES = [
  { value: "numeric", label: "Numeric" },
  { value: "positive_or_negative", label: "Positive / Negative" },
  { value: "present_or_absent", label: "Present / Absent" },
  { value: "test", label: "Text" },
];

const UNIT_CHOICES = [
  { value: "milligrams_per_deciliter", label: "mg/dL (milligrams per deciliter)" },
  { value: "millimoles_per_liter", label: "mmol/L (millimoles per liter)" },
  { value: "grams_per_deciliter", label: "g/dL (grams per deciliter)" },
  { value: "grams_per_liter", label: "g/L (grams per liter)" },
  { value: "micromoles_per_liter", label: "μmol/L (micromoles per liter)" },
  { value: "milli_international_units_per_liter", label: "mIU/L (milli international units per liter)" },
  { value: "micro_international_units_per_milliliter", label: "μIU/mL (micro international units per milliliter)" },
];

const AGE_CHOICES = [
  { value: "adults", label: "Adults" },
  { value: "teens", label: "Teens" },
  { value: "children", label: "Children" },
];

const GENDER_CHOICES = [
  { value: "all", label: "All" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const PREGNANCY_CHOICES = [
  { value: "not_pregnant", label: "Not pregnant" },
  { value: "first_trimester", label: "1st trimester" },
  { value: "second_trimester", label: "2nd trimester" },
  { value: "third_trimester", label: "3rd trimester" },
];

const AddNewTestModal = ({ isOpen, onClose, initialTest = null, onTestAdded }) => {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [selectedTest, setSelectedTest] = useState(initialTest);
  const [resultFormat, setResultFormat] = useState("numeric");
  const [unit, setUnit] = useState("milligrams_per_deciliter");
  const [criticalLow, setCriticalLow] = useState("1.0");
  const [criticalHigh, setCriticalHigh] = useState("10.0");
  const [tatValue, setTatValue] = useState("1");
  const [tatUnit, setTatUnit] = useState("day");

  const [references, setReferences] = useState([
    {
      id: 1,
      age: "adults",
      gender: "all",
      pregnancy_status: "not_pregnant",
      min_ref_range: "3.5",
      max_ref_range: "5.5",
    },
  ]);

  // Dropdown UI states
  const [isTestDropdownOpen, setIsTestDropdownOpen] = useState(false);
  const [testSearch, setTestSearch] = useState("");
  const testDropdownRef = useRef(null);

  // Fetch tests for selection
  const { data: testsData, isLoading: testsLoading } = useQuery({
    queryKey: ["lab-tests"],
    queryFn: fetchLabTests,
    enabled: isOpen,
    staleTime: 1000 * 60,
  });

  const availableTests = Array.isArray(testsData) ? testsData : (testsData?.results || []);

  useEffect(() => {
    if (initialTest) {
      setSelectedTest(initialTest);
      if (initialTest.additional_details) {
        const d = initialTest.additional_details;
        if (d.result_format) setResultFormat(d.result_format);
        if (d.unit) setUnit(d.unit);
        if (d.critical_low != null) setCriticalLow(String(d.critical_low));
        if (d.critical_high != null) setCriticalHigh(String(d.critical_high));
        if (d.turnaround_time) {
          const parts = d.turnaround_time.split(" ");
          setTatValue(parts[0] || "1");
          setTatUnit(parts[1] || "day");
        }
        if (Array.isArray(d.references) && d.references.length > 0) {
          setReferences(
            d.references.map((r, idx) => ({
              id: r.sqid || idx,
              age: r.age || "adults",
              gender: r.gender || "all",
              pregnancy_status: r.pregnancy_status || "not_pregnant",
              min_ref_range: String(r.min_ref_range ?? "0"),
              max_ref_range: String(r.max_ref_range ?? "0"),
            }))
          );
        }
      } else {
        // Pre-populate sensible defaults from catalogue metadata if not yet configured
        if (initialTest.turnaround_hours) {
          const hours = initialTest.turnaround_hours;
          if (hours >= 24 && hours % 24 === 0) {
            setTatValue(String(hours / 24));
            setTatUnit("day");
          } else {
            setTatValue(String(hours));
            setTatUnit("hour");
          }
        }
        const firstParam = initialTest.parameters?.[0];
        if (firstParam && (firstParam.ref_low != null || firstParam.ref_high != null)) {
          setReferences([
            {
              id: 1,
              age: "adults",
              gender: "all",
              pregnancy_status: "not_pregnant",
              min_ref_range: String(firstParam.ref_low ?? "0.0"),
              max_ref_range: String(firstParam.ref_high ?? "10.0"),
            },
          ]);
        }
      }
    } else if (availableTests.length > 0 && !selectedTest) {
      setSelectedTest(availableTests[0]);
    }
  }, [initialTest, availableTests]);

  // Close test dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (testDropdownRef.current && !testDropdownRef.current.contains(e.target)) {
        setIsTestDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTests = availableTests.filter((t) =>
    t.name?.toLowerCase().includes(testSearch.toLowerCase()) ||
    t.sqid?.toLowerCase().includes(testSearch.toLowerCase()) ||
    t.category?.name?.toLowerCase().includes(testSearch.toLowerCase())
  );

  const handleAddReference = () => {
    setReferences((prev) => [
      ...prev,
      {
        id: Date.now(),
        age: "adults",
        gender: "all",
        pregnancy_status: "not_pregnant",
        min_ref_range: "0.0",
        max_ref_range: "5.0",
      },
    ]);
  };

  const handleRemoveReference = (id) => {
    if (references.length <= 1) {
      toast.error("At least one reference range is recommended.");
      return;
    }
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReferenceChange = (id, field, value) => {
    setReferences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const createMutation = useMutation({
    mutationFn: (payload) => createLabTestDetails(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
      queryClient.invalidateQueries({ queryKey: ["lab-test-details"] });
      queryClient.invalidateQueries({ queryKey: ["lab-audit-logs"] });
      if (onTestAdded) onTestAdded(data);
      setShowSuccess(true);
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to create lab test details."));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedTest?.sqid) {
      toast.error("Please select a valid test.");
      return;
    }

    if (!criticalLow || !criticalHigh) {
      toast.error("Please provide critical low and critical high values.");
      return;
    }

    if (!tatValue) {
      toast.error("Please provide a turnaround time.");
      return;
    }

    const payload = {
      test_sqid: selectedTest.sqid,
      result_format: resultFormat,
      unit: unit,
      critical_low: parseFloat(criticalLow),
      critical_high: parseFloat(criticalHigh),
      turnaround_time: `${tatValue} ${tatUnit}`,
      references: references.map((r) => ({
        age: r.age,
        gender: r.gender,
        pregnancy_status: r.pregnancy_status,
        min_ref_range: parseFloat(r.min_ref_range),
        max_ref_range: parseFloat(r.max_ref_range),
      })),
    };

    createMutation.mutate(payload);
  };

  const handleModalClose = () => {
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      maxWidth={showSuccess ? "md" : "4xl"}
      className={showSuccess ? "p-2" : "max-h-[92vh] flex flex-col p-4 sm:p-6"}
    >
      <div className="relative">
        <button
          onClick={handleModalClose}
          className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-700 transition-colors z-20 cursor-pointer p-1 rounded-full hover:bg-gray-100"
        >
          <X size={22} />
        </button>

        {showSuccess ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-24 h-24 rounded-full bg-green-100/80 flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center shadow-md">
                <Check className="w-9 h-9 text-white stroke-[3]" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 max-w-xs leading-relaxed">
              Lab Test Details Saved!
            </h3>
            <p className="text-xs text-gray-500 mb-8 max-w-sm">
              The reference ranges, turnaround time, and critical bounds are now active for {selectedTest?.name}.
            </p>

            <button
              onClick={handleModalClose}
              className="w-full bg-[#22C55E] hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition-colors cursor-pointer shadow-sm text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="pb-4 text-center border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Configure Lab Test Details
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Define result formats, units, turnaround times and reference ranges for your hospital
              </p>
            </div>

            <div className="py-4 space-y-4 max-h-[62vh] overflow-y-auto pr-1">
              {/* Row 1: Select Test & Result Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Test Selector */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white relative" ref={testDropdownRef}>
                  <label className="block text-xs font-semibold text-docuhealth-primary mb-2">
                    Select Test
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTestDropdownOpen(!isTestDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 hover:border-indigo-300 transition-colors text-left"
                  >
                    <span className="truncate font-medium">
                      {selectedTest ? `${selectedTest.name} (${selectedTest.sqid})` : "Select a test..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isTestDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isTestDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center px-3 py-1.5 bg-gray-50 rounded-xl mb-2 border border-gray-200">
                        <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                        <input
                          type="text"
                          value={testSearch}
                          onChange={(e) => setTestSearch(e.target.value)}
                          placeholder="Search test name or sqid..."
                          className="bg-transparent border-none outline-none text-xs text-slate-700 w-full"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-0.5">
                        {testsLoading ? (
                          <div className="py-8 flex flex-col items-center justify-center text-gray-400 text-xs">
                            <div className="w-4 h-4 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin mb-2" />
                            <span>Loading tests catalogue...</span>
                          </div>
                        ) : filteredTests.length > 0 ? (
                          filteredTests.map((item) => (
                            <button
                              key={item.sqid}
                              type="button"
                              onClick={() => {
                                setSelectedTest(item);
                                setIsTestDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                                selectedTest?.sqid === item.sqid
                                  ? "bg-indigo-50 text-docuhealth-primary font-semibold"
                                  : "text-slate-700 hover:bg-gray-50"
                              }`}
                            >
                              <p className="font-medium text-slate-800">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">
                                sqid: {item.sqid} · {item.category?.name || "General"}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-gray-400">
                            No tests found matching "{testSearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Result Format */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                  <label className="block text-xs font-semibold text-docuhealth-primary mb-2">
                    Result Format
                  </label>
                  <select
                    value={resultFormat}
                    onChange={(e) => setResultFormat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-300"
                  >
                    {RESULT_FORMAT_CHOICES.map((fmt) => (
                      <option key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Unit of measurement & Turnaround Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit of measurement */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                  <label className="block text-xs font-semibold text-docuhealth-primary mb-2">
                    Unit of measurement
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-300"
                  >
                    {UNIT_CHOICES.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Turnaround Time */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                  <label className="block text-xs font-semibold text-docuhealth-primary mb-2">
                    Turnaround time (TAT)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={tatValue}
                      onChange={(e) => setTatValue(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-24 bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none text-center"
                    />
                    <select
                      value={tatUnit}
                      onChange={(e) => setTatUnit(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none"
                    >
                      <option value="day">Day(s)</option>
                      <option value="hours">Hour(s)</option>
                      <option value="minutes">Minute(s)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: Critical Values */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                <label className="block text-xs font-semibold text-docuhealth-primary mb-2">
                  Critical Values (Panic Limits)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Critical Low &lt;</span>
                    <input
                      type="number"
                      step="0.01"
                      value={criticalLow}
                      onChange={(e) => setCriticalLow(e.target.value)}
                      className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Critical High &gt;</span>
                    <input
                      type="number"
                      step="0.01"
                      value={criticalHigh}
                      onChange={(e) => setCriticalHigh(e.target.value)}
                      className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Reference Ranges Array */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-docuhealth-primary">
                    Reference Ranges (Age, Gender & Pregnancy Status)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddReference}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-docuhealth-primary hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Range
                  </button>
                </div>

                <div className="space-y-3">
                  {references.map((ref, idx) => (
                    <div
                      key={ref.id}
                      className="p-3.5 bg-gray-50/80 border border-gray-200/90 rounded-xl text-xs space-y-2.5 transition-all"
                    >
                      {/* Mobile Range Header with Delete action */}
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 sm:hidden">
                        <span className="font-semibold text-slate-700 text-xs">
                          Reference Range #{idx + 1}
                        </span>
                        {references.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReference(ref.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 flex-1">
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium block mb-1">Age</span>
                            <select
                              value={ref.age}
                              onChange={(e) => handleReferenceChange(ref.id, "age", e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-2.5 text-xs text-slate-800 outline-none focus:border-docuhealth-primary"
                            >
                              {AGE_CHOICES.map((a) => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <span className="text-[11px] text-gray-500 font-medium block mb-1">Gender</span>
                            <select
                              value={ref.gender}
                              onChange={(e) => handleReferenceChange(ref.id, "gender", e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-2.5 text-xs text-slate-800 outline-none focus:border-docuhealth-primary"
                            >
                              {GENDER_CHOICES.map((g) => (
                                <option key={g.value} value={g.value}>{g.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[11px] text-gray-500 font-medium block mb-1">Pregnancy</span>
                            <select
                              value={ref.pregnancy_status}
                              onChange={(e) => handleReferenceChange(ref.id, "pregnancy_status", e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-2.5 text-xs text-slate-800 outline-none focus:border-docuhealth-primary"
                            >
                              {PREGNANCY_CHOICES.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <span className="text-[11px] text-gray-500 font-medium block mb-1">Min Ref</span>
                            <input
                              type="number"
                              step="0.01"
                              value={ref.min_ref_range}
                              onChange={(e) => handleReferenceChange(ref.id, "min_ref_range", e.target.value)}
                              placeholder="0.0"
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-2.5 text-xs text-slate-800 outline-none text-center focus:border-docuhealth-primary"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] text-gray-500 font-medium block mb-1">Max Ref</span>
                            <input
                              type="number"
                              step="0.01"
                              value={ref.max_ref_range}
                              onChange={(e) => handleReferenceChange(ref.id, "max_ref_range", e.target.value)}
                              placeholder="10.0"
                              className="w-full bg-white border border-gray-200 rounded-lg py-2 px-2.5 text-xs text-slate-800 outline-none text-center focus:border-docuhealth-primary"
                            />
                          </div>
                        </div>

                        {/* Desktop Remove Button */}
                        {references.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReference(ref.id)}
                            className="hidden sm:inline-flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer self-end mb-0.5"
                            title="Remove range"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-8 py-2.5 bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-xs sm:text-sm font-semibold rounded-full disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Test Details</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AddNewTestModal;
