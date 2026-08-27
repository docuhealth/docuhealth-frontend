import React, { useState } from "react";

const CarePlanHistory = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  // Mock data for care plan history based on the user's UI screenshot
  const mockData = Array(5).fill({
    date: "August 21, 2025",
    time: "10:45 AM",
    patient: "Amiefa Obed",
  });

  const toggleDropdown = (index) => {
    if (openDropdown === index) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(index);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Care plan history</h2>
        <div className="flex items-center gap-4">
          <button className="text-docuhealth-primary border border-docuhealth-primary font-medium rounded-full px-5 py-2 text-sm hover:bg-blue-50 transition-colors">
            Add new care plan
          </button>
          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black">
            Filter 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {mockData.map((item, index) => (
          <div key={index} className="bg-white border border-gray-100 rounded-lg p-5 flex items-center justify-between shadow-sm relative">
            
            <div className="flex items-center flex-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
                <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
              </svg>
              <div className="ml-3 text-[13px] text-gray-800">
                Date uploaded: {item.date}
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-100 mx-4"></div>

            <div className="flex items-center flex-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
                <circle cx="12" cy="15" r="3" />
                <path d="M12 15v-2" />
              </svg>
              <div className="ml-3 text-[13px] text-gray-800">
                Time uploaded: {item.time}
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-100 mx-4"></div>

            <div className="flex items-center flex-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <div className="ml-3 text-[13px] text-gray-800">
                Patient: {item.patient}
              </div>
            </div>

            <div className="relative">
              <button onClick={() => toggleDropdown(index)} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="19" cy="12" r="1"/>
                  <circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
              
              {openDropdown === index && (
                <div className="absolute right-0 top-10 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1">
                  <button className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-black">
                    View full details
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default CarePlanHistory;
