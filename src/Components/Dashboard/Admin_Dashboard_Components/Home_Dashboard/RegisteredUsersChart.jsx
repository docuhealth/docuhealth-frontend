import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import CustomDropdown from "./CustomDropdown";
import { Download } from "lucide-react";


const formatMonth = (dateString) => {
  if (!dateString) return "";
  const [year, month] = dateString.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}` || dateString;
};

const RegisteredUsersChart = ({ data = [], filter = "Monthly", onFilterChange }) => {
  
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
    link.setAttribute("download", `registered_users_data_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md border border-gray-200  w-full h-[380px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
            Total Registered users
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
          No registered user data available
        </div>
      </div>
    );
  }

  const xAxisData = data.map((d) => formatMonth(d.month));
  const yAxisData = data.map((d) => d.value);

  const option = {
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      right: "5%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxisData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#9ca3af", margin: 15 },
    },
    yAxis: {
      type: "value",
      splitLine: { show: false },
      axisLabel: { color: "#9ca3af" },
    },
    series: [
      {
        name: "Registered Users",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: "#9563FF",
          width: 3,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(149, 99, 255, 0.3)" },
            { offset: 1, color: "rgba(149, 99, 255, 0.0)" },
          ]),
        },
        data: yAxisData,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
          Total Registered users
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

export default RegisteredUsersChart;
