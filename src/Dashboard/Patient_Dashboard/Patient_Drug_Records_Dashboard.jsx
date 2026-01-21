import React from "react";
import DynamicDate from "../../Components/Dynamic Date/DynamicDate";
import Drug_Records from "../../Components/Dashboard/Patient_Dashboard_Components/Drug_Records_Dashboard/Drug_Records";

const Patient_Drug_Records_Dashboard = () => {
  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>
      <Drug_Records />
    </>
  );
};

export default Patient_Drug_Records_Dashboard;
