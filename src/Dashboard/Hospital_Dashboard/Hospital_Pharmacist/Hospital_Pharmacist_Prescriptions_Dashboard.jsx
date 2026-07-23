import { useContext, useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import {
  ChevronDown,
  Pill,
} from "lucide-react";
import { PharmacistPrescriptionsContext } from "../../../context/HospitalContext/Pharmacist/PharmacistPrescriptionsContext";
import PrescriptionOrderCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/PrescriptionOrderCard";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import Hospital_Pharmacist_Prescription_Detail_Dashboard from "./Hospital_Pharmacist_Prescription_Detail_Dashboard";

const tabs = ["Pending Dispensation", "Settled Dispensation"];

const getBadgeStyle = (status) => {
  const normalizedStatus = status?.toLowerCase() || "";
  switch (normalizedStatus) {
    case "pending":
      return { label: "Pending", cls: "bg-amber-100 text-amber-600" };
    case "dispensed":
    case "all_dispensed":
      return { label: normalizedStatus.replace(/_/g, ' '), cls: "bg-green-100 text-green-600 capitalize" };
    case "unavailable":
    case "all_unavailable":
      return { label: normalizedStatus.replace(/_/g, ' '), cls: "bg-red-100 text-red-600 capitalize" };
    case "partially_dispensed":
      return { label: "Partially Dispensed", cls: "bg-blue-100 text-blue-600 capitalize" };
    default:
      return { label: status?.replace(/_/g, ' ') || "—", cls: "bg-indigo-100 text-indigo-500 capitalize" };
  }
};

const TAB_STATUS_MAP = {
  "Pending Dispensation": "pending",
  "Settled Dispensation": "dispensed",
};

const Hospital_Pharmacist_Prescriptions_Dashboard = () => {
  const {
    orders,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    ordering,
    setOrdering,
    count,
  } = useContext(PharmacistPrescriptionsContext);

  const [selectedOrderSqid, setSelectedOrderSqid] = useState(null);

  if (selectedOrderSqid) {
    return (
      <Hospital_Pharmacist_Prescription_Detail_Dashboard 
        sqid={selectedOrderSqid} 
        onBack={() => setSelectedOrderSqid(null)} 
        isSettled={activeTab === "Settled Dispensation"}
      />
    );
  }

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-0 border-b-0 sm:border-b border-gray-200 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-2 sm:px-4 py-2 font-medium transition-colors duration-200 cursor-pointer text-center sm:whitespace-nowrap sm:shrink-0 rounded-lg sm:rounded-none ${
                activeTab === tab
                  ? "bg-docuhealth-primary text-white sm:bg-transparent sm:text-docuhealth-primary sm:border-b-2 sm:border-docuhealth-primary font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 sm:hover:bg-transparent sm:border-b-2 sm:border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sort row */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 mb-6">
          <div className="relative inline-block">
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="flex items-center border border-docuhealth-primary text-docuhealth-primary text-xs font-medium pl-4 pr-10 py-2 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap appearance-none outline-none cursor-pointer bg-transparent"
            >
              <option value="-created_at">Sort by: Latest</option>
              <option value="created_at">Sort by: Oldest</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-docuhealth-primary pointer-events-none" />
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Pill size={36} className="opacity-25 mb-2" />
            <p className="text-sm">Loading prescriptions...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Pill size={36} className="opacity-25 mb-2" />
            <p className="text-sm">No prescriptions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <PrescriptionOrderCard
                key={order.sqid}
                order={order}
                badge={getBadgeStyle(order.aggregate_status || TAB_STATUS_MAP[activeTab])}
                activeTab={activeTab}
                onViewDetails={() => setSelectedOrderSqid(order.sqid)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination2
          count={count}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};

export default Hospital_Pharmacist_Prescriptions_Dashboard;
