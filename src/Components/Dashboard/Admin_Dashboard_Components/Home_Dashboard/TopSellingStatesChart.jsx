import React from "react";
import CustomDropdown from "./CustomDropdown";

const TopSellingStatesChart = ({ data = [], filter = "Monthly", onFilterChange }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[400px] flex flex-col mt-6">
        <div className="flex justify-between items-start mb-6 w-full">
          <div>
            <h3 className="text-xs lg:text-lg lg:font-semibold text-[#1B2B40]">
              Top selling states
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Top 6 states with the most registered users
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3E4095]"></span>
              <span className="text-xs text-gray-500">
                State with the most registrations
              </span>
            </div>
            <CustomDropdown
              options={["Monthly", "Weekly", "Yearly"]}
              value={filter}
              onChange={onFilterChange}
            />
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center text-gray-400 text-sm">
          No state registration data available
        </div>
      </div>
    );
  }

  // Sort data strictly by value descending
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 6); // Top 6 like the design

  const maxVal = Math.max(...sortedData.map(d => d.value), 1); // fallback to avoid div by 0

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200 w-full mt-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 w-full">
        <div>
          <h3 className="text-sm lg:text-lg lg:font-semibold text-[#1F2937]">
            Top selling states
          </h3>
          <p className="text-xs lg:text-sm text-gray-400 mt-1 font-medium">
            Top 6 states with the most registered users
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3E4095]"></span>
            <span className="text-xs text-gray-400 font-medium">
              State with the most registrations
            </span>
          </div>
          <CustomDropdown
            options={["Monthly", "Weekly", "Yearly"]}
            value={filter}
            onChange={onFilterChange}
          />
        </div>
      </div>
      
      {/* Funnel Display using pure Tailwind to maintain perfectly rounded pills */}
      <div className="w-full flex flex-col items-center justify-center gap-4 py-4 min-h-[300px]">
        {sortedData.map((item, index) => {
          // Calculate width relative to max value. Using a minimum of 35% so text doesn't overflow
          const widthPercent = Math.max((item.value / maxVal) * 100, 35);
          
          return (
            <div
              key={item.state}
              className={`rounded-full py-3 px-6 flex items-center justify-center transition-all duration-300 max-w-full ${
                index === 0 ? "bg-[#3E4095] text-white" : "bg-[#8A8883] text-white"
              }`}
              style={{ width: `${widthPercent}%` }}
            >
              <span className="text-sm md:text-[15px] font-medium whitespace-nowrap truncate min-w-0">
                {item.state}: {item.value} registrations
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopSellingStatesChart;
