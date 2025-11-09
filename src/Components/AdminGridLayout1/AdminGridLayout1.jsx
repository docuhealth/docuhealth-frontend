import React from "react";
import ReactApexChart from "react-apexcharts";

const AdminGridLayout1 = ({loading, hasData, chart1Options, chartData}) => {
  return (
    <div className="py-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <h3 className=" font-semibold mb-4">
          Revenue Generated Overview (demo-- no revenue yet)
        </h3>
        {loading ? (
          <p>Loading chart data...</p>
        ) : hasData ? (
          <ReactApexChart
            options={chart1Options}
            series={chartData.series}
            type="area"
            height={300}
          />
        ) : (
          <p>No revenue data available.</p>
        )}
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <h3 className=" font-semibold mb-4">Total Registered Users</h3>
        {loading ? (
          <p>Loading chart data...</p>
        ) : hasData ? (
          <ReactApexChart
            options={chart1Options}
            series={chartData.series}
            type="area"
            height={300}
          />
        ) : (
          <p>No total users registered data available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminGridLayout1;
