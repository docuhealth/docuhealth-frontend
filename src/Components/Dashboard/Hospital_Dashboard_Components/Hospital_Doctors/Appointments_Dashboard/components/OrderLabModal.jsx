import React, { useState } from "react";
import toast from "react-hot-toast";
import { X, Search } from "lucide-react";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTestCategories,
  fetchLabTests,
  searchLabTests,
} from "../../../../../../queries/Hospital/lab/requests";
import useDebounce from "../../../../../../hooks/useDebounce";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";
import Modal from "../../../../../ui/Modal";
import Select from "../../../../../ui/Select";
import MultiSelect from "../../../../../ui/MultiSelect";

/**
 * Unified "Order Laboratory" modal using the shared Modal component.
 * Used across Doctor Appointments (FAB + Patient Info), Outpatient, and Inpatient flows.
 */
const OrderLabModal = ({ selectedPatientDetails, onClose, isOpen = true }) => {
  const queryClient = useQueryClient();
  const orderContext = resolveOrderContext(selectedPatientDetails);

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const [testSearch, setTestSearch] = useState("");
  const debouncedTestSearch = useDebounce(testSearch.trim(), 300);

  const { data: searchData, isFetching: isSearching } = useQuery({
    queryKey: ["lab-tests-search", debouncedTestSearch],
    queryFn: searchLabTests,
    enabled: debouncedTestSearch.length >= 2,
  });

  const searchResults = Array.isArray(searchData)
    ? searchData
    : (searchData?.results ?? []);

  // A search hit fills category + test + specimen. Same category adds to the
  // current picks; a different one resets them, like picking a new category.
  const handlePickSearchResult = (test) => {
    const categorySqid = test.category?.sqid;
    if (!categorySqid) return;
    const specimen =
      test.specimens?.find((s) => s.is_preferred)?.name ||
      test.specimens?.[0]?.name;

    setFormData((prev) => ({
      ...prev,
      category: categorySqid,
      specimen: specimen || prev.specimen,
      test_type:
        prev.category === categorySqid
          ? prev.test_type.includes(test.sqid)
            ? prev.test_type
            : [...prev.test_type, test.sqid]
          : [test.sqid],
    }));
    setTestSearch("");
  };

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
      return await axiosInstanceHos.post(
        "api/lab/test-orders/create",
        requestPayload,
      );
    },
    onSuccess: () => {
      setDuplicateWarning(null);
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["patient-lab-records"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-lab-records"] });
    },
    onError: (err) => {
      if (
        err.response?.status === 400 &&
        err.response?.data?.duplicate_warning
      ) {
        setDuplicateWarning(err.response.data.duplicate_warning);
      } else {
        console.error("Error assigning patient to lab scientist:", err);
        toast.error(extractApiErrorMessage(err, "Lab test request failed."));
        queryClient.invalidateQueries({ queryKey: ["lab-test-categories"] });
        queryClient.invalidateQueries({
          queryKey: ["lab-tests", formData.category],
        });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={showSuccess || duplicateWarning ? "md" : "2xl"}
      className="max-h-[88vh] flex flex-col p-2"
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
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              You have successfully assigned patient
              <br />
              to a lab scientist for a test!
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
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Duplicate Order Detected
              </h3>
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap text-left bg-orange-50 p-3 rounded-md">
                {duplicateWarning}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Are you sure you want to proceed?
              </p>
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
              <h2 className="text-xl font-bold text-gray-900">
                Order Laboratory
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Fill in the required details below to create a task!
              </p>
            </div>

            {/* Modal Scrollable Body */}
            <div className="py-4 space-y-4 max-h-[58vh] overflow-y-auto pr-1">
              {/* Quick test search */}
              <div>
                <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                  Search for a test
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    placeholder="Type a test name, e.g. Full Blood Count, Malaria, HbA1c"
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-3 text-sm text-gray-700 outline-none focus:border-docuhealth-primary transition-colors placeholder-gray-400"
                  />
                  {testSearch && (
                    <button
                      type="button"
                      onClick={() => setTestSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {testSearch.trim().length >= 2 && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
                    {isSearching || debouncedTestSearch !== testSearch.trim() ? (
                      <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
                    ) : searchResults.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-400">
                        No tests match &ldquo;{testSearch.trim()}&rdquo;
                      </p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
                        {searchResults.map((test) => {
                          const alreadyPicked =
                            formData.category === test.category?.sqid &&
                            formData.test_type.includes(test.sqid);
                          return (
                            <button
                              key={test.sqid}
                              type="button"
                              disabled={alreadyPicked}
                              onClick={() => handlePickSearchResult(test)}
                              className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-default disabled:bg-gray-50"
                            >
                              <span className="text-sm text-gray-800">
                                {test.name}
                              </span>
                              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-docuhealth-primary/10 text-docuhealth-primary">
                                {alreadyPicked ? "Added" : test.category?.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex-1 border-t border-gray-200" />
                or pick by category
                <span className="flex-1 border-t border-gray-200" />
              </div>

              {/* Category Card */}
              <div className="">
                <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.category}
                  placeholder="Select category"
                  options={categories.map((cat) => ({
                    value: String(cat.sqid || cat.id),
                    label: cat.name,
                  }))}
                  onChange={(value, option) =>
                    setFormData({
                      ...formData,
                      category: value,
                      specimen: option.label || formData.specimen,
                      test_type: [],
                    })
                  }
                />
              </div>

              {/* Test Card */}
              <div className="">
                <label className="block text-sm font-semibold text-docuhealth-primary mb-2">
                  Test <span className="text-red-500">*</span>
                </label>
                <MultiSelect
                  values={formData.test_type}
                  placeholder="Select test"
                  disabled={!formData.category}
                  isLoading={isTestTypesLoading && !!formData.category}
                  emptyText="No tests found"
                  options={fetchedTestTypes.map((test) => ({
                    value: test.sqid || test.name,
                    label: test.name,
                  }))}
                  onChange={(values) =>
                    setFormData((prev) => ({ ...prev, test_type: values }))
                  }
                />
              </div>

              {/* Specimen needed Card */}
              <div className="">
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
              <div className="">
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
