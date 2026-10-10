import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Search, Plus, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../../ui/Modal";

const LOINC_OPTIONS = [
  { loinc: "133-7", name: "133-7-Haemoglobin", testName: "Haemoglobin", dept: "Haematology", defaultUnit: "g/dL" },
  { loinc: "718-8", name: "718-8-Haemoglobin", testName: "Haemoglobin", dept: "Haematology", defaultUnit: "g/dL" },
  { loinc: "2345-7", name: "2345-7-Glucose [Mass/vol] in Blood", testName: "Glucose in Blood", dept: "Clinical Chemistry", defaultUnit: "mg/dL" },
  { loinc: "2093-3", name: "2093-3-Cholesterol in Serum/Plasma", testName: "Cholesterol", dept: "Chemical Pathology", defaultUnit: "mg/dL" },
  { loinc: "4548-4", name: "4548-4-Hemoglobin A1c in Blood", testName: "Hemoglobin A1c", dept: "Haematology", defaultUnit: "%" },
  { loinc: "2160-0", name: "2160-0-Creatinine in Serum/Plasma", testName: "Creatinine", dept: "Clinical Chemistry", defaultUnit: "mg/dL" },
  { loinc: "2951-2", name: "2951-2-Sodium in Serum/Plasma", testName: "Sodium", dept: "Clinical Chemistry", defaultUnit: "mmol/L" },
  { loinc: "2823-3", name: "2823-3-Potassium in Serum/Plasma", testName: "Potassium", dept: "Clinical Chemistry", defaultUnit: "mmol/L" },
  { loinc: "1751-7", name: "1751-7-Albumin in Serum/Plasma", testName: "Albumin", dept: "Clinical Chemistry", defaultUnit: "g/dL" },
  { loinc: "14804-9", name: "14804-9-Electrolytes Panel", testName: "Electrolytes Panel", dept: "Chemical Pathology", defaultUnit: "mmol/L" },
  { loinc: "3094-0", name: "3094-0-Blood Urea Nitrogen (BUN)", testName: "Blood Urea Nitrogen", dept: "Clinical Chemistry", defaultUnit: "mg/dL" },
  { loinc: "1920-8", name: "1920-8-Aspartate Aminotransferase", testName: "AST", dept: "Chemical Pathology", defaultUnit: "U/L" },
  { loinc: "1742-6", name: "1742-6-Alanine Aminotransferase", testName: "ALT", dept: "Chemical Pathology", defaultUnit: "U/L" },
  { loinc: "6690-2", name: "6690-2-White Blood Cell Count", testName: "WBC Count", dept: "Haematology", defaultUnit: "10*3/μL" },
  { loinc: "3016-3", name: "3016-3-TSH in Serum/Plasma", testName: "TSH", dept: "Immunology", defaultUnit: "μIU/mL" },
];

const AVAILABLE_UNITS = ["μIU/mL", "mIU/L", "μmol/L", "mg/dL", "g/dL", "g/L", "mmol/L", "%", "U/L", "10*3/μL", "CFU/mL", "COI", "N/A"];
const RESULT_FORMATS = ["Numeric", "Positive/Negative", "Present/absent", "Text"];
const DECIMAL_PRECISIONS = ["Whole number", "1 decimal place", "2 decimal places", "3 decimal places"];
const GENDER_OPTIONS = ["All", "Female", "Male"];
const PREGNANCY_STATUSES = ["Not pregnant", "1st trimester", "Second trimester", "3rd trimester"];
const AGE_GROUPS = ["Adult", "Teens", "Children", "Infant", "Newborn", "Elderly"];
const ReferenceDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-800 hover:border-indigo-300 transition-colors cursor-pointer select-none"
      >
        <span>{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-30 p-1 min-w-[120px] max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                value === opt
                  ? "bg-indigo-50 text-docuhealth-primary font-semibold"
                  : "text-slate-700 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddNewTestModal = ({ isOpen, onClose, onTestAdded }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [selectedLoinc, setSelectedLoinc] = useState(LOINC_OPTIONS[0]);
  const [resultFormat, setResultFormat] = useState("Numeric");
  const [unit, setUnit] = useState("μIU/mL");
  const [decimalPrecision, setDecimalPrecision] = useState("2 decimal places");
  
  const [references, setReferences] = useState([
    { id: 1, age: "Adult", minRef: "0.4", maxRef: "4.0", gender: "All", pregStatus: "1st trimester" },
    { id: 2, age: "Teens", minRef: "0.4", maxRef: "4.0", gender: "All", pregStatus: "Not pregnant" },
  ]);

  const [criticalLow, setCriticalLow] = useState("0.01");
  const [criticalHigh, setCriticalHigh] = useState("100");
  const [tatValue, setTatValue] = useState("");
  const [tatUnit, setTatUnit] = useState("Days");
  const [testInterpretation, setTestInterpretation] = useState("");
  const [enableApproval, setEnableApproval] = useState(true);

  // Dropdown UI states
  const [isLoincOpen, setIsLoincOpen] = useState(false);
  const [loincSearch, setLoincSearch] = useState("");
  const [isResultFormatOpen, setIsResultFormatOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [isPrecisionOpen, setIsPrecisionOpen] = useState(false);
  const [isTatUnitOpen, setIsTatUnitOpen] = useState(false);

  const loincDropdownRef = useRef(null);

  // Close LOINC dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loincDropdownRef.current && !loincDropdownRef.current.contains(e.target)) {
        setIsLoincOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLoincOptions = LOINC_OPTIONS.filter((opt) =>
    opt.name.toLowerCase().includes(loincSearch.toLowerCase()) ||
    opt.loinc.toLowerCase().includes(loincSearch.toLowerCase())
  );

  const handleAddReference = () => {
    setReferences((prev) => [
      ...prev,
      {
        id: Date.now(),
        age: "Adult",
        minRef: "0.0",
        maxRef: "5.0",
        gender: "All",
        pregStatus: "Not pregnant",
      },
    ]);
  };

  const handleRemoveReference = (id) => {
    if (references.length <= 1) {
      toast.error("At least one reference range is required");
      return;
    }
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReferenceChange = (id, field, value) => {
    setReferences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTestData = {
      id: Date.now(),
      loinc: selectedLoinc.loinc,
      name: selectedLoinc.testName,
      department: selectedLoinc.dept,
      unit: unit,
      resultFormat,
      decimalPrecision,
      references,
      criticalLow,
      criticalHigh,
      tat: `${tatValue} ${tatUnit}`,
      testInterpretation,
      enableApproval,
    };

    if (onTestAdded) {
      onTestAdded(newTestData);
    }

    setShowSuccess(true);
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
      maxWidth={showSuccess ? "md" : "6xl"}
      className={showSuccess ? "p-2" : "max-h-[92vh] flex flex-col p-4 sm:p-6"}
    >
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-700 transition-colors z-20 cursor-pointer p-1 rounded-full hover:bg-gray-100"
        >
          <X size={22} />
        </button>

        {showSuccess ? (
          /* Success Screen */
          <div className="flex flex-col items-center text-center py-6 ">
            <div className="w-24 h-24 rounded-full bg-green-100/80 flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center shadow-md">
                <Check className="w-9 h-9 text-white stroke-[3]" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-8 max-w-xs leading-relaxed">
              You have successfully created and configured a new test!
            </h3>

            <button
              onClick={handleModalClose}
              className="w-full bg-[#22C55E] hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition-colors cursor-pointer shadow-sm text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Modal Header */}
            <div className="pb-5 text-center border-b border-gray-100">
              <div className="flex justify-center mb-3">
                <svg width="56" height="56" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M39.9985 5V10H37.4985V18.1073C37.4985 21.0013 38.1265 23.8608 39.3392 26.4885L50.0425 49.6785C50.9103 51.559 50.0895 53.787 48.209 54.6548C47.7163 54.8823 47.1803 55 46.6375 55H13.3594C11.2883 55 9.60938 53.321 9.60938 51.25C9.60938 50.7072 9.72713 50.1713 9.95453 49.6785L20.6576 26.4885C21.8704 23.8608 22.4985 21.0013 22.4985 18.1073V10H19.9985V5H39.9985ZM33.4682 25.003H26.5287C26.268 25.911 25.9557 26.8053 25.5927 27.681L25.1975 28.5838L15.311 50H44.6835L34.7995 28.5838C34.2635 27.4228 33.819 26.2255 33.4682 25.003ZM27.4985 18.1073C27.4985 18.7407 27.4745 19.3727 27.4265 20.0022H32.5705C32.5473 19.6995 32.5298 19.3963 32.518 19.0926L32.4985 18.1073V10H27.4985V18.1073Z"
                    fill="var(--color-docuhealth-primary, #3E4095)"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Add new LOINC test
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Add new loinc test to your test catalogue!
              </p>
            </div>

            {/* Scrollable Form Body */}
            <div className="py-4 space-y-4 max-h-[62vh] overflow-y-auto pr-1">
              {/* Row 1: Test Name & Result format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Test name with searchable dropdown */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white relative" ref={loincDropdownRef}>
                  <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                    Test name
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLoincOpen(!isLoincOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 hover:border-indigo-300 transition-colors text-left"
                  >
                    <span className="truncate font-medium">{selectedLoinc.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isLoincOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isLoincOpen && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center px-3 py-1.5 bg-gray-50 rounded-xl mb-2 border border-gray-200">
                        <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                        <input
                          type="text"
                          value={loincSearch}
                          onChange={(e) => setLoincSearch(e.target.value)}
                          placeholder="Search LOINC code or test name..."
                          className="bg-transparent border-none outline-none text-xs text-slate-700 w-full"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-0.5">
                        {filteredLoincOptions.map((item) => (
                          <button
                            key={item.loinc}
                            type="button"
                            onClick={() => {
                              setSelectedLoinc(item);
                              setUnit(item.defaultUnit);
                              setIsLoincOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                              selectedLoinc.loinc === item.loinc
                                ? "bg-indigo-50 text-docuhealth-primary font-semibold"
                                : "text-slate-700 hover:bg-gray-50"
                            }`}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Result format */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white relative">
                  <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                    Result format
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsResultFormatOpen(!isResultFormatOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 hover:border-indigo-300 transition-colors"
                  >
                    <span>{resultFormat}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isResultFormatOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isResultFormatOpen && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                      {RESULT_FORMATS.map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => {
                            setResultFormat(fmt);
                            setIsResultFormatOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                            resultFormat === fmt
                              ? "bg-indigo-50 text-docuhealth-primary font-semibold"
                              : "text-slate-700 hover:bg-gray-50"
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Unit of measurement & Decimal precision */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit of measurement */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white relative">
                  <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                    Unit of measurement
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsUnitOpen(!isUnitOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 hover:border-indigo-300 transition-colors"
                  >
                    <span>{unit}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUnitOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isUnitOpen && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-1.5 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                      {AVAILABLE_UNITS.map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => {
                            setUnit(u);
                            setIsUnitOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                            unit === u
                              ? "bg-indigo-50 text-docuhealth-primary font-semibold"
                              : "text-slate-700 hover:bg-gray-50"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Decimal precision */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white relative">
                  <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                    Decimal precision (for numeric result format only)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPrecisionOpen(!isPrecisionOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 hover:border-indigo-300 transition-colors"
                  >
                    <span>{decimalPrecision}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isPrecisionOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isPrecisionOpen && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                      {DECIMAL_PRECISIONS.map((prec) => (
                        <button
                          key={prec}
                          type="button"
                          onClick={() => {
                            setDecimalPrecision(prec);
                            setIsPrecisionOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                            decimalPrecision === prec
                              ? "bg-indigo-50 text-docuhealth-primary font-semibold"
                              : "text-slate-700 hover:bg-gray-50"
                          }`}
                        >
                          {prec}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: References Box */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                <label className="block text-sm font-semibold text-docuhealth-primary mb-3">
                  References
                </label>

                <div className="space-y-3">
                  {references.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between gap-2 p-2.5 bg-gray-50/70 border border-gray-100 rounded-xl text-xs"
                    >
                      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3 flex-1">
                        {/* Age */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-gray-500 font-medium text-xs whitespace-nowrap">Age</span>
                          <ReferenceDropdown
                            value={ref.age}
                            onChange={(val) => handleReferenceChange(ref.id, "age", val)}
                            options={AGE_GROUPS}
                          />
                        </div>

                        {/* Min Ref. range */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-gray-500 font-medium text-xs whitespace-nowrap">Min. Ref. range</span>
                          <input
                            type="number"
                            step="0.01"
                            value={ref.minRef}
                            onChange={(e) => handleReferenceChange(ref.id, "minRef", e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 w-14 text-xs text-center text-slate-800 outline-none hover:border-indigo-300 transition-colors"
                          />
                        </div>

                        {/* Max Ref. range */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-gray-500 font-medium text-xs whitespace-nowrap">Max. Ref. range</span>
                          <input
                            type="number"
                            step="0.01"
                            value={ref.maxRef}
                            onChange={(e) => handleReferenceChange(ref.id, "maxRef", e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 w-14 text-xs text-center text-slate-800 outline-none hover:border-indigo-300 transition-colors"
                          />
                        </div>

                        {/* Gender */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-gray-500 font-medium text-xs whitespace-nowrap">Gender</span>
                          <ReferenceDropdown
                            value={ref.gender}
                            onChange={(val) => handleReferenceChange(ref.id, "gender", val)}
                            options={GENDER_OPTIONS}
                          />
                        </div>

                        {/* Preg. status */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-gray-500 font-medium text-xs whitespace-nowrap">Preg. status</span>
                          <ReferenceDropdown
                            value={ref.pregStatus}
                            onChange={(val) => handleReferenceChange(ref.id, "pregStatus", val)}
                            options={PREGNANCY_STATUSES}
                          />
                        </div>
                      </div>

                      {/* Remove Button Beside */}
                      <button
                        type="button"
                        onClick={() => handleRemoveReference(ref.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                        title="Remove reference"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddReference}
                  className="mt-3 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-docuhealth-primary hover:underline cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add reference
                </button>
              </div>

              {/* Row 4: Critical value & Turnaround time (TAT) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Critical value */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                  <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                    Critical value
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Critical low &lt;</span>
                      <input
                        type="number"
                        step="0.01"
                        value={criticalLow}
                        onChange={(e) => setCriticalLow(e.target.value)}
                        className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Critical high &gt;</span>
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

                {/* Turnaround time (TAT) */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white relative">
                  <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                    Turnaround time (TAT)
                  </label>
                  <div className="flex items-center bg-gray-50/70 border border-gray-200 rounded-xl overflow-visible">
                    <input
                      type="number"
                      value={tatValue}
                      onChange={(e) => setTatValue(e.target.value)}
                      placeholder="Input number..."
                      className="w-full bg-transparent border-none outline-none px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-gray-400"
                    />
                    <div className="relative shrink-0 pr-1">
                      <button
                        type="button"
                        onClick={() => setIsTatUnitOpen(!isTatUnitOpen)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-gray-50"
                      >
                        <span>{tatUnit}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      {isTatUnitOpen && (
                        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-30 p-1 w-28 animate-in fade-in zoom-in-95 duration-150">
                          {TAT_UNITS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setTatUnit(t);
                                setIsTatUnitOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                tatUnit === t
                                  ? "bg-indigo-50 text-docuhealth-primary font-semibold"
                                  : "text-slate-700 hover:bg-gray-50"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 5: Test interpretation */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                  Test interpretation
                </label>
                <textarea
                  rows={3}
                  value={testInterpretation}
                  onChange={(e) => setTestInterpretation(e.target.value)}
                  placeholder="Add comment..."
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder:text-gray-400 outline-none resize-none focus:border-indigo-300 transition-colors"
                />
              </div>

              {/* Checkbox: Enable approval */}
              <div className="flex items-center gap-2.5 pt-1 px-1">
                <input
                  type="checkbox"
                  id="enableApproval"
                  checked={enableApproval}
                  onChange={(e) => setEnableApproval(e.target.checked)}
                  className="w-4 h-4 rounded text-docuhealth-primary border-gray-300 focus:ring-docuhealth-primary cursor-pointer"
                />
                <label htmlFor="enableApproval" className="text-xs sm:text-sm text-slate-700 font-medium cursor-pointer select-none">
                  Enable approval for this test (test will be approved by an admin before it goes out)
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-2.5 bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-sm font-semibold rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Add test
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AddNewTestModal;
