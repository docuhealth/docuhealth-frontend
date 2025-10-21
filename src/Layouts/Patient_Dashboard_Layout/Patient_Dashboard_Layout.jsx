import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Patient_Dashboard_Header from '../../Components/Dashboard/Patient_Dashboard_Components/Patient_Dashboard_Header'
import Patient_Dashboard_Sidebar from '../../Components/Dashboard/Patient_Dashboard_Components/Patient_Dashboard_Sidebar'

const Patient_Dashboard_Layout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className=" w-64 shadow border z-20 min-h-screen hidden sm:block">
        <Patient_Dashboard_Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header>
          <Patient_Dashboard_Header />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#F5F5F5]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Patient_Dashboard_Layout