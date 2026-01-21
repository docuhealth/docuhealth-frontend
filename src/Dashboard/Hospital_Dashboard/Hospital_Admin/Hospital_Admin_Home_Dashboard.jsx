import React from "react";
import DynamicDate from "../../../Components/Dynamic Date/DynamicDate";
import template from "../../../assets/img/template.png";

const Hospital_Admin_Home_Dashboard = () => {
  return (
    <>
      <div className="py-2">
        <DynamicDate />
        <div className="pt-4">
          <img src={template} alt="img" />
        </div>
      </div>
    </>
  );
};
export default Hospital_Admin_Home_Dashboard;
