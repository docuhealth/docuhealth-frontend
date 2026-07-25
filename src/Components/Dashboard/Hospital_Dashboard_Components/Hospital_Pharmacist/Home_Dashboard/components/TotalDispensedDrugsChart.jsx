import React from "react";
import ReactECharts from "echarts-for-react";
import CustomDropdown from "../../../../Admin_Dashboard_Components/Home_Dashboard/CustomDropdown";

const TotalDispensedDrugsChart = ({ data = [], filter = "monthly", onFilterChange }) => {
  const trend = Array.isArray(data) ? data : [];
  
  const xAxisData = trend.map(t => {
      if (!t.date) return "";
      const d = new Date(t.date);
      if (filter.toLowerCase() === 'monthly') {
          return d.toLocaleString('default', { month: 'short' });
      } else if (filter.toLowerCase() === 'yearly') {
          return d.getFullYear().toString();
      } else {
          return d.toLocaleDateString();
      }
  });
  const yAxisData = trend.map(t => t.count || 0);

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
      splitLine: { show: false, lineStyle: { color: '#f3f4f6' } },
      axisLabel: {
        color: "#9ca3af",
      },
    },
    series: [
      {
        name: "Total dispensed",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: {
          color: "#e11d48", // red as per screenshot
          width: 2,
        },
        itemStyle: {
          color: "#e11d48",
        },
        data: yAxisData,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
          Total dispensed drugs
        </h3>
        <div className="flex items-center gap-2">
          <CustomDropdown
            options={["Daily", "Weekly", "Monthly", "Yearly"]}
            value={filter.charAt(0).toUpperCase() + filter.slice(1)}
            onChange={(val) => onFilterChange(val.toLowerCase())}
          />
        </div>
      </div>
      <div className="flex-1 w-full">
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
};

export default TotalDispensedDrugsChart;
