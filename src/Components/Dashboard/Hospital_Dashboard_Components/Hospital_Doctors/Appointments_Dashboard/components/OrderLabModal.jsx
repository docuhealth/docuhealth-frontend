import React, { useState } from "react";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchTestCategories, fetchLabTests } from "../../../../../../queries/Hospital/lab/requests";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";

/**
 * Standalone "Order lab" flow opened directly from the
 * OtherMedicalServicesFab quick-service menu.
 */
const OrderLabModal = ({ selectedPatientDetails, onClose }) => {
  const orderContext = resolveOrderContext(selectedPatientDetails);
  const [isTestTypeDropdownOpen, setIsTestTypeDropdownOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    patient_hin: orderContext.hin,
    note: "",
    category: "",
    test_type: [],
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["lab-test-categories"],
    queryFn: fetchTestCategories,
    staleTime: Infinity,
  });

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.results ?? []);

  const { data: testTypesData, isLoading: isTestTypesLoading } = useQuery({
    queryKey: ["lab-tests", formData.category],
    queryFn: fetchLabTests,
    enabled: !!formData.category,
    staleTime: Infinity,
  });

  const fetchedTestTypes = Array.isArray(testTypesData)
    ? testTypesData
    : (testTypesData?.results ?? []);

  const { mutate: labMutate, isPending: isLabPending } = useMutation({
    mutationFn: async (payload) => {
      const requestPayload = {
        patient: payload.patient_hin,
        order_source: orderContext.orderSource,
        items: payload.test_type.map((testSqid) => ({
          test: testSqid,
          note: payload.note,
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
    },
    onError: (err) => {
      if (err.response?.status === 400 && err.response?.data?.duplicate_warning) {
        setDuplicateWarning(err.response.data.duplicate_warning);
      } else {
        console.error("Error assigning patient to lab scientist:", err);
        toast.error(
          err.response?.data?.message || "Lab test request failed.",
        );
      }
    },
  });

  const handleLabRequest = () => {
    if (!formData.category || formData.test_type.length === 0 || !formData.note) {
      toast.error("Please fill in all required lab test fields.");
      return;
    }
    labMutate({ ...formData, ignore_duplicate_warning: false });
  };

  const handleOverrideSubmit = () => {
    labMutate({ ...formData, ignore_duplicate_warning: true });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
        {showSuccess ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
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
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:opacity-90 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : duplicateWarning ? (
          <>
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                disabled={isLabPending}
                className="flex-1 px-4 py-2 bg-docuhealth-primary text-white rounded-lg hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-50"
              >
                {isLabPending ? "Proceeding..." : "Proceed Anyway"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black"
              >
                <i className="bx bx-x text-2xl cursor-pointer"></i>
              </button>
            </div>
            <h2 className="text-center font-semibold text-lg text-gray-800">
              Order Lab test
            </h2>
            <p className="text-center text-gray-500 mb-4 text-sm">
              Kindly order a lab test
            </p>

            <div className="mb-4 text-[12px]">
              <p className="block font-medium text-gray-700 mb-1">Category</p>
              <div className="relative">
                <select
                  className="border rounded-lg w-full p-2.5 text-[12px] outline-none focus:border-docuhealth-primary appearance-none"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value, test_type: [] });
                  }}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.sqid} value={cat.sqid}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div className="mb-4 relative text-[12px]">
              <p className="block font-medium text-gray-700 mb-1">Test type</p>
              <div
                className={`border rounded-lg w-full p-2.5 outline-none focus:border-docuhealth-primary flex justify-between items-center bg-white ${
                  !formData.category ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"
                }`}
                onClick={() => {
                  if (formData.category) setIsTestTypeDropdownOpen(!isTestTypeDropdownOpen);
                }}
              >
                <span className="truncate pr-2">
                  {isTestTypesLoading
                    ? "Loading tests..."
                    : formData.test_type.length > 0
                      ? formData.test_type.map((id) => fetchedTestTypes.find((t) => (t.sqid || t.name) === id)?.name || id).join(", ")
                      : "Select test type"}
                </span>
                <svg className="fill-current h-4 w-4 text-gray-700 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>

              {isTestTypeDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {fetchedTestTypes.map((test) => (
                    <label key={test.sqid || test.name} className="flex items-center p-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                      <input
                        type="checkbox"
                        className="mr-3 w-4 h-4 text-docuhealth-primary rounded border-gray-300 focus:ring-docuhealth-primary"
                        checked={formData.test_type.includes(test.sqid || test.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, test_type: [...formData.test_type, test.sqid || test.name] });
                          } else {
                            setFormData({ ...formData, test_type: formData.test_type.filter((t) => t !== (test.sqid || test.name)) });
                          }
                        }}
                      />
                      <span className="text-[12px] text-gray-700">{test.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-2 text-[12px]">
              <p className="mb-1 text-gray-700 font-medium">Add note:</p>
              <textarea
                className="border rounded-lg w-full h-[100px] p-3 text-[12px] outline-none focus:border-docuhealth-primary"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Please do note that this account will be on read-only-mode. This will change once the account is upgraded once the owner is 18 years old."
              ></textarea>
            </div>

            <button
              disabled={isLabPending || !formData.note || !formData.category || formData.test_type.length === 0}
              className={`mt-6 w-full cursor-pointer bg-docuhealth-primary text-white py-2 rounded-full disabled:bg-docuhealth-primary/60 ${isLabPending ? "bg-docuhealth-primary/60 cursor-not-allowed" : ""}} text-sm `}
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
                  Processing Request
                </span>
              ) : (
                "Proceed"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderLabModal;
