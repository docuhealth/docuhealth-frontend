import React, { useState, useContext, useRef, useEffect } from "react";
import { ArrowLeft, X, ChevronDown, Search } from "lucide-react";
import GeneralPatientInfoForm from "../../../Components/ui/GeneralPatientInfoForm";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import OnboardNewPatient from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Receptionist/Home_Dashboard/components/OnboardNewPatient";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../lib/axios/hospital";
import BookAppointment from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Receptionist/Home_Dashboard/components/BookAppointment";
import AppointmentsList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Receptionist/Appointments_Dashboard/AppointmentsList";
import RecentPatients from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Receptionist/Home_Dashboard/components/RecentPatients";
import { HosWardContext } from "../../../context/HospitalContext/HosWardContext";
import { ReceptionistAppContext } from "../../../context/HospitalContext/Receptionist/ReceptionistAppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../Components/ui/Modal";
import { formatFullDate, formatTime } from "../../../Components/Dashboard/Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter";
import {
  fetchPaymentProviders,
  savePatientPaymentCategory,
} from "../../../queries/Hospital/receptionist/paymentCategory";

// Dropdown with an in-panel search box, used anywhere a select needs to be
// filterable (HMO providers, company partners, ...). Fully self-contained —
// its open/search state resets for free whenever the parent unmounts it.
// `options` is [{ value, label, ...anythingElse }]; `onChange(value, option)`
// hands back the whole option so callers can keep the full record (sqid + name).
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  isLoading = false,
  emptyText = "No options found.",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-3 text-sm text-left cursor-pointer hover:border-docuhealth-primary focus:outline-hidden focus:border-docuhealth-primary"
      >
        <span>{selectedLabel || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="relative p-2 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-md focus:outline-hidden focus:border-docuhealth-primary"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-3 text-sm text-gray-400">Loading...</p>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value, option);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                    option.value === value
                      ? "bg-docuhealth-primary/10 text-docuhealth-primary font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-400">{emptyText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Hospital_Receptionist_Home_Dashboard = () => {
  const queryClient = useQueryClient();
  const [newPatient, setNewPatient] = useState(false);
  const [checkHIN, setCheckHIN] = useState(false);
  const [patientHIN, setPatientHIN] = useState("");
  const [patientDetails, setPatientDetails] = useState([]);
  // const [patientEmail, setPatientEmail] = useState('')
  const [bookAppointment, setBookAppointment] = useState(false);

  const [checkPatientIn, setCheckPatientIn] = useState(false);
  // true when the details panel was opened from the Recent Patients list
  // (patient is already checked in, so the CTA differs from the HIN-lookup flow)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [showPaymentCategoryModal, setShowPaymentCategoryModal] = useState(false);
  // Display casing ("Private" | "HMO" | "Company"); lowercased when sent to the API.
  // Backend default for a patient with nothing saved is "private".
  const [paymentCategory, setPaymentCategory] = useState("Private");
  const [showHmoProviderModal, setShowHmoProviderModal] = useState(false);
  const [hmoProvider, setHmoProvider] = useState(null); // full provider object { sqid, name, ... }
  const [hmoIdNumber, setHmoIdNumber] = useState("");
  const [showCompanyPartnerModal, setShowCompanyPartnerModal] = useState(false);
  const [companyPartner, setCompanyPartner] = useState(null); // full provider object
  const [staffIdNumber, setStaffIdNumber] = useState("");
  const [showPaymentCategorySuccessModal, setShowPaymentCategorySuccessModal] = useState(false);

  const { data: hmoProvidersData, isLoading: isLoadingHmoProviders } = useQuery({
    queryKey: ["payment-providers", "hmo"],
    queryFn: fetchPaymentProviders,
    enabled: showHmoProviderModal,
    staleTime: 5 * 60 * 1000,
  });
  const hmoProviderOptions = (hmoProvidersData || []).map((provider) => ({
    value: provider.sqid,
    label: provider.name,
    provider,
  }));

  const { data: companyPartnersData, isLoading: isLoadingCompanyPartners } = useQuery({
    queryKey: ["payment-providers", "company"],
    queryFn: fetchPaymentProviders,
    enabled: showCompanyPartnerModal,
    staleTime: 5 * 60 * 1000,
  });
  const companyPartnerOptions = (companyPartnersData || []).map((provider) => ({
    value: provider.sqid,
    label: provider.name,
    provider,
  }));

  const savePaymentCategoryMutation = useMutation({
    mutationFn: savePatientPaymentCategory,
    onSuccess: (data) => {
      setPatientDetails((prev) => ({ ...prev, payment_provider: data.payment_provider }));
      setShowPaymentCategoryModal(false);
      setShowHmoProviderModal(false);
      setShowCompanyPartnerModal(false);
      setShowPaymentCategorySuccessModal(true);
    },
    onError: (err) => {
      const data = err.response?.data;
      toast.error(
        data?.type?.[0] || data?.provider?.[0] || data?.message ||
          "Failed to save payment category.",
      );
    },
  });

  const { wards } = useContext(HosWardContext);
  const { hospitalName, backgroundImage } = useContext(ReceptionistAppContext);

  const backgroundImageUrl = backgroundImage || template;

  const totalBeds = wards?.reduce((sum, w) => sum + w.total_beds, 0) || 0;
  const availableBeds =
    wards?.reduce((sum, w) => sum + w.available_beds, 0) || 0;
  const occupiedBeds = totalBeds - availableBeds;

  const totalWards = wards?.length || 0;
  const occupiedWards =
    wards?.filter((w) => w.available_beds < w.total_beds).length || 0;

  const fetchPatientByHIN = async (hin) => {
    const res = await axiosInstanceHos.get(`api/receptionists/patient/${hin}`);
    return res.data;
  };

  const { isFetching, refetch } = useQuery({
    queryKey: ["patient-fetch-details", patientHIN],
    queryFn: () => fetchPatientByHIN(patientHIN),
    enabled: false,
    retry: false,
  });

  const handleHINCheck = async () => {
    if (!patientHIN.trim()) {
      return toast.error("Patient's HIN is not provided!");
    }

    const result = await refetch();

    if (result.isSuccess) {
      toast.success("Patient's Details Retrieved Successfully");
      setPatientDetails(result.data);
      setCheckHIN(true);
      setPatientHIN("");
      queryClient.invalidateQueries(["receptionist-recent-patients"]);
    } else if (result.isError) {
      toast.error(
        result.error?.response?.data?.message ||
          "Patient Details Retrieve Failed!",
      );
      setPatientHIN("");
    }
  };

  const checkInPatientApi = async (payload) => {
    const res = await axiosInstanceHos.post(
      "api/receptionists/check-in",
      payload,
    );
    return res.data;
  };

  const checkInMutation = useMutation({
    mutationFn: checkInPatientApi,
    onSuccess: () => {
      setCheckPatientIn(true);
      queryClient.invalidateQueries(["receptionist-recent-patients"]);
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.patient?.[0] ||
        err.response?.data?.message ||
        "Check-In failed!";
      toast.error(errorMsg);
    },
  });

  const handleCheckIn = () => {
    if (!patientDetails?.hin) return toast.error("Patient details not found.");
    checkInMutation.mutate({ patient: patientDetails.hin });
  };

  const handleViewRecentPatient = async (patient) => {
    const hin = patient.patient_info?.hin || patient.patient?.hin || "";
    if (!hin) {
      toast.error("Patient's HIN not found.");
      return;
    }

    const toastId = toast.loading("Loading patient details...");
    try {
      // Pull the authoritative record from the API rather than trusting
      // whatever partial fields happened to be on the recent-patients row
      const data = await fetchPatientByHIN(hin);
      setPatientDetails({
        ...data,
        assignedDoctor: patient.staff
          ? patient.staff.role === "doctor"
            ? `Dr. ${patient.staff.firstname} ${patient.staff.lastname}`
            : `${patient.staff.firstname} ${patient.staff.lastname}`
          : "NIL",
        lastVisit: patient.created_at
          ? `${formatFullDate(patient.created_at)} / ${formatTime(patient.created_at)}`
          : "NIL",
      });
      setAlreadyCheckedIn(true);
      setCheckHIN(true);
      toast.dismiss(toastId);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(
        err?.response?.data?.message || "Failed to fetch patient details.",
      );
    }
  };

  // Pre-fill from whatever's already saved for this patient (payment_provider
  // comes embedded on the patient-details response) rather than always
  // defaulting the modal to blank/HMO.
  const handleChoosePaymentCategory = () => {
    const existing = patientDetails.payment_provider;
    const type = existing?.type;

    setPaymentCategory(type === "hmo" ? "HMO" : type === "company" ? "Company" : "Private");
    setHmoProvider(type === "hmo" ? existing.provider || null : null);
    setHmoIdNumber(type === "hmo" ? existing.member_id || "" : "");
    setCompanyPartner(type === "company" ? existing.provider || null : null);
    setStaffIdNumber(type === "company" ? existing.member_id || "" : "");

    setShowPaymentCategoryModal(true);
  };

  const handleProceedPaymentCategory = () => {
    if (paymentCategory === "HMO") {
      setShowPaymentCategoryModal(false);
      setShowHmoProviderModal(true);
      return;
    }
    if (paymentCategory === "Company") {
      setShowPaymentCategoryModal(false);
      setShowCompanyPartnerModal(true);
      return;
    }
    savePaymentCategoryMutation.mutate({
      hin: patientDetails.hin,
      payload: { type: "private" },
    });
  };

  const handleProceedHmoProvider = () => {
    if (!hmoProvider || !hmoIdNumber.trim()) return;
    savePaymentCategoryMutation.mutate({
      hin: patientDetails.hin,
      payload: { type: "hmo", provider: hmoProvider.sqid, member_id: hmoIdNumber.trim() },
    });
  };

  const handleProceedCompanyPartner = () => {
    if (!companyPartner || !staffIdNumber.trim()) return;
    savePaymentCategoryMutation.mutate({
      hin: patientDetails.hin,
      payload: { type: "company", provider: companyPartner.sqid, member_id: staffIdNumber.trim() },
    });
  };

  return (
    <>
      {checkHIN ? (
        <>
          <div className="py-2 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full sm:w-auto">
            <DynamicDate />
            <div className="w-full flex flex-col sm:flex-row gap-2 sm:w-auto">
              <button
                className="border border-docuhealth-primary text-docuhealth-primary py-2 px-8 w-full sm:w-auto rounded-full cursor-pointer"
                onClick={() => {
                  setBookAppointment(!bookAppointment);
                }}
              >
                Book an appointment
              </button>
              {alreadyCheckedIn ? (
                <button
                  className="bg-docuhealth-primary py-2.5 px-8 w-full sm:w-auto rounded-full text-white cursor-pointer"
                  onClick={handleChoosePaymentCategory}
                >
                  Choose patient payment category
                </button>
              ) : (
                <button
                  className="bg-docuhealth-primary py-2.5 px-8 w-full sm:w-auto rounded-full text-white cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                >
                  {checkInMutation.isPending && (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {checkInMutation.isPending
                    ? "Checking In..."
                    : "Check Patient In"}
                </button>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
            <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
              <div
                onClick={() => {
                  setCheckHIN(false);
                  setAlreadyCheckedIn(false);
                }}
              >
                <ArrowLeft className="w-4 h-4 text-gray-800" />
              </div>
              <p>Patient details</p>
            </div>
            <div className="py-5 border-b">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold">
                  {`${patientDetails.firstname?.[0] || ""}${patientDetails.lastname?.[0] || ""}`.toUpperCase()}
                </div>

                <div className="flex flex-col items-start">
                  <p className="ml-2 text-sm font-medium">
                    {patientDetails.firstname} {patientDetails.lastname}
                  </p>
                  <p className="ml-2 text-[12px] text-gray-500">patient</p>
                </div>
              </div>
            </div>
            <GeneralPatientInfoForm patient={patientDetails}>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 ">
                  Assigned doctor
                </p>
                <input
                  type="text"
                  readOnly
                  className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                  value={patientDetails.assignedDoctor || "NIL"}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 ">
                  Date of last visit
                </p>
                <input
                  type="text"
                  readOnly
                  className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                  value={patientDetails.lastVisit || "NIL"}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 ">
                  Payment Category
                </p>
                <input
                  type="text"
                  readOnly
                  className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                  value={(() => {
                    const pc = patientDetails.payment_provider;
                    if (!pc) return "N/A";
                    if (pc.type === "private") return "Private";
                    const label = pc.type === "hmo" ? "HMO" : "Company";
                    return pc.provider?.name ? `${label} - ${pc.provider.name}` : label;
                  })()}
                />
              </div>
            </GeneralPatientInfoForm>
          </div>
        </>
      ) : (
        <>
          <div className="py-2">
            <DynamicDate />
            <div
              className="relative mt-4 w-full h-[300px] rounded-xl bg-cover bg-center flex flex-col items-center justify-center border border-gray-300"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImageUrl})`,
              }}
            >
              {/* Watermark / Helper Text */}
              <div className="text-white text-center mb-4">
                <p className="text-xl font-semibold opacity-90 uppercase tracking-widest">
                  {hospitalName
                    ? hospitalName.toUpperCase().endsWith("HOSPITAL")
                      ? hospitalName
                      : `${hospitalName} Hospital`
                    : "NIL Hospital"}
                </p>
              </div>
            </div>

            <div className="text-sm grid grid-cols-1 lg:flex lg:justify-end lg:items-center gap-2 lg:gap-5 mt-5">
              <button
                className=" border border-docuhealth-primary rounded-full py-2.5 px-4 lg:px-8 text-docuhealth-primary cursor-pointer"
                onClick={() => {
                  setNewPatient(!newPatient);
                }}
              >
                Register a new patient to DocuHealth
              </button>
              <div>
                <div className="flex relative items-center">
                  <span className=" absolute left-4">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.33398 12.834C2.33398 10.2566 4.42332 8.16732 7.00065 8.16732C9.57799 8.16732 11.6673 10.2566 11.6673 12.834H10.5007C10.5007 10.901 8.93364 9.33398 7.00065 9.33398C5.06765 9.33398 3.50065 10.901 3.50065 12.834H2.33398ZM7.00065 7.58398C5.0669 7.58398 3.50065 6.01773 3.50065 4.08398C3.50065 2.15023 5.0669 0.583984 7.00065 0.583984C8.9344 0.583984 10.5007 2.15023 10.5007 4.08398C10.5007 6.01773 8.9344 7.58398 7.00065 7.58398ZM7.00065 6.41732C8.28982 6.41732 9.33398 5.37315 9.33398 4.08398C9.33398 2.79482 8.28982 1.75065 7.00065 1.75065C5.71148 1.75065 4.66732 2.79482 4.66732 4.08398C4.66732 5.37315 5.71148 6.41732 7.00065 6.41732Z"
                        fill="var(--color-docuhealth-secondary)"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder=" Enter patient's HIN "
                    value={patientHIN}
                    onChange={(e) => setPatientHIN(e.target.value)}
                    className="outline-none bg-white pl-10 pr-5 rounded-l-full border py-3 flex-1"
                    required
                  />

                  <button
                    onClick={handleHINCheck}
                    disabled={isFetching}
                    className={`w-full flex-1  py-3  ${isFetching ? "cursor-not-allowed bg-gray-300 text-gray-500" : "bg-docuhealth-primary cursor-pointer"}
                        
                 rounded-full rounded-l-none   lg:px-8    text-white sm:col-span-2 `}
                  >
                    {isFetching ? (
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
                        Checking HIN...
                      </span>
                    ) : (
                      "Check HIN"
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border mt-5 p-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className=" flex items-center gap-2 bg-blue-50 p-3 rounded-md">
                  <div className="bg-docuhealth-primary p-2 rounded-full">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 11V20H20V17H4V20H2V4H4V14H12V7H18C20.2091 7 22 8.79086 22 11ZM20 14V11C20 9.89543 19.1046 9 18 9H14V14H20ZM8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11ZM8 13C6.34315 13 5 11.6569 5 10C5 8.34315 6.34315 7 8 7C9.65685 7 11 8.34315 11 10C11 11.6569 9.65685 13 8 13Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs">Bed occupied / Available</p>
                    <p className="text-docuhealth-primary font-semibold text-lg">
                      {" "}
                      {occupiedBeds} / {totalBeds} Beds
                    </p>
                  </div>
                </div>
                <div className=" flex items-center gap-2 bg-purple-100 p-3 rounded-md">
                  <div className="bg-docuhealth-purple p-2 rounded-full">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 11V20H20V17H4V20H2V4H4V14H12V7H18C20.2091 7 22 8.79086 22 11ZM20 14V11C20 9.89543 19.1046 9 18 9H14V14H20ZM8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11ZM8 13C6.34315 13 5 11.6569 5 10C5 8.34315 6.34315 7 8 7C9.65685 7 11 8.34315 11 10C11 11.6569 9.65685 13 8 13Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs">Wards occupied / Available</p>
                    <p className="text-docuhealth-purple font-semibold text-lg">
                      {" "}
                      {occupiedWards} / {totalWards} Wards
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg my-5 ">
              <div className=" border rounded-lg p-4 lg:p-6">
                <h2 className=" mb-4 pb-2 border-b font-medium">
                  Recent Patients attended to
                </h2>
                <div>
                  <RecentPatients onSelectPatient={handleViewRecentPatient} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg my-5 ">
              <div className=" border rounded-lg p-4 lg:p-6">
                <h2 className=" mb-4 pb-2 border-b font-medium">
                  Upcoming Appointments List
                </h2>
                <div>
                  <AppointmentsList />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {newPatient && <OnboardNewPatient setNewPatient={setNewPatient} />}

      {bookAppointment && (
        <BookAppointment
          setBookAppointment={setBookAppointment}
          patientDetails={patientDetails}
        />
      )}

      <Modal
        isOpen={checkPatientIn}
        onClose={() => setCheckPatientIn(false)}
        title=""
        maxWidth="sm"
      >
        <div className="flex flex-col justify-center items-center text-sm pt-4 px-2 text-center pb-2">
          <div className="bg-[#E7F8ED] p-3 rounded-full mb-4 inline-flex items-center justify-center">
            <div className="bg-[#32CC54] rounded-full flex items-center justify-center h-16 w-16 shadow-[0px_0px_0px_8px_rgba(50,204,84,0.15)]">
              <svg
                width="24"
                height="18"
                viewBox="0 0 24 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9L9 16L22 2"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <p className="font-semibold text-gray-800 mb-6 text-base">
            Patient has been successfully checked-in and moved to the nursing
            queue!
          </p>
          <button
            className="w-full bg-[#32CC54] hover:bg-[#28A745] text-white py-3 rounded-full font-medium transition-colors cursor-pointer"
            onClick={() => setCheckPatientIn(false)}
          >
            Done
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showPaymentCategorySuccessModal}
        onClose={() => setShowPaymentCategorySuccessModal(false)}
        title=""
        maxWidth="sm"
      >
        <div className="flex flex-col justify-center items-center text-sm pt-4 px-2 text-center pb-2">
          <div className="bg-[#E7F8ED] p-3 rounded-full mb-4 inline-flex items-center justify-center">
            <div className="bg-[#32CC54] rounded-full flex items-center justify-center h-16 w-16 shadow-[0px_0px_0px_8px_rgba(50,204,84,0.15)]">
              <svg
                width="24"
                height="18"
                viewBox="0 0 24 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9L9 16L22 2"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <p className="font-semibold text-gray-800 mb-6 text-base">
            You have successfully selected the payment category for this
            patient!
          </p>
          <button
            className="w-full bg-[#32CC54] hover:bg-[#28A745] text-white py-3 rounded-full font-medium transition-colors cursor-pointer"
            onClick={() => setShowPaymentCategorySuccessModal(false)}
          >
            Done
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showPaymentCategoryModal}
        onClose={() => setShowPaymentCategoryModal(false)}
        title=""
        maxWidth="sm"
      >
        <div className="flex flex-col text-sm">
          <div className="flex justify-end -mt-2 -mr-2 mb-1">
            <button
              onClick={() => setShowPaymentCategoryModal(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Patient's Payment Category
            </h3>
            <p className="text-gray-500 mt-1">
              Kindly select a category to proceed!
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="relative">
              <select
                value={paymentCategory}
                onChange={(e) => setPaymentCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer text-sm"
              >
                <option value="Private">Private</option>
                <option value="HMO">HMO</option>
                <option value="Company">Company</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleProceedPaymentCategory}
            disabled={savePaymentCategoryMutation.isPending}
            className="w-full bg-docuhealth-primary text-white py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >
            {savePaymentCategoryMutation.isPending && paymentCategory === "Private"
              ? "Saving..."
              : "Proceed"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showHmoProviderModal}
        onClose={() => setShowHmoProviderModal(false)}
        title=""
        maxWidth="sm"
      >
        <div className="flex flex-col text-sm">
          <div className="flex justify-end -mt-2 -mr-2 mb-1">
            <button
              onClick={() => setShowHmoProviderModal(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Fill up HMO information
            </h3>
            <p className="text-gray-500 mt-1">
              Kindly fill in the required information to proceed!
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select HMO provider
            </label>
            <SearchableSelect
              value={hmoProvider?.sqid}
              onChange={(_, option) => setHmoProvider(option.provider)}
              options={hmoProviderOptions}
              placeholder="Select a provider"
              isLoading={isLoadingHmoProviders}
              emptyText="No HMO providers found."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input ID number
            </label>
            <input
              type="text"
              value={hmoIdNumber}
              onChange={(e) => setHmoIdNumber(e.target.value)}
              placeholder="Enter HMO ID number"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-hidden focus:border-docuhealth-primary text-sm"
            />
          </div>

          <button
            onClick={handleProceedHmoProvider}
            disabled={
              !hmoProvider || !hmoIdNumber.trim() || savePaymentCategoryMutation.isPending
            }
            className="w-full bg-docuhealth-primary text-white py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >
            {savePaymentCategoryMutation.isPending ? "Saving..." : "Proceed"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showCompanyPartnerModal}
        onClose={() => setShowCompanyPartnerModal(false)}
        title=""
        maxWidth="sm"
      >
        <div className="flex flex-col text-sm">
          <div className="flex justify-end -mt-2 -mr-2 mb-1">
            <button
              onClick={() => setShowCompanyPartnerModal(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Fill up company partner information
            </h3>
            <p className="text-gray-500 mt-1">
              Kindly fill in the required information to proceed!
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select company partner
            </label>
            <SearchableSelect
              value={companyPartner?.sqid}
              onChange={(_, option) => setCompanyPartner(option.provider)}
              options={companyPartnerOptions}
              placeholder="Select a partner"
              isLoading={isLoadingCompanyPartners}
              emptyText="No company partners found."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input staff ID number
            </label>
            <input
              type="text"
              value={staffIdNumber}
              onChange={(e) => setStaffIdNumber(e.target.value)}
              placeholder="Enter staff ID number"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-hidden focus:border-docuhealth-primary text-sm"
            />
          </div>

          <button
            onClick={handleProceedCompanyPartner}
            disabled={
              !companyPartner || !staffIdNumber.trim() || savePaymentCategoryMutation.isPending
            }
            className="w-full bg-docuhealth-primary text-white py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >
            {savePaymentCategoryMutation.isPending ? "Saving..." : "Proceed"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Hospital_Receptionist_Home_Dashboard;
