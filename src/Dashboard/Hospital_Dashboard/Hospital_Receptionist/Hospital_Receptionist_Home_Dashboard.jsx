import React, { useState, useContext } from "react";
import { ArrowLeft } from "lucide-react";
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

const Hospital_Receptionist_Home_Dashboard = () => {
  const queryClient = useQueryClient();
  const [newPatient, setNewPatient] = useState(false);
  const [checkHIN, setCheckHIN] = useState(false);
  const [patientHIN, setPatientHIN] = useState("");
  const [patientDetails, setPatientDetails] = useState([]);
  // const [patientEmail, setPatientEmail] = useState('')
  const [bookAppointment, setBookAppointment] = useState(false);

  const [checkPatientIn, setCheckPatientIn] = useState(false);

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
            </div>
          </div>
          <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
            <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
              <div
                onClick={() => {
                  setCheckHIN(false);
                }}
              >
                <ArrowLeft className="w-4 h-4 text-gray-800" />
              </div>
              <p>Patient details</p>
            </div>
            <div className="py-5 border-b">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold">
                  {`${patientDetails.firstname[0]}${patientDetails.lastname[0]}`.toUpperCase()}
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
                  value="NIL"
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
                  value="NIL"
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
                  <RecentPatients />
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
    </>
  );
};

export default Hospital_Receptionist_Home_Dashboard;
