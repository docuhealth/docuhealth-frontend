import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, MoreHorizontal, X, FlaskConical, Trash2, Settings } from "lucide-react";
import toast from "react-hot-toast";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";

const MOCK_TESTS = [
  { id: 1, loinc: "718-8", name: "Haemoglobin", department: "Haematology", unit: "g/dL" },
  { id: 2, loinc: "2345-7", name: "Glucose [Mass/volume] in Blood", department: "Clinical Chemistry", unit: "mg/dL" },
  { id: 3, loinc: "2093-3", name: "Cholesterol in Serum/Plasma", department: "Chemical Pathology", unit: "mg/dL" },
  { id: 4, loinc: "4548-4", name: "Hemoglobin A1c in Blood", department: "Haematology", unit: "%" },
  { id: 5, loinc: "2160-0", name: "Creatinine in Serum/Plasma", department: "Clinical Chemistry", unit: "mg/dL" },
  { id: 6, loinc: "2951-2", name: "Sodium in Serum/Plasma", department: "Clinical Chemistry", unit: "mmol/L" },
  { id: 7, loinc: "2823-3", name: "Potassium in Serum/Plasma", department: "Clinical Chemistry", unit: "mmol/L" },
  { id: 8, loinc: "1751-7", name: "Albumin in Serum/Plasma", department: "Clinical Chemistry", unit: "g/dL" },
  { id: 9, loinc: "14804-9", name: "Electrolytes Panel", department: "Chemical Pathology", unit: "mmol/L" },
  { id: 10, loinc: "3094-0", name: "Blood Urea Nitrogen (BUN)", department: "Clinical Chemistry", unit: "mg/dL" },
  { id: 11, loinc: "1920-8", name: "Aspartate Aminotransferase (AST)", department: "Chemical Pathology", unit: "U/L" },
  { id: 12, loinc: "1742-6", name: "Alanine Aminotransferase (ALT)", department: "Chemical Pathology", unit: "U/L" },
  { id: 13, loinc: "6690-2", name: "White Blood Cell Count (WBC)", department: "Haematology", unit: "10*3/μL" },
  { id: 14, loinc: "777-3", name: "Platelet Count", department: "Haematology", unit: "10*3/μL" },
  { id: 15, loinc: "3016-3", name: "Thyroid Stimulating Hormone (TSH)", department: "Immunology", unit: "μIU/mL" },
  { id: 16, loinc: "5770-3", name: "Free Thyroxine (FT4)", department: "Immunology", unit: "ng/dL" },
  { id: 17, loinc: "580-1", name: "Urine Culture and Colony Count", department: "Microbiology", unit: "CFU/mL" },
  { id: 18, loinc: "24357-6", name: "Urinalysis Macro/Microscopic", department: "Microbiology", unit: "N/A" },
  { id: 19, loinc: "10834-0", name: "Malaria Parasite Smear", department: "Parasitology", unit: "parasites/μL" },
  { id: 20, loinc: "5195-3", name: "Hepatitis B Surface Antigen (HBsAg)", department: "Immunology", unit: "COI" },
];

const DEPARTMENTS = [
  "All departments",
  "Haematology",
  "Clinical Chemistry",
  "Chemical Pathology",
  "Microbiology",
  "Immunology",
  "Parasitology",
];

const getDepartmentBadge = (dept) => {
  switch (dept?.toLowerCase()) {
    case "haematology":
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    case "clinical chemistry":
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    case "chemical pathology":
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    case "microbiology":
      return "bg-teal-50 text-teal-700 border-teal-200/80";
    case "immunology":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "parasitology":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    default:
      return "bg-indigo-50 text-docuhealth-primary border-indigo-100";
  }
};

const TestCatalogueTable = ({ extraTests = [], onOpenAddTest }) => {
  const [tests, setTests] = useState(MOCK_TESTS);

  useEffect(() => {
    if (extraTests && extraTests.length > 0) {
      setTests((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newOnes = extraTests.filter((t) => !existingIds.has(t.id));
        return [...newOnes, ...prev];
      });
    }
  }, [extraTests]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("All departments");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [activePopoverId, setActivePopoverId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const searchInputRef = useRef(null);
  const deptDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setIsDeptDropdownOpen(false);
      }
      if (!e.target.closest(".test-popover-menu") && !e.target.closest(".test-popover-btn")) {
        setActivePopoverId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Filter tests
  const filteredTests = tests.filter((test) => {
    const matchesDept =
      selectedDepartment === "All departments" ||
      test.department.toLowerCase() === selectedDepartment.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === "" ||
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.loinc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTests = filteredTests.slice(startIndex, startIndex + itemsPerPage);

  const handleRemoveTest = (testId, testName) => {
    setActivePopoverId(null);
    setTests((prev) => prev.filter((t) => t.id !== testId));
    toast.success(`"${testName}" removed from catalogue`);
  };

  const handleConfigureTest = (test) => {
    setActivePopoverId(null);
    toast.success(`Configuring ${test.name} (${test.loinc})`);
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-docuhealth-primary flex items-center justify-center border border-indigo-100/80">
            <FlaskConical className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
            Test catalogue
          </h2>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Search Toggle / Input */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-48 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search test or LOINC..."
                  className="bg-transparent border-none outline-none text-xs sm:text-sm text-gray-700 w-full placeholder:text-gray-400"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 flex items-center justify-center text-gray-600 hover:text-docuhealth-primary transition-colors cursor-pointer"
                title="Search tests"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative" ref={deptDropdownRef}>
            <button
              onClick={() => setIsDeptDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full border border-docuhealth-primary text-docuhealth-primary hover:bg-indigo-50 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
            >
              <span>Filter: {selectedDepartment}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDeptDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 text-xs sm:text-sm">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setIsDeptDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors ${
                      selectedDepartment === dept
                        ? "text-docuhealth-primary font-semibold bg-indigo-50/60"
                        : "text-gray-700"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subheading */}
      <div className="pt-5 pb-3">
        <h3 className="text-sm font-semibold text-slate-700">Active test</h3>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden sm:block overflow-x-auto">
        {/* Rounded Pill Table Header */}
        <div className="bg-[#F8F9FB] border border-gray-100/80 rounded-full px-6 py-3.5 grid grid-cols-12 items-center text-xs font-semibold text-slate-600 select-none">
          <div className="col-span-2">LOINC code</div>
          <div className="col-span-4">Test name</div>
          <div className="col-span-3">Department</div>
          <div className="col-span-2">Unit of measurement</div>
          <div className="col-span-1 text-right"></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100 mt-1">
          {currentTests.length > 0 ? (
            currentTests.map((test) => (
              <div
                key={test.id}
                className="px-6 py-4 grid grid-cols-12 items-center text-sm hover:bg-indigo-50/20 transition-colors rounded-xl relative group"
              >
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-docuhealth-primary font-mono text-xs font-semibold border border-indigo-100/70">
                    {test.loinc}
                  </span>
                </div>
                <div className="col-span-4 text-slate-900 font-medium">{test.name}</div>
                <div className="col-span-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDepartmentBadge(test.department)}`}>
                    {test.department}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                    {test.unit}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end relative">
                  <button
                    onClick={() =>
                      setActivePopoverId(activePopoverId === test.id ? null : test.id)
                    }
                    className="test-popover-btn p-1.5 text-gray-400 hover:text-docuhealth-primary hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {/* Popover Action Menu */}
                  {activePopoverId === test.id && (
                    <div className="test-popover-menu absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 w-44 z-30 animate-in fade-in zoom-in duration-150">
                      <button
                        onClick={() => handleRemoveTest(test.id, test.name)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Remove test
                      </button>
                      <button
                        onClick={() => handleConfigureTest(test)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-docuhealth-primary transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Configure test
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No active tests matching your search/filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-3 mt-2">
        {currentTests.length > 0 ? (
          currentTests.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-slate-200/90 hover:border-indigo-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/80 flex items-center justify-center text-docuhealth-primary font-bold shadow-2xs shrink-0 mt-0.5">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-semibold bg-indigo-50 text-docuhealth-primary border border-indigo-100 rounded-md">
                      LOINC: {test.loinc}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-1 leading-snug">
                      {test.name}
                    </h4>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <button
                    onClick={() =>
                      setActivePopoverId(activePopoverId === test.id ? null : test.id)
                    }
                    className="test-popover-btn p-1.5 text-gray-400 hover:text-docuhealth-primary hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {/* Popover Action Menu */}
                  {activePopoverId === test.id && (
                    <div className="test-popover-menu absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 w-44 z-30 animate-in fade-in zoom-in duration-150">
                      <button
                        onClick={() => handleRemoveTest(test.id, test.name)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Remove test
                      </button>
                      <button
                        onClick={() => handleConfigureTest(test)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-docuhealth-primary transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Configure test
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                    Department
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDepartmentBadge(test.department)}`}>
                    {test.department}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                    Unit
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                    {test.unit}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm">
            No active tests matching criteria.
          </div>
        )}
      </div>

      {/* Pagination Footer using shared Pagination2 component */}
      <div className="pt-2 mt-4 border-t border-gray-100">
        <Pagination2
          count={filteredTests.length}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default TestCatalogueTable;
