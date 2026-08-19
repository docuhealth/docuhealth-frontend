import React, { useState, useEffect } from "react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import VitalSignsCard from "../../../../ui/VitalSignsCard";

const AdvanceCheckUp = ({ selected, setAdvanceCheckUp }) => {
const hin = (selected?.patient_info?.hin || selected?.patient?.hin);


  const { data: patientFullInfo, isLoading, isError } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`);
      return res.data;
    },
    enabled: !!hin, 
    staleTime: 5 * 60 * 1000, 
  });

  if (isError) {
    toast.error("Failed to load patient information");
  }



  return (
    <>
      <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
        <div
          onClick={() => {
            setAdvanceCheckUp(false);
          }}
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
        </div>

        <p>Advance CheckUp</p>
      </div>
      {isLoading ? (
        /* Basic Loading State */
        <div className="flex justify-center items-center gap-3 px-2 py-3">
          <p className="text-sm text-gray-500 pt-2">Loading patient data...</p>
        </div>
      ) : (
        <>
          <div className="py-5 border-b">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold">
                {`${patientFullInfo?.patient_info?.firstname?.[0] ?? ""}${patientFullInfo?.patient_info?.lastname?.[0] ?? ""}`.toUpperCase()}
              </div>

              <div className="flex flex-col items-start">
                <p className="ml-2 text-sm font-medium">
                  {patientFullInfo?.patient_info?.firstname}{" "}
                  {patientFullInfo?.patient_info?.lastname}
                </p>
                <p className="ml-2 text-[12px] text-gray-500">patient</p>
              </div>
            </div>
            <div className="my-5 bg-docuhealth-light-gray rounded-xl border p-4">
              <h2 className="font-medium">Latest vital signs</h2>
              <VitalSignsCard
                vitalSigns={patientFullInfo?.latest_vitals}
                className="mt-5"
              />
            </div>
            <div className="my-5 bg-docuhealth-light-gray rounded-lg border p-4">
                <h2 className="font-medium">Ongoing Medication ({patientFullInfo?.ongoing_drugs?.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px] mt-5">
                    {patientFullInfo?.ongoing_drugs?.map((drug, index) => (
                        <div key={index} className="border p-4 rounded-md bg-white">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.1861 2.81611C14.7481 4.3782 14.7481 6.91088 13.1861 8.47295L11.7713 9.88668L8.47199 13.187C6.90986 14.7491 4.37722 14.7491 2.81512 13.187C1.25303 11.6249 1.25303 9.09228 2.81512 7.53015L7.52919 2.81611C9.09126 1.25401 11.6239 1.25401 13.1861 2.81611ZM9.88619 9.88715L6.11496 6.11593L3.75794 8.47295C2.71654 9.51435 2.71654 11.2028 3.75794 12.2442C4.79933 13.2856 6.48777 13.2856 7.52919 12.2442L9.88619 9.88715Z" fill="#EE1414" />
                                    </svg>
                                    <p className="font-medium">{drug.name}</p>
                                </div>


                                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[12px]">
                                    Ongoing
                                </span>
                            </div>

                            <div className="flex justify-between mt-2">
                                <p>Dosage:</p>
                                <p className="text-right font-medium">
                                    {drug.quantity ? `${drug.quantity} mg` : "NIL"}
                                </p>
                            </div>

                            <div className="flex justify-between mt-2">
                                <p>Frequency:</p>
                                <p className="text-right font-medium">
                                    {drug.frequency
                                        ? `${drug.frequency.value}× ${drug.frequency.rate}`
                                        : "NIL"}
                                </p>
                            </div>

                            <div className="flex justify-between mt-2">
                                <p>Duration:</p>
                                <p className="text-right font-medium">
                                    {drug.duration
                                        ? `${drug.duration.value} ${drug.duration.rate}`
                                        : "NIL"}
                                </p>
                            </div>

                            <div className="flex justify-between mt-2">
                                <p>Prescribed by:</p>
                                <p className="text-right font-medium">
                                    {patientFullInfo?.latest_vitals?.staff_info
                                        ? `Dr. ${patientFullInfo.latest_vitals.staff_info.firstname} ${patientFullInfo.latest_vitals.staff_info.lastname}`
                                        : "NIL"}
                                </p>
                            </div>
                        </div>

                    ))
                    }
                </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AdvanceCheckUp;
