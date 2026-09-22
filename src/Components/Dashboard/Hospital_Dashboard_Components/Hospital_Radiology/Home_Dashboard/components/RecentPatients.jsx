import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Pagination2 from "../../../../Patient_Dashboard_Components/Pagination/Pagination2";

import { fetchRadiologyRecentPatients } from "../../../../../../queries/Hospital/radiology/recent_patients";
import { getHospitalToken } from "../../../../../../services/authService";

// Backend shape for this endpoint isn't confirmed yet (see
// BACKEND_RADIOLOGY_ISSUES.md), so these getters fall back across a few
// likely field names instead of assuming one exact contract.
const getPatientName = (p) =>
  p.patient_name ||
  (p.patient ? `${p.patient.firstname || ""} ${p.patient.lastname || ""}`.trim() : "") ||
  `${p.firstname || ""} ${p.lastname || ""}`.trim() ||
  "Unknown";

const getPatientHIN = (p) => p.patient_hin || p.patient?.hin || p.hin || "";

const getPatientSex = (p) => p.patient_sex || p.patient?.sex || p.patient?.gender || p.gender || p.sex || "—";

const getTimestamp = (p) => p.scanned_at || p.last_scanned_at || p.attended_at || p.created_at || p.date;

const getDate = (p) => {
  if (p.date && !p.time) return p.date;
  const raw = getTimestamp(p);
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-GB");
};

const getTime = (p) => {
  if (p.time) return p.time;
  const raw = getTimestamp(p);
  if (!raw) return "—";
  return new Date(raw).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

// Mirrors the "12*********85" look from the design: first 2 and last 2
// digits visible, everything in between masked.
const maskHIN = (hin) => {
  if (!hin) return "—";
  if (hin.length <= 4) return hin;
  return hin.slice(0, 2) + "*".repeat(hin.length - 4) + hin.slice(-2);
};

const RecentPatients = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const isUserLoggedIn = !!getHospitalToken();

  const { data, isLoading: loading, isFetching: isRefreshing } = useQuery({
    queryKey: ["radiology-recent-patients", currentPage],
    queryFn: fetchRadiologyRecentPatients,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5,
    retry: false,
  });

  const recentPatients = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(count / 10));

  const sortedPatients = useMemo(() => {
    const now = new Date().getTime();
    return [...recentPatients].sort((a, b) => {
      const timeA = new Date(getTimestamp(a)).getTime() || 0;
      const timeB = new Date(getTimestamp(b)).getTime() || 0;
      return Math.abs(timeA - now) - Math.abs(timeB - now);
    });
  }, [recentPatients]);

  if (loading) {
    return <div className="flex justify-center items-center h-40 text-sm text-gray-500">Loading...</div>;
  }

  return (
    <>
      {isRefreshing && (
        <div className="mb-4 w-full flex justify-end">
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-docuhealth-primary rounded-full animate-spin"></span>
            Loading...
          </p>
        </div>
      )}

      {recentPatients.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No recent patients.</p>
          <p className="text-xs text-gray-400 mt-1">Patients you attend to will show up here.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="flex flex-col min-w-[720px]">
              <div className="grid grid-cols-6 text-left text-sm bg-gray-100 py-5 rounded-md">
                <div className="col-span-2 w-full pl-5 flex items-center gap-2">
                  <p>Patient's Name</p>
                </div>
                <p>Date</p>
                <p>Time</p>
                <p>HIN</p>
                <p>Sex</p>
              </div>
              {sortedPatients.map((patient, index) => (
                <div key={index} className="relative">
                  <div className="grid grid-cols-6 items-center text-[12px] text-gray-700 text-left w-full border-b border-b-gray-200">
                    <div className="font-semibold col-span-2 w-full py-6 pl-5 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z"
                          fill="var(--color-docuhealth-secondary)"
                        />
                      </svg>
                      <p>{getPatientName(patient)}</p>
                    </div>
                    <p>{getDate(patient)}</p>
                    <p>{getTime(patient)}</p>
                    <p>{maskHIN(getPatientHIN(patient))}</p>
                    <p className="capitalize">{getPatientSex(patient)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden flex flex-col gap-4">
            {sortedPatients.map((patient, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-md p-5 duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-docuhealth-primary flex items-center justify-center font-bold text-sm border border-blue-100 uppercase">
                      {getPatientName(patient).split(" ")[0]?.[0]}
                      {getPatientName(patient).split(" ")[1]?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-[14px] leading-tight">{getPatientName(patient)}</h3>
                      <p className="text-[11px] text-gray-500 font-medium capitalize">{getPatientSex(patient)}</p>
                    </div>
                  </div>
                  <span className="bg-gray-50 text-gray-600 text-[10px] px-2 py-1 rounded-md border border-gray-100 font-medium uppercase tracking-wider">
                    {getPatientHIN(patient)?.slice(-4) || "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-0.5">Date</p>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <i className="bx bx-calendar text-docuhealth-primary text-[14px]"></i>
                      <p className="text-[11.5px] font-medium leading-none">{getDate(patient)}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 pl-5">at {getTime(patient)}</p>
                  </div>
                </div>

                <div className="mt-4 bg-docuhealth-primary-faded rounded-lg p-2.5 flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-docuhealth-primary uppercase">HIN Number</span>
                  <span className="text-[12px] font-mono font-bold text-gray-600 tracking-widest">
                    {maskHIN(getPatientHIN(patient))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination2
            count={count}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
    </>
  );
};

export default RecentPatients;
