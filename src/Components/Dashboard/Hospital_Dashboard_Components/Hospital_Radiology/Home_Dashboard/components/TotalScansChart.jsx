import React from "react";
import ReactECharts from "echarts-for-react";

// No period toggle — the real endpoint is fixed to current-year Jan-Dec.
const TotalScansChart = ({ data = [] }) => {
  const trend = Array.isArray(data) ? data : [];

  const xAxisData = trend.map((t) => (t.date ? new Date(t.date).toLocaleString("default", { month: "short" }) : ""));
  const yAxisData = trend.map((t) => t.count || 0);

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
      splitLine: { show: false, lineStyle: { color: "#f3f4f6" } },
      axisLabel: {
        color: "#9ca3af",
      },
    },
    series: [
      {
        name: "Total scans",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: {
          color: "#e11d48",
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
        <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">Total scan carried out</h3>
        <span className="text-xs text-gray-400 font-medium">This year</span>
      </div>
      <div className="flex-1 w-full">
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
};

export default TotalScansChart;
