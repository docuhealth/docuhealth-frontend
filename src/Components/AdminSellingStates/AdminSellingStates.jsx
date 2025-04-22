import React from 'react'
import ReactApexChart from "react-apexcharts";

const AdminSellingStates = ({chartDataS}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-2">Top Selling States</h2>
    <p className="text-sm text-gray-500 mb-4">
      Top 6 states with the most registered users
    </p>
    <ReactApexChart
      options={chartDataS.options}
      series={chartDataS.series}
      type="bar"
      height={350}
    />
  </div>
  )
}

export default AdminSellingStates
