import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import CustomDropdown from "./CustomDropdown";


const formatMonth = (dateString) => {
  if (!dateString) return "";
  const [year, month] = dateString.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return monthNames[parseInt(month, 10) - 1] || dateString;
};

const RevenueChart = ({ data = [], filter = "Monthly", onFilterChange }) => {

  // If no data, show empty state instead of mock data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
            Revenue generated overview
          </h3>
          <CustomDropdown
            options={["Monthly", "Weekly", "Yearly"]}
            value={filter}
            onChange={onFilterChange}
          />
        </div>
        <div className="flex-1 flex justify-center items-center text-gray-400 text-sm">
          No revenue data available
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
      right: "4%",
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
      axisLabel: { color: "#9ca3af", formatter: (val) => `${val >= 1000 ? val / 1000 + 'k' : val}` },
    },
    series: [
      {
        name: "Revenue",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: "#FBA130",
          width: 3,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(251, 161, 48, 0.3)" },
            { offset: 1, color: "rgba(251, 161, 48, 0.0)" },
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
          Revenue generated overview
        </h3>
        <CustomDropdown
          options={["Monthly", "Weekly", "Yearly"]}
          value={filter}
          onChange={onFilterChange}
        />
      </div>
      <ReactECharts option={option} style={{ height: "300px", width: "100%" }} />
    </div>
  );
};

export default RevenueChart;
