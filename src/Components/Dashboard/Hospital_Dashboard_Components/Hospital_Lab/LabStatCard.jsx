import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const LabStatCard = ({ title, value, trend, trendText, icon, bgClass, isLoading }) => (
  <div className="bg-white border border-gray-200 rounded-md p-5 flex flex-col justify-between">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${bgClass}`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-[#1B2B40]">{title}</p>
    </div>
    <p className="text-3xl font-semibold text-[#647284] mb-3">
      {isLoading ? "—" : value}
    </p>
    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 flex-wrap">
      <span className={`flex items-center gap-0.5 ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
        {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(trend)}%
      </span>{" "}
      {trendText}
    </p>
  </div>
);

export default LabStatCard;
