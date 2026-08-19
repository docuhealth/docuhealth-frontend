import React from "react";
import { ArrowLeft } from "lucide-react";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import GeneralPatientInfoForm from "../../../../../ui/GeneralPatientInfoForm";

const NursePatientInfo = ({ selectedPatientDetails, setSeePatientDetails }) => {
  const hin = selectedPatientDetails?.patient_info?.hin || selectedPatientDetails?.patient?.hin || selectedPatientDetails?.patient_hin;

  const { data: patientFullInfo, isLoading, isError } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`);
      return res.data;
    },
    enabled: !!hin,
    staleTime: 5 * 60 * 1000,
    onError: () => toast.error("Failed to load patient information"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-sm text-gray-500">Loading patient data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-sm text-red-500">Failed to load patient information.</p>
      </div>
    );
  }

  return (
    <div className="bg-white my-5 rounded-lg border p-4 lg:p-6 text-sm">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div 
          className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-black font-medium"
          onClick={() => setSeePatientDetails(false)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Patient's details</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold text-gray-600">
          {`${patientFullInfo?.patient_info?.firstname?.[0] ?? ""}${patientFullInfo?.patient_info?.lastname?.[0] ?? ""}`.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">
            {patientFullInfo?.patient_info?.firstname}{" "}
            {patientFullInfo?.patient_info?.lastname}
          </p>
          <p className="text-xs text-green-600 font-medium bg-green-50 inline-block px-2 py-0.5 rounded-full mt-1">
            {patientFullInfo?.patient_info?.plan_type || "HMO"} patient
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <span className="inline-block p-4 text-docuhealth-primary border-b-2 border-docuhealth-primary rounded-t-lg active">
              Patient's information
            </span>
          </li>
        </ul>
      </div>

      <GeneralPatientInfoForm patient={patientFullInfo?.patient_info}>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Date/time of admission</p>
          <input
            type="text"
            readOnly
            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
            value={patientFullInfo?.latest_vitals?.created_at ? new Date(patientFullInfo.latest_vitals.created_at).toLocaleString() : "NIL"}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Discharge date/time</p>
          <input
            type="text"
            readOnly
            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
            value="NIL"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Ward placed</p>
          <input
            type="text"
            readOnly
            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
            value={patientFullInfo?.ward?.name || "NIL"}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Assigned bed</p>
          <input
            type="text"
            readOnly
            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
            value={patientFullInfo?.bed?.name || "NIL"}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Doctor in charge</p>
          <input
            type="text"
            readOnly
            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
            value={patientFullInfo?.latest_vitals?.staff_info ? `Dr. ${patientFullInfo.latest_vitals.staff_info.firstname} ${patientFullInfo.latest_vitals.staff_info.lastname}` : "NIL"}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
          <input
            type="text"
            readOnly
            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3 capitalize"
            value={patientFullInfo?.patient_info?.gender || "NIL"}
          />
        </div>
      </GeneralPatientInfoForm>

      <div className="my-5 bg-docuhealth-light-gray rounded-xl border p-4">
        <h2 className="font-medium text-gray-800">
          Ongoing Medication ({patientFullInfo?.ongoing_drugs?.length || 0})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[12px] mt-5">
          {patientFullInfo?.ongoing_drugs?.map((drug, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.1861 2.81611C14.7481 4.3782 14.7481 6.91088 13.1861 8.47295L11.7713 9.88668L8.47199 13.187C6.90986 14.7491 4.37722 14.7491 2.81512 13.187C1.25303 11.6249 1.25303 9.09228 2.81512 7.53015L7.52919 2.81611C9.09126 1.25401 11.6239 1.25401 13.1861 2.81611ZM9.88619 9.88715L6.11496 6.11593L3.75794 8.47295C2.71654 9.51435 2.71654 11.2028 3.75794 12.2442C4.79933 13.2856 6.48777 13.2856 7.52919 12.2442L9.88619 9.88715Z" fill="#EE1414" />
                  </svg>
                  <p className="font-medium text-sm text-gray-800">{drug.name}</p>
                </div>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide">
                  Ongoing
                </span>
              </div>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <p>Dosage:</p>
                  <p className="font-medium text-gray-800">{drug.quantity ? `${drug.quantity} mg` : "NIL"}</p>
                </div>
                <div className="flex justify-between">
                  <p>Frequency:</p>
                  <p className="font-medium text-gray-800">
                    {drug.frequency ? `${drug.frequency.value}× ${drug.frequency.rate}` : "NIL"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p>Duration:</p>
                  <p className="font-medium text-gray-800">
                    {drug.duration ? `${drug.duration.value} ${drug.duration.rate}` : "NIL"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p>Prescribed by:</p>
                  <p className="font-medium text-gray-800">
                    {patientFullInfo?.latest_vitals?.staff_info
                      ? `Dr. ${patientFullInfo.latest_vitals.staff_info.firstname} ${patientFullInfo.latest_vitals.staff_info.lastname}`
                      : "NIL"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NursePatientInfo;
