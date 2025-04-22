import React from 'react'
import ReactApexChart from "react-apexcharts";

const AdminGridLayout2 = ({loading, hasData, subscribedChartOptions, subscribedChartData, pieChartOptions, pieChartData}) => {
  return (
    <div className="py-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="bg-white p-4 rounded-2xl shadow grid grid-cols-1 ">
      <h3 className="font-semibold mb-4">Total Subscribed Users</h3>
      {loading ? (
        <p>Loading chart data...</p>
      ) : hasData ? (
        <ReactApexChart
          options={subscribedChartOptions}
          series={subscribedChartData.series}
          type="area"
          height={300}
        />
      ) : (
        <p>No subscribed users data available.</p>
      )}
    </div>

    <div className="bg-white p-4 rounded-2xl shadow grid grid-cols-1 place-items-center">
      <h3 className="font-semibold mb-4 text-left w-full">
        Users with sub account
      </h3>
      <div>
        {loading ? (
          <p>Loading chart data...</p>
        ) : hasData ? (
          <ReactApexChart
            options={pieChartOptions}
            series={pieChartData.series}
            type="pie"
            width={400}
          />
        ) : (
          <p>No patient subscription data available.</p>
        )}
      </div>
    </div>
  </div>
  )
}

export default AdminGridLayout2
