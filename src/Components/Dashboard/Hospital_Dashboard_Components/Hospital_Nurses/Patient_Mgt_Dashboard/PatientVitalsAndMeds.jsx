import React, { useState } from "react";
import VitalSignsCard from "../../../../ui/VitalSignsCard";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const PatientVitalsAndMeds = ({ patientFullInfo, formatDateTime }) => {
  const [trendType, setTrendType] = useState("Blood pressure");
  const [trendPeriod, setTrendPeriod] = useState("Monthly");

  // Format date helper (fallback if formatDateTime is not provided)
  const safeFormatDate = (dateString) => {
    if (!dateString) return "NIL";
    if (formatDateTime) return formatDateTime(dateString);
    return new Date(dateString).toLocaleString();
  };

  // ECharts Option for Vital Signs Trend (Mock data matching screenshot)
  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#e5e7eb",
      textStyle: { color: "#374151", fontSize: 12 },
      formatter: (params) => {
        const val = params[0];
        return `<div class="font-medium text-xs mb-1">${val.name}</div>
                <div class="font-bold text-[13px]">${val.value} mmHg</div>`;
      },
    },
    grid: {
      left: "0%",
      right: "2%",
      bottom: "0%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#9ca3af",
        fontSize: 12,
        margin: 16,
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: false,
      },
      axisLabel: {
        color: "#9ca3af",
        fontSize: 12,
        formatter: "{value}",
      },
      min: 0,
      max: 130,
    },
    series: [
      {
        name: trendType,
        type: "line",
        smooth: false,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        itemStyle: {
          color: "#e11d48", // Red dot on hover matching screenshot
        },
        lineStyle: {
          color: "#f59e0b", // Orange line
          width: 2,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(245, 158, 11, 0.2)" }, // Orange transparent
            { offset: 1, color: "rgba(245, 158, 11, 0)" },
          ]),
        },
        data: [70, 52, 67, 80, 50, 110, 95, 105, 85],
        markLine: {
          symbol: "none",
          data: [
            {
              xAxis: "Fri",
              label: { show: false },
              lineStyle: {
                color: "#9ca3af",
                type: "dashed",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Latest Vital Signs */}
      <VitalSignsCard
        className="bg-white rounded-xl border p-6"
        title="Latest vital signs"
        vitalSigns={patientFullInfo?.latest_vitals}
      />

      {/* Vital signs trend */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-800 mb-6">Vital signs trend</h3>
        
        <div className="flex justify-between items-center mb-8">
          <div className="relative inline-block">
            <select 
              value={trendType}
              onChange={(e) => setTrendType(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-600 text-[13px] font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary cursor-pointer w-[150px]"
            >
              <option value="Blood pressure">Blood pressure</option>
              <option value="Heart rate">Heart rate</option>
              <option value="Temperature">Temperature</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
          
          <div className="relative inline-block">
            <select 
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-600 text-[13px] font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary cursor-pointer w-[100px]"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>

      {/* Ongoing Medication */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-800 mb-5">
          Ongoing medication ({patientFullInfo?.ongoing_drugs?.length || 0})
        </h3>
        
        {patientFullInfo?.ongoing_drugs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientFullInfo.ongoing_drugs.map((drug, index) => (
              <div key={index} className="border border-gray-100 p-4 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.1861 2.81611C14.7481 4.3782 14.7481 6.91088 13.1861 8.47295L11.7713 9.88668L8.47199 13.187C6.90986 14.7491 4.37722 14.7491 2.81512 13.187C1.25303 11.6249 1.25303 9.09228 2.81512 7.53015L7.52919 2.81611C9.09126 1.25401 11.6239 1.25401 13.1861 2.81611ZM9.88619 9.88715L6.11496 6.11593L3.75794 8.47295C2.71654 9.51435 2.71654 11.2028 3.75794 12.2442C4.79933 13.2856 6.48777 13.2856 7.52919 12.2442L9.88619 9.88715Z" fill="#EE1414"/>
                    </svg>
                    <p className="font-medium text-gray-800 text-[13px]">{drug.name || "Unknown Drug"}</p>
                  </div>
                  <span className="bg-blue-50 text-docuhealth-primary px-3 py-0.5 rounded-full text-[11px] font-medium">
                    Ongoing
                  </span>
                </div>

                <div className="space-y-2 text-[12px] text-gray-500">
                  <div className="flex justify-between">
                    <p>Dosage:</p>
                    <p className="font-medium text-gray-800">{drug.quantity ? `${drug.quantity} mg` : "N/A"}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Frequency:</p>
                    <p className="font-medium text-gray-800">
                      {drug.frequency ? `${drug.frequency.value}x ${drug.frequency.rate}` : "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p>Duration:</p>
                    <p className="font-medium text-gray-800">
                      {drug.duration ? `${drug.duration.value} ${drug.duration.rate}` : "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-50">
                    <p>Prescribed by:</p>
                    <p className="font-medium text-gray-800">
                      {patientFullInfo?.latest_vitals?.staff_info
                        ? `Dr. ${patientFullInfo.latest_vitals.staff_info.firstname} ${patientFullInfo.latest_vitals.staff_info.lastname}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg">
            No ongoing medications
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientVitalsAndMeds;
