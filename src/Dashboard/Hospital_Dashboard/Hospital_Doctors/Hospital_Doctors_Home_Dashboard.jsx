import { useState, useContext, useMemo } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import { Stethoscope, CalendarCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DoctorAppContext } from "../../../context/HospitalContext/Doctors/DoctorAppContext";
import AdmittedPatientsChart from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home_Dashboard/AdmittedPatientsChart";
import DischargedPatientsChart from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home_Dashboard/DischargedPatientsChart";
import AttendanceOverviewChart from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home_Dashboard/AttendanceOverviewChart";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchHospitalDoctorDashboardMetrics } from "../../../queries/Hospital/doctor/dashboard_metrics";
import { getDatesForFilter } from "../../../utils/dateFilterHelper";

const ChartLoadingPlaceholder = ({ title }) => (
  <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
        {title}
      </h3>
      <div className="h-8 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="flex-1 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E4095]"></div>
    </div>
  </div>
);

const Hospital_Doctors_Home_Dashboard = () => {
  const { hospitalName, backgroundImage, dashboardMetrics, dashboardMetricsLoading } =
    useContext(DoctorAppContext);

  const backgroundImageUrl = backgroundImage || template;

  const isUserLoggedIn = !!getHospitalToken();

  const [admittedFilter, setAdmittedFilter] = useState("Monthly");
  const [dischargedFilter, setDischargedFilter] = useState("Monthly");
  const [attendanceFilter, setAttendanceFilter] = useState("Monthly");

  const admittedRange = useMemo(() => getDatesForFilter(admittedFilter), [admittedFilter]);
  const dischargedRange = useMemo(() => getDatesForFilter(dischargedFilter), [dischargedFilter]);
  const attendanceRange = useMemo(() => getDatesForFilter(attendanceFilter), [attendanceFilter]);

  const { data: admittedMetrics, isPending: admittedLoading } = useQuery({
    queryKey: ["doctors-dashboard-metrics", admittedRange],
    queryFn: fetchHospitalDoctorDashboardMetrics,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const { data: dischargedMetrics, isPending: dischargedLoading } = useQuery({
    queryKey: ["doctors-dashboard-metrics", dischargedRange],
    queryFn: fetchHospitalDoctorDashboardMetrics,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const { data: attendanceMetrics, isPending: attendanceLoading } = useQuery({
    queryKey: ["doctors-dashboard-metrics", attendanceRange],
    queryFn: fetchHospitalDoctorDashboardMetrics,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const summary = dashboardMetrics?.summary || {};

  const statCards = [
    {
      title: "Total appointments",
      value: summary.total_appointments?.value ?? 0,
      trend: summary.total_appointments?.increase ?? 0,
      trendText: "increase from last month",
      icon: <CalendarCheck size={20} className="text-blue-500" />,
      bgClass: "bg-blue-100",
    },
    {
      title: "Avg. daily attendance",
      value: summary.avg_daily_attendance?.value ?? 0,
      trend: summary.avg_daily_attendance?.increase ?? 0,
      trendText: "increase from last month",
      icon: <Stethoscope size={20} className="text-amber-500" />,
      bgClass: "bg-amber-100",
    },
    {
      title: "Total referrals",
      value: summary.total_referrals?.value ?? 0,
      trend: summary.total_referrals?.increase ?? 0,
      trendText: "increase from last month",
      icon: <TrendingUp size={20} className="text-rose-400" />,
      bgClass: "bg-rose-100",
    },
  ];

  return (
    <>
      <div className="py-2">
        <DynamicDate />

        {/* Cover Image */}
        <div
          className="relative mt-4 w-full h-[300px] rounded-xl bg-cover bg-center flex flex-col items-center justify-center border border-gray-300"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImageUrl})`
          }}
        >
          <div className="text-white text-center mb-4">
            <p className="text-xl font-semibold opacity-90 uppercase tracking-widest">
              {hospitalName || "NIL"} Hospital
            </p>
          </div>
        </div>
      </div>

      {dashboardMetricsLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E4095]"></div>
        </div>
      )}

      {/* Stat Cards */}
      {!dashboardMetricsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-md p-5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${stat.bgClass}`}>
                  {stat.icon}
                </div>
                <p className="text-sm font-semibold text-[#1B2B40]">{stat.title}</p>
              </div>

              <p className="text-3xl font-semibold text-[#647284] mb-3">{stat.value}</p>

              <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <span className={`flex items-center gap-0.5 ${stat.trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {stat.trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(stat.trend)}%
                </span>{" "}
                {stat.trendText}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      {!dashboardMetricsLoading && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {admittedLoading ? (
            <ChartLoadingPlaceholder title="Admitted patients" />
          ) : (
            <AdmittedPatientsChart
              data={admittedMetrics?.charts?.admissions_overview || []}
              filter={admittedFilter}
              onFilterChange={setAdmittedFilter}
            />
          )}
          {dischargedLoading ? (
            <ChartLoadingPlaceholder title="Discharged patients" />
          ) : (
            <DischargedPatientsChart
              data={dischargedMetrics?.charts?.discharged_patients || []}
              filter={dischargedFilter}
              onFilterChange={setDischargedFilter}
            />
          )}
        </div>
      )}

      {!dashboardMetricsLoading && (
        <div className="mt-6 w-full">
          {attendanceLoading ? (
            <ChartLoadingPlaceholder title="Patient's Attendance overview" />
          ) : (
            <AttendanceOverviewChart
              data={attendanceMetrics?.charts?.attendance_overview || []}
              filter={attendanceFilter}
              onFilterChange={setAttendanceFilter}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Hospital_Doctors_Home_Dashboard;