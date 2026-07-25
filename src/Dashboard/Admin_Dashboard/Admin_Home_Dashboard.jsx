import React, { useContext, useState, useMemo } from "react";
import DynamicDate from "../../Components/DynamicDate/DynamicDate";
import { AdminDashboardContext } from "../../context/AdminContext/AdminDashboardContext";
import { FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import RevenueChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/RevenueChart";
import RegisteredUsersChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/RegisteredUsersChart";
import SubscribedUsersChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/SubscribedUsersChart";
import SubAccountChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/SubAccountChart";
import TopSellingStatesChart from "../../Components/Dashboard/Admin_Dashboard_Components/Home_Dashboard/TopSellingStatesChart";
import { useQuery } from "@tanstack/react-query";
import { getToken, getRole } from "../../services/authService";
import { fetchAdminDashboardData } from "../../queries/admin/dashboard";
import { getDatesForFilter } from "../../utils/dateFilterHelper";

const ChartLoadingPlaceholder = ({ title }) => (
  <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-95 flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
        {title}
      </h3>
      <div className="h-8 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="flex-1 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-docuhealth-primary"></div>
    </div>
  </div>
);

const Admin_Home_Dashboard = () => {
  const { dashboardData, loading } = useContext(AdminDashboardContext);

  const token = getToken();
  const role = getRole();
  const isEnabled = !!token && role === "dhadmin";

  const [revenueFilter, setRevenueFilter] = useState("Monthly");
  const [registeredFilter, setRegisteredFilter] = useState("Monthly");
  const [subscribedFilter, setSubscribedFilter] = useState("Monthly");
  const [statesFilter, setStatesFilter] = useState("Monthly");

  const revenueRange = useMemo(() => getDatesForFilter(revenueFilter), [revenueFilter]);
  const registeredRange = useMemo(() => getDatesForFilter(registeredFilter), [registeredFilter]);
  const subscribedRange = useMemo(() => getDatesForFilter(subscribedFilter), [subscribedFilter]);
  const statesRange = useMemo(() => getDatesForFilter(statesFilter), [statesFilter]);

  const { data: revenueData, isPending: revenueLoading } = useQuery({
    queryKey: ["admin-dashboard", revenueRange],
    queryFn: fetchAdminDashboardData,
    enabled: isEnabled,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const { data: registeredData, isPending: registeredLoading } = useQuery({
    queryKey: ["admin-dashboard", registeredRange],
    queryFn: fetchAdminDashboardData,
    enabled: isEnabled,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const { data: subscribedData, isPending: subscribedLoading } = useQuery({
    queryKey: ["admin-dashboard", subscribedRange],
    queryFn: fetchAdminDashboardData,
    enabled: isEnabled,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const { data: statesData, isPending: statesLoading } = useQuery({
    queryKey: ["admin-dashboard", statesRange],
    queryFn: fetchAdminDashboardData,
    enabled: isEnabled,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-docuhealth-primary"></div>
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
              <p className="text-sm font-semibold text-docuhealth-dark">
                {stat.title}
              </p>
            </div>

            <p className="text-3xl font-semibold text-docuhealth-secondary mb-3">
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
        {revenueLoading ? (
          <ChartLoadingPlaceholder title="Revenue generated overview" />
        ) : (
          <RevenueChart
            data={revenueData?.charts?.revenue_overview || undefined}
            filter={revenueFilter}
            onFilterChange={setRevenueFilter}
          />
        )}
        {registeredLoading ? (
          <ChartLoadingPlaceholder title="Registered Users Overview" />
        ) : (
          <RegisteredUsersChart
            data={registeredData?.charts?.registered_users || undefined}
            filter={registeredFilter}
            onFilterChange={setRegisteredFilter}
          />
        )}
        {subscribedLoading ? (
          <ChartLoadingPlaceholder title="Subscribed Users Overview" />
        ) : (
          <SubscribedUsersChart
            data={subscribedData?.charts?.subscribed_users || undefined}
            filter={subscribedFilter}
            onFilterChange={setSubscribedFilter}
          />
        )}
        <SubAccountChart data={dashboardData?.charts?.sub_account_stats || undefined} />
      </div>

      <div className="w-full mt-6">
        {statesLoading ? (
          <ChartLoadingPlaceholder title="Top Selling States" />
        ) : (
          <TopSellingStatesChart
            data={statesData?.charts?.states || undefined}
            filter={statesFilter}
            onFilterChange={setStatesFilter}
          />
        )}
      </div>

    </div>
  );
};

export default Admin_Home_Dashboard;
