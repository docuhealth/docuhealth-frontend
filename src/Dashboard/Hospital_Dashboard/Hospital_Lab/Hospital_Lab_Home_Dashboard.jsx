import { useState, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import { LabAppContext } from "../../../context/HospitalContext/Lab/LabAppContext";
import { FlaskConical, ClipboardList, CheckCircle } from "lucide-react";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import LabStatCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/LabStatCard";

const PAGE_SIZE = 8;

const Hospital_Lab_Home_Dashboard = () => {
  const { backgroundImage, hospitalName, stats, recentPatients, isLoading } = useContext(LabAppContext);
  const [currentPage, setCurrentPage] = useState(1);

  const statCards = [
    {
      title: "Total Lab Tests",
      value: stats?.total_requests ?? 0,
      trend: stats?.total_requests_trend ?? 0,
      trendText: "change from last month",
      icon: <FlaskConical size={20} className="text-blue-500" />,
      bgClass: "bg-blue-100",
    },
    {
      title: "Pending Tests",
      value: stats?.pending_tests ?? 0,
      trend: stats?.pending_tests_trend ?? 0,
      trendText: "change from last month",
      icon: <ClipboardList size={20} className="text-amber-500" />,
      bgClass: "bg-amber-100",
    },
    {
      title: "Completed Tests",
      value: stats?.completed_tests ?? 0,
      trend: stats?.completed_tests_trend ?? 0,
      trendText: "change from last month",
      icon: <CheckCircle size={20} className="text-green-500" />,
      bgClass: "bg-green-100",
    },
  ];

  const totalPages = Math.max(1, Math.ceil(recentPatients.length / PAGE_SIZE));
  const paginated = recentPatients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getPatientName = (p) =>
    p.patient_name ||
    (p.patient ? `${p.patient.firstname || ""} ${p.patient.lastname || ""}`.trim() : "") ||
    p.name ||
    "Unknown";

  const getPatientHIN = (p) => p.patient_hin || p.patient_info?.hin || p.hin || "—";

  const getPatientSex = (p) => p.patient_sex || p.patient?.sex || p.patient?.gender || p.sex || "—";

  const getDate = (p) => {
    if (p.date) return p.date;
    const raw = p.created_at || p.attended_at;
    if (!raw) return "—";
    return new Date(raw).toLocaleDateString("en-GB");
  };

  const getTime = (p) => {
    if (p.time) return p.time;
    const raw = p.created_at || p.attended_at;
    if (!raw) return "";
    return new Date(raw).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getStaffName = (p) => {
    const s = p.staff || p.attended_by || p.doctor;
    if (!s) return "—";
    const name = `${s.firstname || ""} ${s.lastname || ""}`.trim() || "—";
    return s.role === "doctor" ? `Dr. ${name}` : name;
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />

        <div
          className="relative mt-4 w-full h-[180px] sm:h-60 lg:h-[300px] rounded-xl bg-cover bg-center flex flex-col items-center justify-center border border-gray-300"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage || template})`
          }}
        >
          <div className="text-white text-center mb-4">
            <p className="text-xl font-semibold opacity-90 uppercase tracking-widest">
              {hospitalName || "NIL"} Hospital Laboratory
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {statCards.map((stat, index) => (
          <LabStatCard key={index} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-lg my-5">
        <div className="border rounded-lg p-4 lg:p-6">
          <h2 className="mb-4 pb-2 border-b font-medium">Recent Patients attended to</h2>

          {isLoading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
          ) : recentPatients.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No recent patients</div>
          ) : (
            <>
              {/* Desktop grid */}
              <div className="hidden lg:flex lg:flex-col">
                <div className="grid grid-cols-7 text-left text-sm bg-gray-100 py-5 rounded-md">
                  <div className="col-span-2 w-full pl-5 flex items-center gap-2">
                    <p>Patient's Name</p>
                  </div>
                  <p className="col-span-2">Date / Time</p>
                  <p>HIN</p>
                  <p>Staff</p>
                  <p>Sex</p>
                </div>
                {paginated.map((patient, index) => (
                  <div key={index} className="relative">
                    <div className="grid grid-cols-7 items-center text-[12px] text-gray-700 text-left w-full border-b border-b-gray-200">
                      <div className="font-semibold col-span-2 w-full py-6 pl-5 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="var(--color-docuhealth-secondary)" />
                        </svg>
                        <p>{getPatientName(patient)}</p>
                      </div>
                      <p className="col-span-2">{getDate(patient)} / {getTime(patient)}</p>
                      <p>{getPatientHIN(patient)}</p>
                      <div className="font-semibold w-full py-6 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="var(--color-docuhealth-secondary)" />
                        </svg>
                        <p>{getStaffName(patient)}</p>
                      </div>
                      <p>{getPatientSex(patient)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden flex flex-col gap-4">
                {paginated.map((p, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-md p-5 duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 text-docuhealth-primary flex items-center justify-center font-bold text-sm border border-blue-100 uppercase">
                          {getPatientName(p).split(" ")[0]?.[0]}{getPatientName(p).split(" ")[1]?.[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-[14px] leading-tight">{getPatientName(p)}</h3>
                          <p className="text-[11px] text-gray-500 font-medium">{getPatientSex(p)}</p>
                        </div>
                      </div>
                      <span className="bg-gray-50 text-gray-600 text-[10px] px-2 py-1 rounded-md border border-gray-100 font-medium uppercase tracking-wider">
                        {getPatientHIN(p)?.slice(-4) || "N/A"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-0.5">Date</p>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <i className="bx bx-calendar text-docuhealth-primary text-[14px]"></i>
                          <p className="text-[11.5px] font-medium leading-none">{getDate(p)}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 pl-5">at {getTime(p)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-0.5">Assigned Staff</p>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <i className="bx bx-shield-quarter text-docuhealth-primary text-[14px]"></i>
                          <p className="text-[11.5px] font-medium leading-none">{getStaffName(p)}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 pl-5">Healthcare Provider</p>
                      </div>
                    </div>

                    <div className="mt-4 bg-docuhealth-primary-faded rounded-lg p-2.5 flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-docuhealth-primary uppercase">HIN Number</span>
                      <span className="text-[12px] font-mono font-bold text-gray-600 tracking-widest">{getPatientHIN(p)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Pagination2
            count={recentPatients.length}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
};

export default Hospital_Lab_Home_Dashboard;
