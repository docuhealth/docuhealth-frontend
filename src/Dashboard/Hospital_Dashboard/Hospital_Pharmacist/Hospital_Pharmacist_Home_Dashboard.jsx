import React, { useState, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import { PharmacistAppContext } from "../../../context/HospitalContext/Pharmacist/PharmacistAppContext";
import RecentPatients from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/Home_Dashboard/components/RecentPatients";
import TotalDispensedDrugsChart from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/Home_Dashboard/components/TotalDispensedDrugsChart";
import { Pill, Activity, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchPharmacistTrend } from "../../../queries/Hospital/pharmacist/trend";

const ChartLoadingPlaceholder = ({ title }) => (
  <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col justify-between animate-pulse">
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

const Hospital_Pharmacist_Home_Dashboard = () => {
  const { hospitalName, backgroundImage } = useContext(PharmacistAppContext);
  const backgroundImageUrl = backgroundImage || template;
  
  const [trendFilter, setTrendFilter] = useState("monthly");
  const isUserLoggedIn = !!getHospitalToken();

  const { data: trendData, isPending: trendLoading } = useQuery({
    queryKey: ["pharmacist-trend-metrics", trendFilter],
    queryFn: fetchPharmacistTrend,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const trendArray = Array.isArray(trendData) ? trendData : [];
  const totalDispensed = trendArray.reduce((sum, item) => sum + (item.count || 0), 0);

  const statCards = [
    {
      title: "Total dispensed drugs",
      value: totalDispensed,
      icon: <Pill size={20} className="text-docuhealth-primary" />,
      bgClass: "bg-docuhealth-primary/20",
    },
    {
      title: "Active Prescriptions",
      value: "-",
      icon: <Activity size={20} className="text-amber-500" />,
      bgClass: "bg-amber-100",
    },
    {
      title: "Recent Patients",
      value: "-",
      icon: <Users size={20} className="text-blue-500" />,
      bgClass: "bg-blue-100",
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
              {hospitalName ? (hospitalName.toUpperCase().endsWith('HOSPITAL') ? hospitalName : `${hospitalName} Hospital`) : "NIL Hospital"}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-md p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${stat.bgClass}`}>
                {stat.icon}
              </div>
              <p className="text-sm font-semibold text-docuhealth-dark">{stat.title}</p>
            </div>
            <p className="text-3xl font-semibold text-docuhealth-secondary mb-3">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6 w-full">
        {trendLoading ? (
          <ChartLoadingPlaceholder title="Total dispensed drugs" />
        ) : (
          <TotalDispensedDrugsChart
            data={trendArray}
            filter={trendFilter}
            onFilterChange={setTrendFilter}
          />
        )}
      </div>

      <div className="bg-white rounded-lg my-6 ">
        <div className=" border rounded-lg p-4 lg:p-6">
          <h2 className=" mb-4 pb-2 border-b font-medium">
            Recent Patients
          </h2>
          <div>
            <RecentPatients />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hospital_Pharmacist_Home_Dashboard;
