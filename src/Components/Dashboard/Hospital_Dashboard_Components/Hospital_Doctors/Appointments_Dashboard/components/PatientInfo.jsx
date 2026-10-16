import React, { useState } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, X, Check, ChevronDown, Image, FileText, Eye, ArrowDownToLine } from "lucide-react";
import TabComponent from "./TabComponent";
import getTabs from "./TabDetails";
import OrderLabModal from "./OrderLabModal";
import { useCheckInOwnership } from "../../../../../../hooks/useCheckInOwnership";
import formatRecordDate, {
  formatFullDateTime,
  getAge,
} from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTestCategories, fetchLabTests } from "../../../../../../queries/Hospital/lab/requests";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { renderListOrString, renderLabTests, renderDrugRecords } from "../../../../../../utils/soapNoteHelpers";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";
import { closeCheckIn } from "../../../../../../queries/Hospital/doctor/checkIns";
import { closeAppointment, isAppointmentClosed } from "../../../../../../queries/Hospital/appointments";
import PatientInfoCard from "../../../../../ui/PatientInfoCard";
import VitalSignsCard from "../../../../../ui/VitalSignsCard";
import ClinicalSummaryCard from "../../../../../ui/ClinicalSummaryCard";
import Select from "../../../../../ui/Select";
import Modal from "../../../../../ui/Modal";
import PatientDetailSkeleton from "../../../../../ui/PatientDetailSkeleton";
import EmptyState from "../../../../../ui/EmptyState";

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

const PatientInfo = ({ selectedPatientDetails, setSeePatientDetails, hideCreateOrder, isOutpatient, initialTabTitle }) => {
  const queryClient = useQueryClient();
  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [soapCurrentPage, setSoapCurrentPage] = useState(1);
  const [labCurrentPage, setLabCurrentPage] = useState(1);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckoutSuccessModal, setShowCheckoutSuccessModal] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: ({ checkIn, appointment }) => (checkIn ? closeCheckIn(checkIn) : closeAppointment(appointment)),
    onSuccess: () => {
      setShowCheckoutModal(false);
      setShowCheckoutSuccessModal(true);
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Could not check this patient out."));
    },
  });

  // Walk-ins close the check-in; booked visits close the appointment (needs its sqid, not the numeric id).
  const orderContext = resolveOrderContext(selectedPatientDetails);
  const checkoutTarget = orderContext.checkIn
    ? { checkIn: orderContext.checkIn }
    : selectedPatientDetails?.sqid && orderContext.appointment
      ? { appointment: selectedPatientDetails.sqid }
      : null;
  const appointmentAlreadyClosed = !orderContext.checkIn && isAppointmentClosed(selectedPatientDetails);
  const { isOtherDoctors } = useCheckInOwnership(orderContext.checkIn);

  const handleConfirmCheckout = () => {
    if (!checkoutTarget) {
      toast.error("This visit has no check-in or appointment to close.");
      setShowCheckoutModal(false);
      return;
    }
    checkoutMutation.mutate(checkoutTarget);
  };

  const handleDoneCheckout = () => {
    setShowCheckoutSuccessModal(false);
    queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
    queryClient.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
    if (setSeePatientDetails) {
      setSeePatientDetails(false);
    }
  };

  const hin = orderContext.hin;
  const pageSize = 6;

  const { data: patientFullInfo, isLoading: loadingInfo, isError: infoError, error: infoErrorDetail } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`);
      return res.data;
    },
    enabled: !!hin,
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
        `api/doctors/patient/records/${hin}?page=${soapCurrentPage}&size=${pageSize}`
      );
      return res.data;
    },
    enabled: !!hin,
  });

  const { data: labRecordsData, isLoading: labLoading } = useQuery({
    queryKey: ["patient-lab-records", hin, labCurrentPage],
    queryFn: async () => {
      try {
        const res = await axiosInstanceHos.get(
          `api/lab/test-orders/patient/${hin}?page=${labCurrentPage}&size=${pageSize}`
        );
        return res.data;
      } catch (err) {
        if (err?.response?.status === 404) return { results: [], count: 0 };
        throw err;
      }
    },
    enabled: !!hin,
    keepPreviousData: true,
  });


  return (
    <>
      {viewDetailMedicalRecord ? (
        <>
          <div className="bg-white my-5 border rounded-2xl pt-8 px-6 text-sm ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0  border-b pb-4 w-full">
              <button
                type="button"
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

                <span className=" text-sm">After Visit Summary Overview</span>
              </button>
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
              <button
                type="button"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setSeePatientDetails(false)}
              >
                <ArrowLeft className="w-4 h-4 text-gray-800" />
                <span>Patient details</span>
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* <p className="text-sm font-medium text-gray-800">
                  Status:{" "}
                  <span className="text-amber-500 capitalize">
                    {selectedPatientDetails?.status || "Pending"}
                  </span>
                </p> */}
                {!hideCreateOrder && !isOtherDoctors && (
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-sm rounded-full px-5 py-1.5 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Create a test order
                  </button>
                )}
                {appointmentAlreadyClosed ? (
                  <span className="w-full sm:w-auto text-center text-sm text-gray-400 border border-gray-200 rounded-full px-6 py-2">
                    Checked out
                  </span>
                ) : (
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-sm rounded-full px-6 py-2 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Check out patient
                  </button>
                )}
              </div>
            </div>

            {loadingInfo ? (
              <PatientDetailSkeleton tabs={5} />
            ) : infoError ? (
              <div className="py-16 text-center">
                <EmptyState
                  title="Couldn't load this patient's details"
                  description={
                    infoErrorDetail?.response?.status >= 500
                      ? "The server hit an error loading this patient. Please try again later."
                      : extractApiErrorMessage(infoErrorDetail, "Please try again in a moment.")
                  }
                />
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
                      <p className="text-[14px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <span className="font-medium">patient</span>
                        {(selectedPatientDetails?.patient_info?.payment_provider?.type || patientFullInfo?.patient_info?.payment_provider?.type || patientFullInfo?.patient_info?.plan_type) && (
                          <span className="text-[10px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2 py-0.5 rounded-full">
                            {selectedPatientDetails?.patient_info?.payment_provider?.type || patientFullInfo?.patient_info?.payment_provider?.type || patientFullInfo?.patient_info?.plan_type}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {(() => {
                  const tabs = getTabs({
                    patientFullInfo,
                    // getTabs (./TabDetails) destructures these exact keys —
                    // patientMedRecords / patientSoapNotes / medloading /
                    // soapNotesLoading. Passing medRecordsData / soapNotesData
                    // / medLoading / soapLoading left the Med Records and SOAP
                    // Notes tabs permanently on their empty state even when the
                    // API returned records.
                    patientMedRecords: medRecordsData?.results || [],
                    patientSoapNotes: soapNotesData?.results || [],
                    medloading: medLoading,
                    soapNotesLoading: soapLoading,
                    count: medRecordsData?.count || 0,
                    currentPage,
                    totalPages: Math.ceil((medRecordsData?.count || 0) / pageSize),
                    setCurrentPage,
                    soapCount: soapNotesData?.count || 0,
                    soapCurrentPage,
                    soapTotalPages: Math.ceil((soapNotesData?.count || 0) / pageSize),
                    setSoapCurrentPage,
                    labloading: labLoading,
                    patientLabRecords: labRecordsData?.results || [],
                    labCount: labRecordsData?.count || 0,
                    labCurrentPage,
                    labTotalPages: Math.ceil((labRecordsData?.count || 0) / pageSize),
                    setLabCurrentPage,
                    selectedPatientDetails,
                    setSelectedMedicalRecord,
                    setViewDetailMedicalRecord,
                    viewDetailMedicalRecord,
                    selectedMedicalRecord,
                  });
                  const initialIndex = initialTabTitle
                    ? tabs.findIndex((t) => t.title === initialTabTitle)
                    : 0;
                  return (
                    <TabComponent
                      tabs={tabs}
                      initialActiveIndex={initialIndex < 0 ? 0 : initialIndex}
                    />
                  );
                })()}
              </>
            )}
          </div>
        </>
      )}

      {/* ── Order Lab Modal ── */}
      {showOrderModal && (
        <OrderLabModal
          selectedPatientDetails={selectedPatientDetails}
          onClose={() => setShowOrderModal(false)}
        />
      )}
      {/* ── Checkout Confirmation Modal ── */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        maxWidth="md"
      >
        <div className="relative flex flex-col items-center text-center py-2 px-1">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowCheckoutModal(false)}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Info Icon */}
          <div className="flex items-center justify-center text-gray-900 mt-2 mb-3">
            <svg
              width="44"
              height="44"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.0026 36.6654C10.7979 36.6654 3.33594 29.2034 3.33594 19.9987C3.33594 10.7939 10.7979 3.33203 20.0026 3.33203C29.2073 3.33203 36.6693 10.7939 36.6693 19.9987C36.6693 29.2034 29.2073 36.6654 20.0026 36.6654ZM20.0026 33.332C27.3664 33.332 33.3359 27.3625 33.3359 19.9987C33.3359 12.6349 27.3664 6.66536 20.0026 6.66536C12.6388 6.66536 6.66927 12.6349 6.66927 19.9987C6.66927 27.3625 12.6388 33.332 20.0026 33.332ZM21.6693 17.4987V24.9987H23.3359V28.332H16.6693V24.9987H18.3359V20.832H16.6693V17.4987H21.6693ZM22.5026 13.332C22.5026 14.7127 21.3833 15.832 20.0026 15.832C18.6219 15.832 17.5026 14.7127 17.5026 13.332C17.5026 11.9513 18.6219 10.832 20.0026 10.832C21.3833 10.832 22.5026 11.9513 22.5026 13.332Z"
                fill="#1B2B40"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-5 text-center">
            Checkout patient
          </h3>

          {/* Notice Box */}
          <div className="w-full border border-gray-200/80 rounded-2xl p-5 mb-6 text-gray-700 text-sm leading-relaxed shadow-[0px_2px_12px_rgba(0,0,0,0.03)] text-left">
            Are you sure this patient is clear for checkout? by proceeding you agree that this patient is good to go and should not appear on the doctor’s encounter pool!
          </div>

          {/* Action Button (DocuHealth Primary Color) */}
          <button
            type="button"
            onClick={handleConfirmCheckout}
            disabled={checkoutMutation.isPending}
            className="w-full py-3.5 rounded-full bg-docuhealth-primary hover:bg-opacity-95 text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {checkoutMutation.isPending ? "Checking out..." : "Confirm checkout"}
          </button>
        </div>
      </Modal>

      {/* ── Checkout Success Modal ── */}
      <Modal
        isOpen={showCheckoutSuccessModal}
        onClose={handleDoneCheckout}
        maxWidth="md"
      >
        <div className="flex flex-col items-center text-center py-4 px-2">
          {/* Green Check Icon */}
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Success Message */}
          <p className="text-base font-normal text-gray-800 mb-8 max-w-xs text-center leading-relaxed">
            You have successfully checked this patient out from the doctor’s encounter pool!
          </p>

          {/* Done Button */}
          <button
            type="button"
            onClick={handleDoneCheckout}
            className="w-full py-3.5 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </Modal>

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
  hideCreateOrder: PropTypes.bool,
  isOutpatient: PropTypes.bool,
  // Tab title to open on for the first render (e.g. "Encounter Notes" after a
  // note is created). Matched against getTabs() titles.
  initialTabTitle: PropTypes.string,
};

export default PatientInfo;
