import React from "react";
import CustomDropdown from "./CustomDropdown";
import { Download } from "lucide-react";

const TopSellingStatesChart = ({ data = [], filter = "Monthly", onFilterChange }) => {
  const handleDownload = () => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const csvContent = [
      keys.join(","),
      ...data.map(row => keys.map(k => row[k]).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `top_selling_states_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[400px] flex flex-col mt-6">
        <div className="flex justify-between items-start mb-6 w-full">
          <div>
            <h3 className="text-xs lg:text-lg lg:font-semibold text-docuhealth-dark">
              Top selling states
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Top 6 states with the most registered users
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-docuhealth-primary"></span>
              <span className="text-xs text-gray-500">
                State with the most registrations
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownload}
                className="p-1.5 text-gray-500 hover:text-docuhealth-primary bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                title="Download CSV"
              >
                <Download size={16} />
              </button>
              <CustomDropdown
                options={["Daily", "Last 24hrs", "Weekly", "Monthly", "Yearly"]}
                value={filter}
                onChange={onFilterChange}
              />
            </div>
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
          <h3 className="text-sm lg:text-lg lg:font-semibold text-docuhealth-gray-800">
            Top selling states
          </h3>
          <p className="text-xs lg:text-sm text-gray-400 mt-1 font-medium">
            Top 6 states with the most registered users
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-docuhealth-primary"></span>
            <span className="text-xs text-gray-400 font-medium">
              State with the most registrations
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="p-1.5 text-gray-500 hover:text-docuhealth-primary bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              title="Download CSV"
            >
              <Download size={16} />
            </button>
            <CustomDropdown
              options={["Daily", "Last 24hrs", "Weekly", "Monthly", "Yearly"]}
              value={filter}
              onChange={onFilterChange}
            />
          </div>
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
                index === 0 ? "bg-docuhealth-primary text-white" : "bg-docuhealth-gray-warm text-white"
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
