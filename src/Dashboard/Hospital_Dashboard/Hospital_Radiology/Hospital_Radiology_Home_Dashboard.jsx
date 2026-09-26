import React, { useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import { RadiologyAppContext } from "../../../context/HospitalContext/Radiology/RadiologyAppContext";
import RecentPatients from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Radiology/Home_Dashboard/components/RecentPatients";
import TotalScansChart from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Radiology/Home_Dashboard/components/TotalScansChart";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchRadiologyTrend } from "../../../queries/Hospital/radiology/trend";

const ChartLoadingPlaceholder = ({ title }) => (
  <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">{title}</h3>
      <div className="h-8 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="flex-1 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-docuhealth-primary"></div>
    </div>
  </div>
);

const Hospital_Radiology_Home_Dashboard = () => {
  const { hospitalName, backgroundImage } = useContext(RadiologyAppContext);
  const backgroundImageUrl = backgroundImage || template;

  const isUserLoggedIn = !!getHospitalToken();

  const { data: trendData, isPending: trendLoading } = useQuery({
    queryKey: ["radiology-trend-metrics"],
    queryFn: fetchRadiologyTrend,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const trendArray = Array.isArray(trendData) ? trendData : [];

  return (
    <>
      <div className="py-2">
        <DynamicDate />

        {/* Cover Image */}
        <div
          className="relative mt-4 w-full h-[180px] sm:h-60 lg:h-[300px] rounded-xl bg-cover bg-center flex flex-col items-center justify-center border border-gray-300"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImageUrl})`,
          }}
        >
          <div className="text-white text-center mb-4">
            <p className="text-xl font-semibold opacity-90 uppercase tracking-widest">
              {hospitalName || "NIL"} Hospital Radiology
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 w-full">
        {trendLoading ? (
          <ChartLoadingPlaceholder title="Total scan carried out" />
        ) : (
          <TotalScansChart data={trendArray} />
        )}
      </div>

      <div className="bg-white rounded-lg my-6">
        <div className="border rounded-lg p-4 lg:p-6">
          <h2 className="mb-4 pb-2 border-b font-medium">Recent patients attended to</h2>
          <div>
            <RecentPatients />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hospital_Radiology_Home_Dashboard;
