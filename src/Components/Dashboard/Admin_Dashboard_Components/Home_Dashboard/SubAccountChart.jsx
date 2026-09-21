import React from "react";
import ReactECharts from "echarts-for-react";
import CustomDropdown from "./CustomDropdown";
import { Download } from "lucide-react";

const SubAccountChart = ({ data = [], filter = "Monthly", onFilterChange }) => {
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
    link.setAttribute("download", `sub_account_data_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
            Users with sub account
          </h3>
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
        <div className="flex-1 flex justify-center items-center text-gray-400 text-sm">
          No sub account data available
        </div>
      </div>
    );
  }

  const pieSeriesData = data.map((item, idx) => {
    const rawName = item.label || item.name || "";
    const value = item.value || 0;
    const isWith = rawName.toLowerCase().includes("with") && !rawName.toLowerCase().includes("without");
    const displayName = isWith ? "With subaccounts" : "Without subaccounts";

    return {
      name: displayName,
      value,
      itemStyle: { color: isWith ? "#22c55e" : "#d1d5db" },
    };
  });

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)"
    },
    legend: {
      bottom: "0%",
      left: "center",
      icon: "circle",
      itemGap: 20,
      textStyle: {
        color: "#9ca3af",
        fontSize: 12
      }
    },
    series: [
      {
        type: "pie",
        radius: "75%",
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "inner",
          formatter: "{d}%",
          fontSize: 13,
          fontWeight: 'bold',
          color: '#fff'
        },
        labelLine: {
          show: false,
        },
        data: pieSeriesData,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
          Users with sub account
        </h3>
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
      <ReactECharts option={option} style={{ height: "300px", width: "100%" }} />
    </div>
  );
};

export default SubAccountChart;
