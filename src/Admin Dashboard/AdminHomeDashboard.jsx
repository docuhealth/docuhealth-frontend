import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminHead from "./Admin Part/AdminHead";
import DynamicDate from "../Components/Dynamic Date/DynamicDate";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import AdminSideBar from "../Components/AdminSideBar/AdminSideBar";
import AdminSmallTabs from "../Components/AdminSmalllTabs/AdminSmallTabs";
import AdminSellingStates from "../Components/AdminSellingStates/AdminSellingStates";
import AdminGridLayout1 from "../Components/AdminGridLayout1/AdminGridLayout1";
import AdminGridLayout2 from "../Components/AdminGridLayout2/AdminGridLayout2";
import PharmacyTableHead from "../Components/PharmacyRequestTable/PharmacyTableHead/PharmacyTableHead";
import PharmacyRequestTable from "../Components/PharmacyRequestTable/PharmacyRequestTable";

const AdminHomeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState("...");
  const [totalUsersPercent, setTotalUsersPercent] = useState("...");

  const [regHosp, setRegHosp] = useState("...");
  const [regHospPercent, setRegHospPercent] = useState("...");

  const [totalRegInd, setTotalRegInd] = useState("...");
  const [totalRegIndPercent, setTotalRegIndPercent] = useState("...");

  const [chartData, setChartData] = useState({ categories: [], series: [] });

  const [loading, setLoading] = useState(true);

  const [hasData, setHasData] = useState(false); // Track if data exists

  const [subscribedChartData, setSubscribedChartData] = useState({
    categories: [],
    series: [],
  });

  const [chartDataS, setChartDataS] = useState({
    series: [{ name: "Registered Users", data: [] }],
    options: {
      chart: { type: "bar", height: 350 },
      plotOptions: { bar: { horizontal: true, barHeight: "50%" } },
      dataLabels: { enabled: true },
      xaxis: { categories: [] },
      colors: ["#1E90FF"], // Blue color for bars
    },
  });

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [patientsWithSub, setPatientsWithSub] = useState(0);
  const [pieChartData, setPieChartData] = useState({ series: [], labels: [] });

  const location = useLocation();

  const isActive = (path = "/admin-home-dashboard") =>
    location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
      console.log("Token:", token);

      if (!token) {
        console.log("Token not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching data...");
        const response = await axios.get(
          "https://docuhealth-backend-h03u.onrender.com/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API Response:", response.data);

        setTotalUsers(response.data.metrics.total_users);
        setTotalUsersPercent(response.data.metrics.users_percentage_increase);

        setRegHosp(response.data.metrics.total_hospitals);
        setRegHospPercent(response.data.metrics.hospital_percentage_increase);

        setTotalRegInd(response.data.metrics.total_patients);
        setTotalRegIndPercent(
          response.data.metrics.patient_percentage_increase
        );

        const users = response.data.metrics.total_users;
        const patientsSub = response.data.metrics.patients_with_subaccounts;

        // Calculate percentages
        const withSubPercent = Math.round((patientsSub / users) * 100);
        const withoutSubPercent = 100 - withSubPercent;

        // Update pie chart data
        setPieChartData({
          series: [withSubPercent, withoutSubPercent],
          labels: ["Patients with Subaccounts", "Patients without Subaccounts"],
        });

        const patientMetrics = response.data.metrics?.patient_metrics || [];

        if (patientMetrics.length === 0) {
          console.log("No patient data available.");
          setHasData(false);
        } else {
          setHasData(true);
          // Sort data by _id (month order)
          const sortedMetrics = patientMetrics.sort((a, b) => a._id - b._id);

          // Extract categories (months) and series (user_count values)
          const categories = sortedMetrics.map(
            (item) => monthNames[item._id - 1]
          ); // Convert month number to name
          const userCounts = sortedMetrics.map((item) => item.user_count);

          // Set chart data
          setChartData({
            categories,
            series: [{ name: "Patients", data: userCounts }],
          });
        }

        const subscribedMetrics =
          response.data.metrics?.subscribed_users_metrics || [];

        if (subscribedMetrics.length === 0) {
          console.log("No subscribed users data available.");
          setHasData(false);
        } else {
          setHasData(true);

          // Sort data by _id (month order)
          const sortedSubscribedMetrics = subscribedMetrics.sort(
            (a, b) => a._id - b._id
          );

          // Extract categories (months) and series (user_count values)
          const subscribedCategories = sortedSubscribedMetrics.map(
            (item) => monthNames[item._id - 1]
          );
          const subscribedUserCounts = sortedSubscribedMetrics.map(
            (item) => item.user_count
          );

          setSubscribedChartData({
            categories: subscribedCategories,
            series: [{ name: "Subscribed Users", data: subscribedUserCounts }],
          });
        }

        // Extract state metrics data
        const stateMetrics = response.data.metrics?.state_metrics || [];

        // Filter and sort data
        const filteredMetrics = stateMetrics.filter((item) => item._id);
        const sortedMetrics = filteredMetrics
          .sort((a, b) => b.count - a.count)
          .slice(0, 6); // Get top 6 states

        // Prepare chart data
        const categories = sortedMetrics.map((item) => item._id);
        const seriesData = sortedMetrics.map((item) => item.count);

        setChartDataS((prev) => ({
          ...prev,
          series: [{ name: "Registered Users", data: seriesData }],
          options: { ...prev.options, xaxis: { categories } },
        }));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        console.log(err.response?.data?.message || "Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chart1Options = {
    chart: { type: "area", toolbar: { show: false } },
    colors: ["#FF4D4D"], // Red gradient color
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        gradientToColors: ["#FFA3A3"], // Lighter red at the bottom
        stops: [0, 100],
        opacityFrom: 0.5, // Semi-transparent at the top
        opacityTo: 0, // Fully transparent at the bottom
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: {
      categories: chartData.categories,
      type: "category",
      labels: { rotate: -45 },
    },
    yaxis: { labels: { formatter: (value) => `${value}` } },
    grid: { borderColor: "#E5E7EB" },
  };

  const pieChartOptions = {
    chart: { type: "donut" },
    labels: pieChartData.labels,
    colors: ["#2EC388", "#FAFAFA"], // Green for with subaccounts, White for without
    legend: { position: "bottom" },
    dataLabels: {
      enabled: true,
      formatter: (val, { seriesIndex }) => `${val.toFixed(0)}%`,
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        colors: ["#FFFFFF", "#1B2B40"], // White for "5%", Dark Blue (#1B2B40) for "95%"
      },
      dropShadow: {
        enabled: false, // Removes shadow effect
      },
    },
  };

  const subscribedChartOptions = {
    chart: { type: "area", toolbar: { show: false } },
    colors: ["#4D79FF"], // Blue gradient color
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        gradientToColors: ["#A3C0FF"], // Lighter blue at the bottom
        stops: [0, 100],
        opacityFrom: 0.5,
        opacityTo: 0,
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: {
      categories: subscribedChartData.categories,
      type: "category",
      labels: { rotate: -45 },
    },
    yaxis: { labels: { formatter: (value) => `${value}` } },
    grid: { borderColor: "#E5E7EB" },
  };
  const [isPharmCodeToggled, setIsPharmCodeToggled] = useState(false);

  return (
    <div>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={closeSidebar}
          ></div>
        )}

        <AdminSideBar
          isSidebarOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
          isActive={isActive}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <AdminHead
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
          />

          {/* Content */}
          <section className="p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2  ">
              <div className=" sm:p-0">
                <DynamicDate />
              </div>
              <div>
                <button
                  className="bg-[#0000FF] text-sm text-white px-4 py-2 rounded-full"
                  onClick={() => setIsPharmCodeToggled(!isPharmCodeToggled)}
                >
                  {isPharmCodeToggled
                    ? "View Dashboard Overview"
                    : "View Pharm-Code Request"}
                </button>
              </div>
            </div>

            {isPharmCodeToggled ? (
              <div className="my-5">
                <PharmacyTableHead />
                <PharmacyRequestTable />
              </div>
            ) : (
              <div>
                <AdminSmallTabs
                  totalUsers={totalUsers}
                  totalUsersPercent={totalUsersPercent}
                  regHosp={regHosp}
                  regHospPercent={regHospPercent}
                  totalRegInd={totalRegInd}
                  totalRegIndPercent={totalRegIndPercent}
                />

                <AdminGridLayout1
                  loading={loading}
                  hasData={hasData}
                  chart1Options={chart1Options}
                  chartData={chartData}
                />

                <AdminGridLayout2
                  loading={loading}
                  hasData={hasData}
                  subscribedChartOptions={subscribedChartOptions}
                  subscribedChartData={subscribedChartData}
                  pieChartOptions={pieChartOptions}
                  pieChartData={pieChartData}
                />

                <AdminSellingStates chartDataS={chartDataS} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminHomeDashboard;
