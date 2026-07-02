import React from "react";
import { Outlet } from "react-router-dom";
import Hospital_Lab_Header from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/Hospital_Lab_Header";
import Hospital_Lab_Sidebar from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/Hospital_Lab_Sidebar";

const Hospital_Lab_Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shadow-sm border z-20 min-h-screen hidden lg:block">
        <Hospital_Lab_Sidebar />
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header>
          <Hospital_Lab_Header />
        </header>
        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-[#F5F5F5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Hospital_Lab_Layout;
