import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Hospital_Nurses_Header from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Hospital_Nurses_Header";
import Hospital_Nurses_Sidebar from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Hospital_Nurses_Sidebar";

const Hospital_Nurses_Layout = () => {
  return (
    <div className="flex h-screen">
    {/* Sidebar */} 
    <aside className=" w-64 shadow-sm border z-20 min-h-screen hidden sm:block">
      <Hospital_Nurses_Sidebar />
    </aside>
    {/* Main content */}
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header>
        <Hospital_Nurses_Header />
      </header>
      {/* Page content */}
      <main className="flex-1 p-6 overflow-y-auto bg-[#F5F5F5]">
        <Outlet />
      </main>
    </div>
  </div>
  )
}

export default Hospital_Nurses_Layout