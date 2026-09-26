import React from "react";
import { useSearchParams } from "react-router-dom";
import ScanResultsTab from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Scan_Lab_Results/ScanResultsTab";
import LabResultsTab from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Scan_Lab_Results/LabResultsTab";
import { RESULT_TABS } from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Scan_Lab_Results/scanLabResults";

// Doctors review radiology and lab results here; the active tab lives in `?tab=` so a reload or shared link keeps it.
const Hospital_Doctors_Scan_Lab_Results_Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = RESULT_TABS.some((tab) => tab.key === requestedTab) ? requestedTab : RESULT_TABS[0].key;

  const changeTab = (tab) => setSearchParams({ tab }, { replace: true });

  return activeTab === "lab" ? (
    <LabResultsTab activeTab={activeTab} onTabChange={changeTab} />
  ) : (
    <ScanResultsTab activeTab={activeTab} onTabChange={changeTab} />
  );
};

export default Hospital_Doctors_Scan_Lab_Results_Dashboard;
