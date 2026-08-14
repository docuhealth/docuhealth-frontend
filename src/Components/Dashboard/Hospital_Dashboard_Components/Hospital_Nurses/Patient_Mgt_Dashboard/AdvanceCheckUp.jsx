import React, { useState, useEffect } from "react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

const AdvanceCheckUp = ({ selected, setAdvanceCheckUp }) => {
const hin = selected?.patient?.hin;


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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px] mt-5">
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.1874 2.81468C13.7081 3.33538 13.7081 4.1796 13.1874 4.7003L11.3018 6.58591L9.41615 4.7003L11.3018 2.81468C11.8225 2.29398 12.6667 2.29398 13.1874 2.81468ZM14.1302 1.87187C13.0888 0.83047 11.4004 0.83047 10.359 1.87187L8.47335 3.75748L8.23762 3.52201C7.97728 3.26166 7.55522 3.26166 7.29482 3.52201C7.03448 3.78236 7.03448 4.20446 7.29482 4.46482L7.53055 4.70054L3.38742 8.84364C3.01516 9.21591 2.76141 9.69004 2.65816 10.2063L2.42427 11.3758C2.37265 11.6338 2.24578 11.8709 2.05964 12.057L1.40229 12.7144C1.14194 12.9748 1.14194 13.3969 1.40229 13.6572L2.3451 14.6C2.60545 14.8604 3.02756 14.8604 3.28791 14.6L3.94526 13.9427C4.13139 13.7566 4.36846 13.6297 4.62658 13.578L5.79602 13.3442C6.31226 13.2409 6.78642 12.9872 7.15868 12.6149L11.3018 8.47178L11.5375 8.70744C11.7978 8.96778 12.22 8.96778 12.4803 8.70744C12.7406 8.44711 12.7406 8.02498 12.4803 7.76464L12.2446 7.52898L14.1302 5.6431C15.1716 4.6017 15.1716 2.91326 14.1302 1.87187ZM8.47335 5.64335L10.359 7.52898L6.21585 11.6721C6.02972 11.8582 5.79265 11.9851 5.53453 12.0367L4.36509 12.2706C3.84885 12.3738 3.37472 12.6276 3.00245 12.9999C3.37472 12.6276 3.62846 12.1535 3.73171 11.6372L3.9656 10.4678C4.01722 10.2097 4.1441 9.97264 4.33023 9.78651L8.47335 5.64335Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Blood Pressure
                  </p>
                  <p className="font-medium">
                    {patientFullInfo?.latest_vitals?.blood_pressure} mmHG
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.33203 3.33317C5.33203 1.86041 6.52594 0.666504 7.9987 0.666504C9.47143 0.666504 10.6654 1.86041 10.6654 3.33317V6.8363C11.8744 7.67957 12.6654 9.0807 12.6654 10.6665C12.6654 13.2438 10.576 15.3332 7.9987 15.3332C5.42137 15.3332 3.33203 13.2438 3.33203 10.6665C3.33203 9.0807 4.12304 7.67957 5.33203 6.8363V3.33317ZM6.09483 7.9299C5.20498 8.55057 4.66536 9.56197 4.66536 10.6665C4.66536 12.5074 6.15775 13.9998 7.9987 13.9998C9.83963 13.9998 11.332 12.5074 11.332 10.6665C11.332 9.56197 10.7924 8.55057 9.90256 7.9299L9.33203 7.5319V3.33317C9.33203 2.59679 8.7351 1.99984 7.9987 1.99984C7.2623 1.99984 6.66536 2.59679 6.66536 3.33317V7.5319L6.09483 7.9299ZM5.33203 10.6665H10.6654C10.6654 12.1392 9.47143 13.3332 7.9987 13.3332C6.52594 13.3332 5.33203 12.1392 5.33203 10.6665Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Temperature
                  </p>
                  <p className="font-medium">
                    {patientFullInfo?.latest_vitals?.temp} °C
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.0013 2C13.0264 2 14.668 3.66667 14.668 6C14.668 10.6667 9.66797 13.3333 8.0013 14.3333C6.68304 13.5423 3.2793 11.7087 1.91393 8.66733L0.667969 8.66667V7.33333L1.47494 7.33393C1.38414 6.90887 1.33464 6.46434 1.33464 6C1.33464 3.66667 3.0013 2 5.0013 2C6.24128 2 7.33464 2.66667 8.0013 3.33333C8.66797 2.66667 9.7613 2 11.0013 2ZM11.0013 3.33333C10.284 3.33333 9.5075 3.71274 8.9441 4.27614L8.0013 5.21895L7.0585 4.27614C6.49509 3.71274 5.71857 3.33333 5.0013 3.33333C3.70734 3.33333 2.66797 4.43767 2.66797 6C2.66797 6.45695 2.7282 6.90107 2.84569 7.3336L4.29051 7.33333L5.66797 5.03757L7.66797 8.37087L8.2905 7.33333H11.3346V8.66667H9.04544L7.66797 10.9625L5.66797 7.62913L5.04543 8.66667L3.40656 8.66707C3.93282 9.58247 4.73 10.4454 5.76473 11.2686C6.26131 11.6637 6.79097 12.0323 7.3787 12.4025C7.5777 12.5279 7.77537 12.6486 8.0013 12.7835C8.22724 12.6486 8.4249 12.5279 8.6239 12.4025C9.21164 12.0323 9.7413 11.6637 10.2379 11.2686C12.2238 9.68867 13.3346 7.96233 13.3346 6C13.3346 4.42717 12.31 3.33333 11.0013 3.33333Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Weight
                  </p>
                  <p className="font-medium">
                    {patientFullInfo?.latest_vitals?.weight} Kg
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.4938 3.17157C15.0022 4.68315 15.054 7.09133 13.6511 8.662L7.99863 14.3233L2.34628 8.662C0.943397 7.09133 0.995837 4.67934 2.5036 3.17157C4.01308 1.6621 6.42882 1.61125 7.99936 3.01902C9.56536 1.61333 11.9854 1.66 13.4938 3.17157ZM3.44641 4.11438C2.45325 5.10754 2.40339 6.6982 3.31865 7.7488L7.99863 12.4362L12.6788 7.7488C13.5944 6.6978 13.5447 5.11017 12.55 4.1134C11.5585 3.11986 9.96256 3.07204 8.9149 3.98917L6.11308 6.79127L5.17027 5.84843L7.05336 3.964L6.99883 3.91801C5.949 3.07465 4.41418 3.14662 3.44641 4.11438Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Respiratory rate
                  </p>
                  <p className="font-medium">
                    {patientFullInfo?.latest_vitals?.resp_rate} / min
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.0013 2C13.0264 2 14.668 3.66667 14.668 6C14.668 10.6667 9.66797 13.3333 8.0013 14.3333C6.68304 13.5423 3.2793 11.7087 1.91393 8.66733L0.667969 8.66667V7.33333L1.47494 7.33393C1.38414 6.90887 1.33464 6.46434 1.33464 6C1.33464 3.66667 3.0013 2 5.0013 2C6.24128 2 7.33464 2.66667 8.0013 3.33333C8.66797 2.66667 9.7613 2 11.0013 2ZM11.0013 3.33333C10.284 3.33333 9.5075 3.71274 8.9441 4.27614L8.0013 5.21895L7.0585 4.27614C6.49509 3.71274 5.71857 3.33333 5.0013 3.33333C3.70734 3.33333 2.66797 4.43767 2.66797 6C2.66797 6.45695 2.7282 6.90107 2.84569 7.3336L4.29051 7.33333L5.66797 5.03757L7.66797 8.37087L8.2905 7.33333H11.3346V8.66667H9.04544L7.66797 10.9625L5.66797 7.62913L5.04543 8.66667L3.40656 8.66707C3.93282 9.58247 4.73 10.4454 5.76473 11.2686C6.26131 11.6637 6.79097 12.0323 7.3787 12.4025C7.5777 12.5279 7.77537 12.6486 8.0013 12.7835C8.22724 12.6486 8.4249 12.5279 8.6239 12.4025C9.21164 12.0323 9.7413 11.6637 10.2379 11.2686C12.2238 9.68867 13.3346 7.96233 13.3346 6C13.3346 4.42717 12.31 3.33333 11.0013 3.33333Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Heart rate
                  </p>
                  <p className="font-medium">
                    {patientFullInfo?.latest_vitals?.heart_rate} bpm
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.3333 12.6667H12.6667V9.33333H6.66667V3.33333H3.33333V4.66667H4.66667V6H3.33333V7.33333H5.33333V8.66667H3.33333V10H4.66667V11.3333H3.33333V12.6667H4.66667V11.3333H6V12.6667H7.33333V10.6667H8.66667V12.6667H10V11.3333H11.3333V12.6667ZM8 8H13.3333C13.7015 8 14 8.29847 14 8.66667V13.3333C14 13.7015 13.7015 14 13.3333 14H2.66667C2.29848 14 2 13.7015 2 13.3333V2.66667C2 2.29848 2.29848 2 2.66667 2H7.33333C7.70153 2 8 2.29848 8 2.66667V8Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Height
                  </p>
                  <p className="font-medium">
                    {patientFullInfo?.latest_vitals?.height} m
                  </p>
                </div>
              </div>
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
