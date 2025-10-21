import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Hospital_Doctors_Header from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Hospital_Doctors_Header";
import Hospital_Doctors_Sidebar from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Hospital_Doctors_Sidebar";

const Hospital_Doctors_Layout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className=" w-64 shadow border z-20 min-h-screen hidden sm:block">
        <Hospital_Doctors_Sidebar />
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header>
          <Hospital_Doctors_Header />
        </header>
        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#F5F5F5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Hospital_Doctors_Layout;
