import { useState, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import { Stethoscope, CalendarCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DoctorAppContext } from "../../../context/HospitalContext/Doctors/DoctorAppContext";
import AdmittedPatientsChart from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home_Dashboard/AdmittedPatientsChart";
import DischargedPatientsChart from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home_Dashboard/DischargedPatientsChart";
import AttendanceOverviewChart from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home_Dashboard/AttendanceOverviewChart";

const Hospital_Doctors_Home_Dashboard = () => {
  const { hospitalName, backgroundImage, dashboardMetrics, dashboardMetricsLoading, updateDateRange } =
    useContext(DoctorAppContext);

  const [globalFilter, setGlobalFilter] = useState("Monthly");

  const backgroundImageUrl = backgroundImage || template;

  const handleFilterChange = (selected) => {
    setGlobalFilter(selected);
    const today = new Date();
    let startDate = "";
    let endDate = today.toISOString().split("T")[0];

    if (selected === "Daily") {
      startDate = today.toISOString().split("T")[0];
    } else if (selected === "Last 24hrs") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = yesterday.toISOString().split("T")[0];
    } else if (selected === "Weekly") {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      startDate = lastWeek.toISOString().split("T")[0];
    } else if (selected === "Monthly") {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      startDate = lastMonth.toISOString().split("T")[0];
    } else if (selected === "Yearly") {
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      startDate = lastYear.toISOString().split("T")[0];
    }

    updateDateRange({ start_date: startDate, end_date: endDate });
  };

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
          <AdmittedPatientsChart
            data={dashboardMetrics?.charts?.admissions_overview || []}
            filter={globalFilter}
            onFilterChange={handleFilterChange}
          />
          <DischargedPatientsChart
            data={dashboardMetrics?.charts?.discharged_patients || []}
            filter={globalFilter}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {!dashboardMetricsLoading && (
        <div className="mt-6 w-full">
          <AttendanceOverviewChart
            data={dashboardMetrics?.charts?.attendance_overview || []}
            filter={globalFilter}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}
    </>
  );
};

export default Hospital_Doctors_Home_Dashboard;