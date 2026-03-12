import React, { useContext, useState } from "react";
import DynamicDate from "../../Components/DynamicDate/DynamicDate";
import { AdminDashboardContext } from "../../context/AdminContext/AdminDashboardContext";
import { FileText, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import RevenueChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/RevenueChart";
import RegisteredUsersChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/RegisteredUsersChart";
import SubscribedUsersChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/SubscribedUsersChart";
import SubAccountChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/SubAccountChart";
import TopSellingStatesChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/TopSellingStatesChart";


const Admin_Home_Dashboard = () => {
  const { dashboardData, loading, updateDateRange } = useContext(AdminDashboardContext);
  const [globalFilter, setGlobalFilter] = useState("Monthly");

  const handleFilterChange = (selected) => {
    setGlobalFilter(selected);
    const today = new Date();
    let startDate = "";
    let endDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

    if (selected === "Weekly") {
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E4095]"></div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};

  const statCards = [
    {
      title: "Total Users",
      value: summary.total_users || 0,
      trend: "19%",
      trendUp: true,
      trendText: "increase from last month",
      icon: <FileText size={20} className="text-blue-500" />,
      bgClass: "bg-blue-100",
    },
    {
      title: "Total revenue generated",
      value: summary.total_revenue?.toLocaleString() || "0",
      trend: "19%",
      trendUp: true,
      trendText: "increase from last month",
      icon: <FileText size={20} className="text-amber-500" />,
      bgClass: "bg-amber-100",
    },
    {
      title: "Total Registered Hospital",
      value: summary.total_hospitals || 0,
      trend: "2%",
      trendUp: false,
      trendText: "Decrease from last month",
      icon: <FileText size={20} className="text-indigo-500" />,
      bgClass: "bg-indigo-100",
    },
    {
      title: "Total registered individual",
      value: summary.total_individuals || 0,
      trend: "5%",
      trendUp: true,
      trendText: "increase from last month",
      icon: <FileText size={20} className="text-rose-400" />,
      bgClass: "bg-rose-100",
    },
  ];

  return (
    <div className="py-2">
      <DynamicDate />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4  mt-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-md p-5  flex flex-col justify-between "
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-sm flex items-center justify-center border ${stat.bgClass}`}
              >
                {stat.icon}
              </div>
              <p className="text-sm font-semibold text-[#1B2B40]">
                {stat.title}
              </p>
            </div>

            <p className="text-3xl font-semibold text-[#647284] mb-3">
              {stat.value}
            </p>

            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <span
                className={`flex items-center gap-0.5 ${stat.trendUp ? "text-green-500" : "text-red-500"
                  }`}
              >
                {stat.trendUp ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {stat.trend}
              </span>{" "}
              {stat.trendText}
            </p>
          </div>
        ))}
      </div>
      
      {/* Charts Section Placeholder */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <RevenueChart data={dashboardData?.charts?.revenue_overview || undefined} filter={globalFilter} onFilterChange={handleFilterChange} />
        <RegisteredUsersChart data={dashboardData?.charts?.registered_users || undefined} filter={globalFilter} onFilterChange={handleFilterChange} />
        <SubscribedUsersChart data={dashboardData?.charts?.subscribed_users || undefined} filter={globalFilter} onFilterChange={handleFilterChange} />
        <SubAccountChart data={dashboardData?.charts?.sub_account_stats || undefined} />
      </div>

      <div className="w-full">
        <TopSellingStatesChart 
          data={dashboardData?.charts?.states || undefined} 
          filter={globalFilter} 
          onFilterChange={handleFilterChange} 
        />
      </div>

    </div>
  );
};

export default Admin_Home_Dashboard;
