import React, { useState } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, X } from "lucide-react";
import LabTabComponent from "./LabTabComponent";
import getTabs from "./LabTabDetails";
import { Image, FileText, Eye, ArrowDownToLine } from "lucide-react";
import formatRecordDate, {
  formatFullDateTime,
  getAge,
} from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchTestCategories, fetchLabTests, createLabTestOrder } from "../../../../../queries/Hospital/lab/requests";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";

const PatientInfo = ({ selectedPatientDetails, setSeePatientDetails, hideCreateOrder }) => {

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isTestTypeDropdownOpen, setIsTestTypeDropdownOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ category: "", test_type: [], note: "", ignore_duplicate_warning: false });
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const p = selectedPatientDetails?.patient ?? {};

  const { data: categoriesData } = useQuery({
    queryKey: ["lab-test-categories"],
    queryFn: fetchTestCategories,
    staleTime: Infinity,
    enabled: showOrderModal,
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.results ?? []);

  const { data: testTypesData, isLoading: isTestTypesLoading } = useQuery({
    queryKey: ["lab-tests", orderForm.category],
    queryFn: fetchLabTests,
    enabled: !!orderForm.category,
    staleTime: Infinity,
  });
  const fetchedTestTypes = Array.isArray(testTypesData) ? testTypesData : (testTypesData?.results ?? []);

  const { mutate: createOrder, isPending: isOrderPending } = useMutation({
    mutationFn: (payload) => {
      const requestPayload = {
        patient: selectedPatientDetails?.patient?.hin || selectedPatientDetails?.patient_hin,
        order_source: "walk_in",
        items_data: payload.test_type.map((testSqid) => ({
          test: testSqid,
          note: payload.note,
        })),
      };
      if (payload.ignore_duplicate_warning) {
        requestPayload.ignore_duplicate_warning = true;
      }
      return createLabTestOrder(requestPayload);
    },
    onSuccess: () => {
      setShowOrderModal(false);
      setOrderForm({ category: "", test_type: [], note: "", ignore_duplicate_warning: false });
      setDuplicateWarning(null);
      setShowSuccessModal(true);
    },
    onError: (err) => {
      if (err.response?.status === 400 && err.response?.data?.duplicate_warning) {
        setDuplicateWarning(err.response.data.duplicate_warning);
      } else {
        toast.error(err.response?.data?.message || "Failed to create order.");
      }
    },
  });

  const handleCreateOrder = () => {
    if (!orderForm.category || orderForm.test_type.length === 0) {
      toast.error("Please select a category and at least one test type.");
      return;
    }
    createOrder({ ...orderForm, ignore_duplicate_warning: false });
  };

  const handleOverrideSubmit = () => {
    createOrder({ ...orderForm, ignore_duplicate_warning: true });
  };

  return (
    <>
          <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-4 sm:gap-0">
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setSeePatientDetails(false)}
              >
                <ArrowLeft className="w-4 h-4 text-gray-800" />
                <p>Patient details</p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* <p className="text-sm font-medium text-gray-800">
                  Status:{" "}
                  <span className="text-amber-500 capitalize">
                    {selectedPatientDetails?.status || "Pending"}
                  </span>
                </p> */}
                {!hideCreateOrder && (
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-sm rounded-full px-5 py-1.5 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Create a test order
                  </button>
                )}
              </div>
            </div>

            <div className="py-5 border-b">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-docuhealth-border-light flex items-center justify-center text-xl text-black shrink-0">
                  {`${p?.firstname?.[0] ?? ""}${p?.lastname?.[0] ?? ""}`.toUpperCase()}
                </div>

                <div className="flex flex-col items-start ml-3">
                  <p className="text-[16px] font-medium text-docuhealth-dark">
                    {p?.firstname}{" "}
                    {p?.lastname}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    {p?.plan_type
                      ? `${p.plan_type} patient`
                      : "patient"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <LabTabComponent
                tabs={getTabs({ patientFullInfo: { patient_info: selectedPatientDetails?.patient || {} } })}
              />
            </div>
          </div>

      {/* ── Create an Order Modal ── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-6">

            {/* Header */}
            <div className="relative flex items-start justify-center">
              <div className="text-center">
                <h3 className="text-[20px] font-semibold text-docuhealth-dark">Order Lab test</h3>
                <p className="text-sm text-gray-500 mt-1">Kindly order a lab test</p>
              </div>
              <button
                onClick={() => { setShowOrderModal(false); setOrderForm({ category: "", test_type: [], note: "", ignore_duplicate_warning: false }); setIsTestTypeDropdownOpen(false); setDuplicateWarning(null); }}
                className="absolute right-0 top-0 text-gray-800 hover:text-black transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-docuhealth-dark font-medium">Category</label>
              <div className="relative">
                <select
                  value={orderForm.category}
                  onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value, test_type: [] })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-docuhealth-primary transition-colors appearance-none"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.sqid || cat.id} value={cat.sqid || cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Test Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-docuhealth-dark font-medium">Test type</label>
              <div className="relative">
                <button
                  type="button"
                  disabled={!orderForm.category}
                  onClick={() => setIsTestTypeDropdownOpen((v) => !v)}
                  className={`w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-left flex justify-between items-center transition-colors ${!orderForm.category ? "opacity-60 cursor-not-allowed bg-gray-50" : "bg-white focus:border-docuhealth-primary"}`}
                >
                  <span className="truncate text-gray-700">
                    {isTestTypesLoading
                      ? "Loading..."
                      : orderForm.test_type.length > 0
                        ? orderForm.test_type.map((id) => fetchedTestTypes.find((t) => (t.sqid || t.name) === id)?.name || id).join(", ")
                        : "Select test type"}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isTestTypeDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isTestTypeDropdownOpen && fetchedTestTypes.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto overflow-x-hidden">
                    {fetchedTestTypes.map((test, index) => {
                      const id = test.sqid || test.name;
                      const checked = orderForm.test_type.includes(id);
                      return (
                        <label key={id} className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-docuhealth-dark ${index !== fetchedTestTypes.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setOrderForm((prev) => ({
                                ...prev,
                                test_type: checked
                                  ? prev.test_type.filter((t) => t !== id)
                                  : [...prev.test_type, id],
                              }));
                            }}
                            className="w-4 h-4 accent-blue-600 rounded border-gray-300"
                          />
                          {test.name}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Add note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-docuhealth-dark font-medium">Add note:</label>
              <textarea
                value={orderForm.note}
                onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })}
                placeholder="Please do note that this account will be on read-only-mode. This will change once the account is upgraded once the owner is 18 years old."
                className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500 bg-white outline-none focus:border-docuhealth-primary transition-colors resize-none h-28"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleCreateOrder}
              disabled={isOrderPending}
              className="w-full bg-docuhealth-primary text-white text-sm font-medium py-2.5 rounded-full transition-colors disabled:opacity-50 hover:bg-docuhealth-dark-primary"
            >
              {isOrderPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : "Proceed"}
            </button>
          </div>
        </div>
      )}

      {/* ── Duplicate Warning Modal ── */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-6">
            <div className="text-center">
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
            <div className="flex gap-3">
              <button
                onClick={() => setDuplicateWarning(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                disabled={isOrderPending}
                className="flex-1 px-4 py-2 bg-docuhealth-primary text-white rounded-lg hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-50"
              >
                {isOrderPending ? "Proceeding..." : "Proceed Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              You have successfully created/<br />accepted a patient&apos;s test request!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:bg-docuhealth-dark-primary transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

PatientInfo.propTypes = {
  selectedPatientDetails: PropTypes.shape({
    status:  PropTypes.string,
    patient: PropTypes.shape({
      hin:       PropTypes.string,
      firstname: PropTypes.string,
      lastname:  PropTypes.string,
      dob:       PropTypes.string,
      email:     PropTypes.string,
      phone_num: PropTypes.string,
      street:    PropTypes.string,
      city:      PropTypes.string,
      state:     PropTypes.string,
      country:   PropTypes.string,
      gender:    PropTypes.string,
    }),
  }),
  setSeePatientDetails: PropTypes.func,
};

export default PatientInfo;
