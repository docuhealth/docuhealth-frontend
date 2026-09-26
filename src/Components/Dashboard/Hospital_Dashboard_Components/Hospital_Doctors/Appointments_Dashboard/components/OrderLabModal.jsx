import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { X, ChevronDown } from "lucide-react";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTestCategories, fetchLabTests } from "../../../../../../queries/Hospital/lab/requests";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";
import Modal from "../../../../../ui/Modal";

/**
 * Unified "Order Laboratory" modal using the shared Modal component.
 * Used across Doctor Appointments (FAB + Patient Info), Outpatient, and Inpatient flows.
 */
const OrderLabModal = ({ selectedPatientDetails, onClose, isOpen = true }) => {
  const queryClient = useQueryClient();
  const orderContext = resolveOrderContext(selectedPatientDetails);
  const dropdownRef = useRef(null);

  const [isTestTypeDropdownOpen, setIsTestTypeDropdownOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTest, setSearchTest] = useState("");
  const [formData, setFormData] = useState({
    patient_hin: orderContext.hin,
    note: "",
    category: "",
    specimen: "",
    test_type: [],
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["lab-test-categories"],
    queryFn: fetchTestCategories,
  });

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.results ?? []);

  const { data: testTypesData, isLoading: isTestTypesLoading } = useQuery({
    queryKey: ["lab-tests", formData.category],
    queryFn: fetchLabTests,
    enabled: !!formData.category,
  });

  const fetchedTestTypes = Array.isArray(testTypesData)
    ? testTypesData
    : (testTypesData?.results ?? []);

  // Close test dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTestTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { mutate: labMutate, isPending: isLabPending } = useMutation({
    mutationFn: async (payload) => {
      const fullNote = [
        payload.specimen ? `Specimen: ${payload.specimen}` : "",
        payload.note ? payload.note : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const requestPayload = {
        patient: payload.patient_hin,
        order_source: orderContext.orderSource,
        items: payload.test_type.map((testSqid) => ({
          test: testSqid,
          note: fullNote || undefined,
        })),
      };
      if (orderContext.checkIn) {
        requestPayload.check_in = orderContext.checkIn;
      }
      if (payload.ignore_duplicate_warning) {
        requestPayload.ignore_duplicate_warning = true;
      }
      return await axiosInstanceHos.post("api/lab/test-orders/create", requestPayload);
    },
    onSuccess: () => {
      setDuplicateWarning(null);
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["patient-lab-records"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-lab-records"] });
    },
    onError: (err) => {
      if (err.response?.status === 400 && err.response?.data?.duplicate_warning) {
        setDuplicateWarning(err.response.data.duplicate_warning);
      } else {
        console.error("Error assigning patient to lab scientist:", err);
        toast.error(extractApiErrorMessage(err, "Lab test request failed."));
        queryClient.invalidateQueries({ queryKey: ["lab-test-categories"] });
        queryClient.invalidateQueries({ queryKey: ["lab-tests", formData.category] });
        setFormData((prev) => ({ ...prev, test_type: [] }));
      }
    },
  });

  const handleLabRequest = () => {
    if (!formData.category || formData.test_type.length === 0) {
      toast.error("Please select a category and at least one test.");
      return;
    }
    labMutate({ ...formData, ignore_duplicate_warning: false });
  };

  const handleOverrideSubmit = () => {
    labMutate({ ...formData, ignore_duplicate_warning: true });
  };

  const handleToggleTest = (testId) => {
    setFormData((prev) => {
      const exists = prev.test_type.includes(testId);
      return {
        ...prev,
        test_type: exists
          ? prev.test_type.filter((id) => id !== testId)
          : [...prev.test_type, testId],
      };
    });
  };

  const handleRemoveTest = (testId) => {
    setFormData((prev) => ({
      ...prev,
      test_type: prev.test_type.filter((id) => id !== testId),
    }));
  };

  const filteredTests = fetchedTestTypes.filter((t) =>
    (t.name || "").toLowerCase().includes(searchTest.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={showSuccess || duplicateWarning ? "md" : "4xl"}
      className="max-h-[92vh] flex flex-col p-3"
    >
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-1 -right-1 text-gray-400 hover:text-gray-700 transition-colors z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        {showSuccess ? (
          <div className="flex flex-col items-center text-center py-4 px-2">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              You have successfully assigned patient<br />to a lab scientist for a test!
            </p>
            <button
              onClick={onClose}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-3 rounded-full transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : duplicateWarning ? (
          <div className="py-2">
            <div className="text-center mt-2">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Duplicate Order Detected</h3>
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap text-left bg-orange-50 p-3 rounded-md">
                {duplicateWarning}
              </p>
              <p className="text-sm text-gray-600 font-medium">Are you sure you want to proceed?</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDuplicateWarning(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                disabled={isLabPending}
                className="flex-1 px-4 py-2.5 bg-docuhealth-primary text-white rounded-full hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLabPending ? "Proceeding..." : "Proceed Anyway"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Modal Header */}
            <div className="pb-4 text-center border-b border-gray-100">
              <div className="flex justify-center mb-2">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M42.5 5H50C51.3807 5 52.5 6.1193 52.5 7.5V52.5C52.5 53.8807 51.3807 55 50 55H10C8.6193 55 7.5 53.8807 7.5 52.5V7.5C7.5 6.1193 8.6193 5 10 5H17.5V0H22.5V5H37.5V0H42.5V5ZM42.5 10V15H37.5V10H22.5V15H17.5V10H12.5V50H47.5V10H42.5ZM17.5 20H42.5V25H17.5V20ZM17.5 30H42.5V35H17.5V30Z"
                    fill="var(--color-docuhealth-primary)"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Order Laboratory</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Fill in the required details below to create a task!
              </p>
            </div>

            {/* Modal Scrollable Body */}
            <div className="py-4 space-y-4 max-h-[58vh] overflow-y-auto pr-1">
              {/* Category Card */}
              <div className="border border-gray-200/80 rounded-xl p-4 bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.02)]">
                <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const selectedCat = categories.find(
                        (c) => String(c.sqid || c.id) === selectedVal
                      );
                      setFormData({
                        ...formData,
                        category: selectedVal,
                        specimen: selectedCat?.name || formData.specimen,
                        test_type: [],
                      });
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-docuhealth-primary transition-colors appearance-none cursor-pointer pr-10"
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.sqid || cat.id} value={cat.sqid || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {/* Test Card */}
              <div
                ref={dropdownRef}
                className="border border-gray-200/80 rounded-xl p-4 bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.02)]"
              >
                <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                  Test <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isTestTypeDropdownOpen}
                    disabled={!formData.category}
                    onClick={() => {
                      if (formData.category) setIsTestTypeDropdownOpen(!isTestTypeDropdownOpen);
                    }}
                    className={`border border-gray-200 rounded-lg w-full px-3.5 py-2.5 text-sm outline-none flex justify-between items-center bg-white transition-colors ${
                      !formData.category
                        ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
                        : "cursor-pointer text-gray-700 hover:border-docuhealth-primary"
                    }`}
                  >
                    <span>
                      {isTestTypesLoading
                        ? "Loading tests..."
                        : formData.test_type.length > 0
                        ? `${formData.test_type.length} test${
                            formData.test_type.length > 1 ? "s" : ""
                          } selected`
                        : "Select test"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-500 transition-transform duration-200 ${
                        isTestTypeDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isTestTypeDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                      {fetchedTestTypes.length > 5 && (
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                          <input
                            type="text"
                            placeholder="Search tests..."
                            value={searchTest}
                            onChange={(e) => setSearchTest(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-docuhealth-primary"
                          />
                        </div>
                      )}
                      {filteredTests.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500 text-center">
                          No tests found
                        </div>
                      ) : (
                        filteredTests.map((test) => {
                          const id = test.sqid || test.name;
                          const isSelected = formData.test_type.includes(id);
                          return (
                            <label
                              key={id}
                              className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-xs sm:text-sm text-gray-700 ${
                                isSelected ? "bg-docuhealth-primary/5 font-medium" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-docuhealth-primary rounded border-gray-300 focus:ring-docuhealth-primary cursor-pointer"
                                  checked={isSelected}
                                  onChange={() => handleToggleTest(id)}
                                />
                                <span>{test.name}</span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Tests Chips Display */}
                {formData.test_type.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
                    {formData.test_type.map((id) => {
                      const testObj = fetchedTestTypes.find(
                        (t) => (t.sqid || t.name) === id
                      );
                      const name = testObj?.name || id;
                      return (
                        <div
                          key={id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 shadow-2xs"
                        >
                          <span className="truncate max-w-[200px]">{name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTest(id)}
                            className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Specimen needed Card */}
              <div className="border border-gray-200/80 rounded-xl p-4 bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.02)]">
                <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                  Specimen needed
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter specimen or specimen type (e.g. Blood, Urine, Stool)"
                    value={formData.specimen}
                    onChange={(e) =>
                      setFormData({ ...formData, specimen: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-docuhealth-primary transition-colors placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Additional information (optional) Card */}
              <div className="border border-gray-200/80 rounded-xl p-4 bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.02)]">
                <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                  Additional information (optional)
                </label>
                <textarea
                  className="border border-gray-200 rounded-lg w-full h-24 p-3 text-sm outline-none focus:border-docuhealth-primary transition-colors resize-none placeholder-gray-400 text-gray-700"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Add comment..."
                ></textarea>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                disabled={
                  isLabPending ||
                  !formData.category ||
                  formData.test_type.length === 0
                }
                className="w-full sm:w-auto cursor-pointer bg-docuhealth-primary text-white py-3 px-8 rounded-full font-medium text-sm transition-opacity hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLabRequest}
              >
                {isLabPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Creating order...
                  </span>
                ) : (
                  "Create order"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderLabModal;
