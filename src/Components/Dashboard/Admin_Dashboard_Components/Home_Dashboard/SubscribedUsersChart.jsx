import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import CustomDropdown from "./CustomDropdown";


const formatMonth = (dateString) => {
  if (!dateString) return "";
  const [year, month] = dateString.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}` || dateString;
};

const SubscribedUsersChart = ({ data = [], filter = "Monthly", onFilterChange }) => {
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
            Subscribed users overview
          </h3>
          <CustomDropdown
            options={["Monthly", "Weekly", "Yearly"]}
            value={filter}
            onChange={onFilterChange}
          />
        </div>
        <div className="flex-1 flex justify-center items-center text-gray-400 text-sm">
          No subscribed user data available
        </div>
      </div>
    );
  }

  const xAxisData = data.map((d) => formatMonth(d.month));
  const yAxisData = data.map((d) => d.value);

  // We find index of max value to highlight it
  const maxVal = Math.max(...yAxisData);
  const maxIdx = yAxisData.indexOf(maxVal);

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
      splitLine: { 
        show: true,
        lineStyle: {
          color: '#f3f4f6',
        }
      },
      axisLabel: { color: "#9ca3af" },
    },
    series: [
      {
        name: "Subscribed Users",
        type: "line",
        smooth: false,
        showSymbol: false,
        lineStyle: {
          color: "#F02828",
          width: 2,
        },
        markPoint: {
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#F02828'
          },
          label: {
              show: true,
              position: 'top',
              color: '#333',
              fontWeight: 'bold',
              backgroundColor: '#fff',
              padding: [4, 8],
              borderRadius: 4,
              shadowColor: 'rgba(0,0,0,0.1)',
              shadowBlur: 5,
          },
          data: [
            { type: 'max', name: 'Max' }
          ]
        },
        data: yAxisData,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
          Subscribed users overview
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

export default SubscribedUsersChart;
