import React from "react";
import ReactECharts from "echarts-for-react";

const SubAccountChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col">
        <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800 mb-6 w-full text-left">
          Users with sub account
        </h3>
        <div className="flex-1 flex justify-center items-center text-gray-400 text-sm">
          No sub account data available
        </div>
      </div>
    );
  }

  const withSubObj = data.find((item) => item.label === "With subaccount");
  const noSubObj = data.find((item) => item.label === "Without subaccount");
  const hasSubCount = withSubObj?.value || 0;
  const noSubCount = noSubObj?.value || 0;

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
        data: [
          {
            value: hasSubCount,
            name: "Users with sub account",
            itemStyle: { color: "#22c55e" }, // Green
          },
          {
            value: noSubCount,
            name: "Users without sub account",
            itemStyle: { color: "#d1d5db" }, // Gray to contrast green
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200 w-full">
      <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800 mb-6 w-full text-left">
        Users with sub account
      </h3>
      <ReactECharts option={option} style={{ height: "300px", width: "100%" }} />
    </div>
  );
};

export default SubAccountChart;
