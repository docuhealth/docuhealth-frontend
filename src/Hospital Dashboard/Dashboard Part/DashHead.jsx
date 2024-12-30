import React, {useState} from 'react'

const DashHead = ({ isSidebarOpen, toggleSidebar, closeSidebar }) => {
  
  return (
    <div>
         {/* Header */}
         <header className="hidden bg-white py-4 px-8 sm:flex justify-between items-center border">
            <h2 className="text-xl font-semibold">
              Welcome back Jarus Hospital! 👋
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
                <button className="p-2 bg-gray-200 rounded-full">🔔</button>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                  <img
                    src="https://img.freepik.com/free-vector/minimalist-geometric-judith-s-tiktok-profile-picture_742173-12131.jpg?ga=GA1.1.384133121.1729851340&semt=ais_hybrid"
                    alt="description"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="ml-2 text-sm font-medium">Jarus hospital</span>
              </div>
            </div>
          </header>

          <header className=" sm:hidden bg-white shadow py-4 flex justify-between items-center px-4 ">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p onClick={toggleSidebar}>
                <i class="bx bx-menu text-2xl"></i>
              </p>
              <p>
                {" "}
                <span className="font-light">Welcome back,</span> <br />
                Jarus Hospital!{" "}
              </p>
              <p className="text-md">👋</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
                <button className="p-2 bg-gray-200 rounded-full">🔔</button>
              </div>
              <div className="flex justify-center items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                  <img
                    src="https://img.freepik.com/free-vector/minimalist-geometric-judith-s-tiktok-profile-picture_742173-12131.jpg?ga=GA1.1.384133121.1729851340&semt=ais_hybrid"
                    alt="description"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p>
                  <i class="bx bx-chevron-down text-2xl"></i>
                </p>
              </div>
            </div>
          </header>
    </div>
  )
}

export default DashHead
