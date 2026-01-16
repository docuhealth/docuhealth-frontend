import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Admin_Dashboard_Header from "../../Components/Dashboard/Admin_Dashboard_Components/Admin_Dashboard_Header";
import Admin_Dashboard_Sidebar from "../../Components/Dashboard/Admin_Dashboard_Components/Admin_Dashboard_Sidebar";

const Admin_Dashboard_Layout = () => {
  return (
    <div className="flex h-screen">
    {/* Sidebar */} 
    <aside className=" w-64 shadow-sm border z-20 min-h-screen hidden lg:block">
      <Admin_Dashboard_Sidebar />
    </aside>
    {/* Main content */}
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header>
        <Admin_Dashboard_Header />
      </header>
      {/* Page content */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-[#F5F5F5]">
        <Outlet />
      </main>
    </div>
  </div>
  )
}

export default Admin_Dashboard_Layout