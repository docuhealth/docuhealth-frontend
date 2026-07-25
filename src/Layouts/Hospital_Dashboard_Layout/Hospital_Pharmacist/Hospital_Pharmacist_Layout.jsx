import React from "react";
import { Outlet } from "react-router-dom";

import Hospital_Pharmacist_Header from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/Hospital_Pharmacist_Header";
import Hospital_Pharmacist_Sidebar from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/Hospital_Pharmacist_Sidebar";

const Hospital_Pharmacist_Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shadow-sm border z-20 min-h-screen hidden lg:block">
        <Hospital_Pharmacist_Sidebar />
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header>
          <Hospital_Pharmacist_Header />
        </header>
        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-docuhealth-gray-lightest">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Hospital_Pharmacist_Layout;
