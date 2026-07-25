import ReactECharts from "echarts-for-react";
import CustomDropdown from "../../../Admin_Dashboard_Components/Home_Dashboard/CustomDropdown";
import { Download } from "lucide-react";

const AttendanceOverviewChart = ({ data = [], filter = "Monthly", onFilterChange }) => {

  const handleDownload = () => {
    if (!data || data.length === 0) return;
    const csvContent = [
      "Month,Value",
      ...data.map((row) => `${row.label},${row.value}`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_overview_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md border border-gray-200 w-full h-[380px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
            Patient's Attendance overview
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
          No attendance data available
        </div>
      </div>
    );
  }

  const xAxisData = data.map((d) => d.label);
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
      axisLabel: {
        color: "#9ca3af",
        formatter: (val) => (val >= 1000 ? val / 1000 + "k" : val),
      },
    },
    series: [
      {
        name: "Attendance",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: {
          color: "var(--color-docuhealth-primary)",
          width: 2,
        },
        itemStyle: {
          color: "var(--color-docuhealth-primary)",
        },
        data: yAxisData,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">
          Patient's Attendance overview
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

export default AttendanceOverviewChart;
