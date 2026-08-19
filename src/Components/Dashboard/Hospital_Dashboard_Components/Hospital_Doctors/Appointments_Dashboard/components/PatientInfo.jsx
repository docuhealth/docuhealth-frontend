import React, { useState } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, X } from "lucide-react";
import TabComponent from "./TabComponent";
import getTabs from "./TabDetails";
import { Image, FileText, Eye, ArrowDownToLine } from "lucide-react";
import formatRecordDate, {
  formatFullDateTime,
  getAge,
} from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchTestCategories, fetchLabTests } from "../../../../../../queries/Hospital/lab/requests";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { renderListOrString, renderLabTests, renderDrugRecords } from "../../../../../../utils/soapNoteHelpers";
import PatientInfoCard from "../../../../../ui/PatientInfoCard";
import VitalSignsCard from "../../../../../ui/VitalSignsCard";
import ClinicalSummaryCard from "../../../../../ui/ClinicalSummaryCard";

const DUMMY_PATIENT_INFO = {
  patient_info: {
    firstname: "Amiefa",
    lastname: "Obed",
    dob: "1990-05-14",
    email: "amiefa.obed@email.com",
    phone_num: "+234 801 234 5678",
    street: "12 Bode Thomas Street",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    plan_type: "HMO",
  },
};

const PatientInfo = ({ selectedPatientDetails, setSeePatientDetails, hideCreateOrder }) => {
  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [soapCurrentPage, setSoapCurrentPage] = useState(1);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isTestTypeDropdownOpen, setIsTestTypeDropdownOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ category: "", test_type: [], note: "", ignore_duplicate_warning: false });
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const hin = (selectedPatientDetails?.patient_info?.hin || selectedPatientDetails?.patient?.hin) || selectedPatientDetails?.patient_hin;
  const pageSize = 6;

  const { data: patientFullInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`);
      return res.data;
    },
    enabled: !!hin,
    onError: () => toast.error("Error fetching patient's details"),
  });

  const { data: medRecordsData, isLoading: medLoading } = useQuery({
    queryKey: ["patient-med-records", hin, currentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/doctors/patient/records/${hin}?page=${currentPage}&size=${pageSize}`
      );
      return res.data;
    },
    enabled: !!hin,
    keepPreviousData: true,
  });

  const { data: soapNotesData, isLoading: soapLoading } = useQuery({
    queryKey: ["patient-soap-notes", hin, soapCurrentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/medical-records/soap-note/${hin}?page=${soapCurrentPage}&size=${pageSize}`
      );
      return res.data;
    },
    enabled: !!hin,
  });

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
        patient: (selectedPatientDetails?.patient_info?.hin || selectedPatientDetails?.patient?.hin) || selectedPatientDetails?.patient_hin,
        order_source: "staff_appointment_order",
        items: payload.test_type.map((testSqid) => ({
          test: testSqid,
          note: payload.note,
        })),
      };
      if (selectedPatientDetails?.sqid) {
        requestPayload.appointment = selectedPatientDetails.sqid;
      }
      if (payload.ignore_duplicate_warning) {
        requestPayload.ignore_duplicate_warning = true;
      }
      return axiosInstanceHos.post("api/lab/test-orders/create", requestPayload);
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
      {viewDetailMedicalRecord ? (
        <>
          <div className="bg-white my-5 border rounded-2xl pt-8 px-6 text-sm ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0  border-b pb-4 w-full">
              <div
                className="flex justify-start items-center gap-1 cursor-pointer"
                onClick={() => setViewDetailMedicalRecord(false)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                    fill="var(--color-docuhealth-dark)"
                  />
                </svg>

                <h2 className=" text-sm">After Visit Summary Overview</h2>
              </div>
              <div className=" flex flex-col sm:flex-row justify-end items-center gap-3 w-full sm:w-auto">
                <div className="flex justify-center items-center gap-1 border border-docuhealth-primary py-1.5 px-4 rounded-full w-full sm:w-auto text-docuhealth-primary">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.5 1C8.77615 1 9 1.22386 9 1.5V3.5H10.5C10.7761 3.5 11 3.72386 11 4V9C11 9.27615 10.7761 9.5 10.5 9.5H9V10.5C9 10.7761 8.77615 11 8.5 11H3.5C3.22386 11 3 10.7761 3 10.5V9.5H1.5C1.22386 9.5 1 9.27615 1 9V4C1 3.72386 1.22386 3.5 1.5 3.5H3V1.5C3 1.22386 3.22386 1 3.5 1H8.5ZM8 8.5H4V10H8V8.5ZM10 4.5H2V8.5H3V8C3 7.72385 3.22386 7.5 3.5 7.5H8.5C8.77615 7.5 9 7.72385 9 8V8.5H10V4.5ZM4 5V6H2.5V5H4ZM8 2H4V3.5H8V2Z"
                      fill="var(--color-docuhealth-primary)"
                    />
                  </svg>

                  <p>Print summary</p>
                </div>
                <div className="flex justify-center items-center gap-1 border border-docuhealth-primary py-1.5 px-4 rounded-full text-white bg-docuhealth-primary w-full sm:w-auto">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    fill="var(--color-docuhealth-primary)"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.5 7.25C0.5 6.0858 1.11215 5.06455 2.03213 4.4906C2.28235 2.522 3.96343 1 6 1C8.03655 1 9.71765 2.522 9.96785 4.4906C10.8878 5.06455 11.5 6.0858 11.5 7.25C11.5 8.9608 10.1781 10.3629 8.5 10.4906L3.5 10.5C1.82189 10.3629 0.5 8.9608 0.5 7.25ZM8.42415 9.4934C9.59085 9.40465 10.5 8.42805 10.5 7.25C10.5 6.4635 10.0942 5.7481 9.43855 5.33905L9.0357 5.0877L8.97585 4.61669C8.78675 3.12902 7.5144 2 6 2C4.48558 2 3.21323 3.12902 3.02415 4.61669L2.96428 5.0877L2.56144 5.33905C1.90578 5.7481 1.5 6.4635 1.5 7.25C1.5 8.42805 2.40917 9.40465 3.57585 9.4934L3.6625 9.5H8.3375L8.42415 9.4934ZM6.5 6H8L6 8.5L4 6H5.5V4H6.5V6Z"
                      fill="#FFF"
                    />
                  </svg>

                  <p>Download PDF</p>
                </div>
              </div>
            </div>

            <PatientInfoCard selectedMedicalRecord={selectedMedicalRecord} />
            <VitalSignsCard vitalSigns={selectedMedicalRecord?.vital_signs || selectedMedicalRecord?.vital_signs_info} />
            <ClinicalSummaryCard selectedMedicalRecord={selectedMedicalRecord} />
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="font-medium mb-4">Uploaded Documents / Images</p>
              <div>
                {(selectedMedicalRecord?.investigation_docs || selectedMedicalRecord?.attachments)?.length > 0 ? (
                  (selectedMedicalRecord?.investigation_docs || selectedMedicalRecord?.attachments).map((attachment, index) => {
                    const fileName =
                      attachment.filename || `Document_${index + 1}`;
                    const fileUrl = attachment.file || attachment.url; // Supporting both common keys
                    const fileSizeMB = attachment.size
                      ? (attachment.size / (1024 * 1024)).toFixed(1) + " MB"
                      : "0.5 MB"; // Fallback placeholder if size is missing
                    const fileDate = formatFullDateTime(
                      selectedMedicalRecord?.created_at,
                    );

                    // Determine file type
                    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                      fileName,
                    );
                    const isPdf = /\.pdf$/i.test(fileName);
                    const Icon = isImage ? Image : isPdf ? FileText : FileText;

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 sm:items-center bg-white border rounded-lg px-4 py-3 mb-3 "
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[12px]">
                          <div className="p-2 bg-docuhealth-primary/10 rounded-md">
                            <Icon className="text-docuhealth-primary" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {fileName}
                            </p>
                            <p className="text-gray-500">
                              {fileDate}{fileDate && fileSizeMB ? " • " : ""}{fileSizeMB}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 text-[12px] w-full sm:w-auto">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 border border-docuhealth-primary text-docuhealth-primary rounded-full font-medium hover:bg-blue-50 transition py-1 px-3 w-full sm:w-28"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </a>
                          <a
                            href={fileUrl}
                            download
                            className="flex items-center justify-center gap-1 bg-docuhealth-primary text-white rounded-full font-medium hover:bg-docuhealth-dark-primary transition py-1 px-3 w-full sm:w-28"
                          >
                            <ArrowDownToLine className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[12px] text-gray-500">NIL</p>
                )}
              </div>
            </div>

            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="font-medium mb-4">Follow Up / Appointment</p>
              <div className="pb-1">
                <p className="text-[12px]">
                  {" "}
                  Status :{" "}
                  <span className="font-medium ">
                    {" "}
                    {formatRecordDate(
                      selectedMedicalRecord?.appointment?.scheduled_time,
                    ) || "NIL"}
                  </span>
                </p>
                <p className="text-[12px]">
                  {" "}
                  Date / Time :{" "}
                  <span className="font-medium ">
                    {" "}
                    {formatFullDateTime(
                      selectedMedicalRecord?.appointment?.scheduled_time,
                    ) || "NIL"}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="font-medium mb-4">Referral :</p>
              <div className="pb-1">
                <p className="text-[12px]">
                  Status:{" "}
                  <span className="font-medium">
                    {selectedMedicalRecord?.referred_docuhealth_hosp ||
                    selectedMedicalRecord?.referred_hosp
                      ? "True"
                      : "False"}
                  </span>
                </p>

                <p className="text-[12px]">
                  Referred Hospital:{" "}
                  <span className="font-medium">
                    {selectedMedicalRecord?.referred_docuhealth_hosp
                      ? `${selectedMedicalRecord.referred_docuhealth_hosp} (DocuHealth)`
                      : selectedMedicalRecord?.referred_hosp || "NIL"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
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

            {loadingInfo ? (
              <div className="flex justify-center items-center gap-3 px-2 py-3">
                <p className="text-sm text-gray-500 pt-2">Loading patient data...</p>
              </div>
            ) : (
              <>
                <div className="py-5 border-b">
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full bg-docuhealth-border-light flex items-center justify-center text-xl text-black shrink-0">
                      {`${patientFullInfo?.patient_info?.firstname?.[0] ?? ""}${patientFullInfo?.patient_info?.lastname?.[0] ?? ""}`.toUpperCase()}
                    </div>

                    <div className="flex flex-col items-start ml-3">
                      <p className="text-[16px] font-medium text-docuhealth-dark">
                        {patientFullInfo?.patient_info?.firstname}{" "}
                        {patientFullInfo?.patient_info?.lastname}
                      </p>
                      <p className="text-[14px] text-gray-500">
                        {patientFullInfo?.patient_info?.plan_type
                          ? `${patientFullInfo.patient_info.plan_type} patient`
                          : "patient"}
                      </p>
                    </div>
                  </div>
                </div>

            <div>
              <TabComponent
                tabs={getTabs({
                  medloading: medLoading,
                  soapNotesLoading: soapLoading,
                  patientMedRecords: medRecordsData?.results || [],
                  patientSoapNotes: soapNotesData?.results || [],
                  patientFullInfo,

                  count: medRecordsData?.count || 0,
                  currentPage,
                  totalPages: Math.ceil(
                    (medRecordsData?.count || 0) / pageSize,
                  ),

                  setCurrentPage,

                  soapCount: soapNotesData?.count || 0,
                  soapCurrentPage,
                  soapTotalPages: Math.ceil(
                    (soapNotesData?.count || 0) / pageSize,
                  ),

                  setSoapCurrentPage,

                  setSelectedMedicalRecord,
                  setViewDetailMedicalRecord,
                })}
              />
            </div>
            </>
            )}
          </div>
        </>
      )}

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
              className="w-full bg-docuhealth-primary text-white text-sm font-medium py-2.5 rounded-full transition-colors disabled:opacity-50 hover:bg-docuhealth-primary-variant"
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
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:opacity-90 transition-colors"
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
