import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, MoreHorizontal, X, FlaskConical, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";
import { fetchLabTests } from "../../../../queries/Hospital/lab/requests";

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

const formatUnitDisplay = (unit) => {
  if (!unit) return "—";
  const map = {
    micro_international_units_per_milliliter: "μIU/mL",
    milli_international_units_per_liter: "mIU/L",
    micromoles_per_liter: "μmol/L",
    milligrams_per_deciliter: "mg/dL",
    grams_per_deciliter: "g/dL",
    grams_per_liter: "g/L",
    millimoles_per_liter: "mmol/L",
  };
  return map[unit] || unit;
};

const TestCatalogueTable = ({ extraTests = [], onOpenAddTest, onConfigureTest }) => {
  const { data: rawData, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["lab-tests"],
    queryFn: fetchLabTests,
    staleTime: 1000 * 60,
  });

  const apiTests = Array.isArray(rawData) ? rawData : (rawData?.results || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("All departments");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [activePopoverId, setActivePopoverId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const searchInputRef = useRef(null);
  const deptDropdownRef = useRef(null);

  // Extract unique departments from API tests
  const departments = [
    "All departments",
    ...new Set(apiTests.map((t) => t.category?.name).filter(Boolean)),
  ];

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
  const filteredTests = apiTests.filter((test) => {
    const dept = test.category?.name || "General";
    const matchesDept =
      selectedDepartment === "All departments" ||
      dept.toLowerCase() === selectedDepartment.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === "" ||
      test.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.sqid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.parameters || []).some((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDept && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTests = filteredTests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-docuhealth-primary flex items-center justify-center border border-indigo-100/80">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
              Test Catalogue
            </h2>
            <p className="text-xs text-gray-500">
              Manage hospital laboratory test definitions, units, and critical ranges
            </p>
          </div>
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
                  placeholder="Search test name or sqid..."
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
              <span>{selectedDepartment}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDeptDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 text-xs sm:text-sm max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setIsDeptDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors cursor-pointer ${
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

      {isLoading && apiTests.length === 0 ? (
        <div className="mt-4">
          {/* Desktop Table Shimmer */}
          <div className="hidden md:block overflow-x-auto">
            <div className="bg-[#F8F9FB] border border-gray-100/80 rounded-full px-6 py-3.5 grid grid-cols-12 items-center text-xs font-semibold text-slate-600 select-none">
              <div className="col-span-3">Test Name</div>
              <div className="col-span-3">Department</div>
              <div className="col-span-2">Unit / Format</div>
              <div className="col-span-2">Turnaround / Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-100 mt-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 grid grid-cols-12 items-center animate-pulse">
                  <div className="col-span-3 pr-2 space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="col-span-3 pr-2">
                    <div className="h-6 bg-gray-200 rounded-full w-24" />
                  </div>
                  <div className="col-span-2 pr-2 space-y-1">
                    <div className="h-3.5 bg-gray-200 rounded w-16" />
                    <div className="h-2.5 bg-gray-100 rounded w-12" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="h-3.5 bg-gray-200 rounded w-20" />
                    <div className="h-2.5 bg-gray-100 rounded w-14" />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Shimmer Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs animate-pulse space-y-3">
                <div className="flex justify-between items-start pb-2 border-b border-gray-50">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/5" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                  <div className="h-7 bg-gray-200 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="py-14 text-center text-red-500 text-sm flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p>{error?.response?.data?.detail || "Failed to load test catalogue."}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto mt-4">
            <div className="bg-[#F8F9FB] border border-gray-100/80 rounded-full px-6 py-3.5 grid grid-cols-12 items-center text-xs font-semibold text-slate-600 select-none">
              <div className="col-span-3">Test Name</div>
              <div className="col-span-3">Department</div>
              <div className="col-span-2">Unit / Format</div>
              <div className="col-span-2">Turnaround / Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-gray-100 mt-1">
              {currentTests.length > 0 ? (
                currentTests.map((test) => {
                  const dept = test.category?.name || "General";
                  const details = test.additional_details;
                  const hasDetails = !!details;

                  return (
                    <div
                      key={test.sqid}
                      className="px-6 py-4 grid grid-cols-12 items-center text-xs sm:text-sm hover:bg-indigo-50/20 transition-colors rounded-xl"
                    >
                      {/* Name & ID */}
                      <div className="col-span-3 pr-2">
                        <p className="font-semibold text-slate-800 text-xs sm:text-sm" title={test.name}>
                          {test.name}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          sqid: {test.sqid}
                        </p>
                      </div>

                      {/* Department */}
                      <div className="col-span-3 pr-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDepartmentBadge(dept)}`}>
                          {dept}
                        </span>
                      </div>

                      {/* Unit / Format */}
                      <div className="col-span-2 text-slate-700 text-xs pr-2">
                        {hasDetails ? (
                          <>
                            <span className="font-semibold text-slate-800">{formatUnitDisplay(details.unit)}</span>
                            <span className="text-[10px] text-gray-400 block capitalize">{details.result_format?.replace(/_/g, " ")}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </div>

                      {/* Turnaround / Configured status */}
                      <div className="col-span-2 pr-2">
                        {hasDetails ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {details.turnaround_time || "Configured"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            Needs details
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => {
                            if (onConfigureTest) {
                              onConfigureTest(test);
                            } else if (onOpenAddTest) {
                              onOpenAddTest(test);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-docuhealth-primary hover:bg-indigo-50 border border-docuhealth-primary/30 hover:border-docuhealth-primary transition-colors cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>{hasDetails ? "Edit details" : "Configure"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm">
                  {isFetching ? "Refreshing tests..." : searchQuery ? `No tests found matching "${searchQuery}".` : "No tests matching your filter criteria."}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3 mt-4">
            {currentTests.length > 0 ? (
              currentTests.map((test) => {
                const dept = test.category?.name || "General";
                const details = test.additional_details;
                const hasDetails = !!details;

                return (
                  <div
                    key={test.sqid}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{test.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">sqid: {test.sqid}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getDepartmentBadge(dept)}`}>
                        {dept}
                      </span>
                    </div>

                    <div className="pt-2 text-xs flex items-center justify-between">
                      <div>
                        <p className="text-gray-500">Unit: <strong className="text-slate-800">{hasDetails ? formatUnitDisplay(details.unit) : "—"}</strong></p>
                        <p className="text-[11px] text-gray-400 mt-0.5">TAT: {details?.turnaround_time || "Not set"}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (onConfigureTest) {
                            onConfigureTest(test);
                          } else if (onOpenAddTest) {
                            onOpenAddTest(test);
                          }
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-docuhealth-primary border border-docuhealth-primary/40 hover:bg-indigo-50 cursor-pointer"
                      >
                        {hasDetails ? "Edit" : "Configure"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">
                {isFetching ? "Refreshing tests..." : searchQuery ? `No tests found matching "${searchQuery}".` : "No tests found."}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="pt-2 mt-4 border-t border-gray-100">
            <Pagination2
              count={filteredTests.length}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TestCatalogueTable;
