import { useState, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MoreHorizontal, Activity, Thermometer, Heart, Wind, Scaling, Weight } from "lucide-react";
import { fetchPrescriptionDetail, updateDrugDispenseStatus } from "../../../queries/Hospital/pharmacist/prescriptions";
import { PharmacistPrescriptionsContext } from "../../../context/HospitalContext/Pharmacist/PharmacistPrescriptionsContext";
import toast from "react-hot-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../Components/ui/Table";

const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(years) ? null : `${years} years`;
};

const getDatetime = (raw) => {
  if (!raw) return "—";
  return new Date(raw).toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const Hospital_Pharmacist_Prescription_Detail_Dashboard = ({ sqid, onBack, isSettled }) => {
  const queryClient = useQueryClient();
  const { fetchOrders } = useContext(PharmacistPrescriptionsContext);

  const { data: order, isLoading } = useQuery({
    queryKey: ["prescription-detail", sqid],
    queryFn: () => fetchPrescriptionDetail(sqid),
    enabled: !!sqid,
  });

  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    if (openMenuId) {
      setTimeout(() => document.addEventListener("click", handleClick), 0);
    }
    return () => document.removeEventListener("click", handleClick);
  }, [openMenuId]);

  const mutation = useMutation({
    mutationFn: (payload) => updateDrugDispenseStatus(payload),
    onSuccess: () => {
      toast.success("Prescription status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["prescription-detail", sqid] });
      // Invalidate the main dashboard list by calling the context's fetchOrders
      if (fetchOrders) {
        fetchOrders();
      }
      setSelectedItems([]);
      setOpenMenuId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update prescription status");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        <div className="w-5 h-5 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin mr-3" />
        Loading details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-gray-500">Order not found or invalid. Please select an order from the dashboard.</div>
    );
  }

  const patientName = `${order.patient_info?.firstname || ""} ${order.patient_info?.lastname || ""}`.trim();
  const requestedBy = order.ordered_by ? `Dr. ${order.ordered_by.firstname || ""} ${order.ordered_by.lastname || ""}`.trim() : "—";
  const clinic = order.hospital_info?.name || "—";
  const email = order.hospital_info?.email || "—";
  
  const allergiesList = order.drugs && order.drugs.length > 0 && order.drugs[0].drug_record?.allergies 
    ? Array.isArray(order.drugs[0].drug_record.allergies) ? order.drugs[0].drug_record.allergies : [order.drugs[0].drug_record.allergies]
    : [];

  const handleUpdateStatus = (items, status) => {
    if (items.length === 0) return;
    const payload = {
      order_items: items.map(id => ({
        order_item: id,
        status,
        reason: status === "unavailable" ? "Unavailable" : ""
      }))
    };
    mutation.mutate(payload);
  };

  const handleBulkAction = (status) => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one drug");
      return;
    }
    handleUpdateStatus(selectedItems, status);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pendingIds = order.drugs?.filter(d => d.status === "pending").map(d => d.sqid) || [];
      setSelectedItems(pendingIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectOne = (sqid, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, sqid]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== sqid));
    }
  };

  const pendingDrugs = order.drugs?.filter(d => d.status === "pending") || [];
  const allSelected = pendingDrugs.length > 0 && selectedItems.length === pendingDrugs.length;
  const isUpdating = mutation.isPending;

  return (
    <div className="font-sans">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-4 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-docuhealth-primary transition-colors"
          >
            <ArrowLeft size={16} />
            {isSettled ? "Settled prescription" : "Prescription"}
          </button>
        </div>

        {/* Patient & Provider Info */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-gray-900">{patientName}</h2>
              <p className="text-[13px] text-gray-500">Patient HIN: {order.patient_info?.hin}</p>
              <p className="text-[13px] text-gray-500">Age: {calcAge(order.patient_info?.dob) || "—"}</p>
              <p className="text-[13px] text-gray-500">Gender: {order.patient_info?.gender || "—"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-[13px] text-gray-400 font-medium">Prescribed by:</p>
              <p className="text-sm font-semibold text-gray-900">{requestedBy}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[13px] text-gray-400 font-medium">Provider information:</p>
              <p className="text-sm font-semibold text-gray-900">{clinic}</p>
              <p className="text-[13px] text-gray-500">Email: {email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[13px] text-gray-400 font-medium">Date/Time uploaded</p>
              <p className="text-[13px] font-semibold text-gray-900">{getDatetime(order.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Drugs Table Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
             <h3 className="text-[15px] font-semibold text-gray-700">
               {order.order_source?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Prescription Details"}
             </h3>
             {!isSettled && selectedItems.length > 0 && (
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => handleBulkAction("unavailable")}
                   disabled={isUpdating}
                   className="px-4 py-2 text-[12px] font-medium text-red-500 border border-red-500 rounded-full hover:bg-red-50 disabled:opacity-50 transition-colors"
                 >
                   Mark as unavailable
                 </button>
                 <button 
                   onClick={() => handleBulkAction("dispensed")}
                   disabled={isUpdating}
                   className="px-4 py-2 text-[12px] font-medium text-green-500 border border-green-500 rounded-full hover:bg-green-50 disabled:opacity-50 transition-colors"
                 >
                   Mark as dispensed
                 </button>
               </div>
             )}
          </div>
          <div className="w-full">
            <div className="hidden sm:block">
              <Table className="w-full text-left text-sm whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-gray-50/50 text-gray-600 font-semibold">
                    {!isSettled && (
                      <TableHead className="px-4 py-3 rounded-tl-full rounded-bl-full w-10">
                        <input 
                          type="checkbox" 
                          checked={allSelected}
                          onChange={handleSelectAll}
                          className="rounded-sm border-gray-300 w-3.5 h-3.5 text-docuhealth-primary cursor-pointer" 
                        />
                      </TableHead>
                    )}
                    <TableHead className={`px-4 py-3 ${isSettled ? "rounded-tl-full rounded-bl-full" : ""}`}>Drug(s)</TableHead>
                    <TableHead className="px-4 py-3">Dosage</TableHead>
                    <TableHead className="px-4 py-3">Route</TableHead>
                    <TableHead className="px-4 py-3">Frequency</TableHead>
                    <TableHead className="px-4 py-3">Duration</TableHead>
                    <TableHead className="px-4 py-3">Status</TableHead>
                    {!isSettled && <TableHead className="px-4 py-3 rounded-tr-full rounded-br-full w-10"></TableHead>}
                    {isSettled && <TableHead className="px-4 py-3 rounded-tr-full rounded-br-full w-1"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.drugs?.map((item, idx) => {
                    const drug = item.drug_record || {};
                    const isPending = item.status === "pending";
                    const statusClass = isPending ? "text-amber-500" : item.status === "unavailable" ? "text-red-500" : "text-green-500";
                    const isSelected = selectedItems.includes(item.sqid);
                    
                    return (
                      <TableRow key={item.sqid || idx} className="text-gray-600">
                        {!isSettled && (
                          <TableCell className="px-4 py-4">
                            {isPending && (
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={(e) => handleSelectOne(item.sqid, e.target.checked)}
                                className="rounded-sm border-gray-300 w-3.5 h-3.5 text-docuhealth-primary cursor-pointer" 
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell className="px-4 py-4">{drug.name}</TableCell>
                        <TableCell className="px-4 py-4">{drug.quantity} {drug.unit}</TableCell>
                        <TableCell className="px-4 py-4">{drug.route}</TableCell>
                        <TableCell className="px-4 py-4">{drug.frequency}</TableCell>
                        <TableCell className="px-4 py-4">{drug.duration?.value} {drug.duration?.rate}</TableCell>
                        <TableCell className={`px-4 py-4 text-[13px] font-semibold capitalize ${statusClass}`}>{item.status}</TableCell>
                        {!isSettled && (
                          <TableCell className="px-4 py-4 relative">
                            {isPending && (
                              <>
                                <button 
                                  onClick={() => setOpenMenuId(openMenuId === item.sqid ? null : item.sqid)} 
                                  className="text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
                                >
                                  <MoreHorizontal size={18} />
                                </button>
                                
                                {openMenuId === item.sqid && (
                                  <div className="absolute right-0 top-10 mt-2 bg-white border shadow-sm rounded-sm p-2 w-52 z-30" onClick={(e) => e.stopPropagation()}>
                                     <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 pt-1">Option card</p>
                                    <p 
                                      onClick={() => {
                                        handleUpdateStatus([item.sqid], "dispensed");
                                        setOpenMenuId(null);
                                      }}
                                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer transition-colors"
                                    >
                                      Drug has been dispensed
                                    </p>
                                    <p 
                                      onClick={() => {
                                        handleUpdateStatus([item.sqid], "unavailable");
                                        setOpenMenuId(null);
                                      }}
                                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer transition-colors"
                                    >
                                      Drug is unavailable
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </TableCell>
                        )}
                        {isSettled && <TableCell className="px-4 py-4"></TableCell>}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="block sm:hidden space-y-4">
              {order.drugs?.map((item, idx) => {
                const drug = item.drug_record || {};
                const isPending = item.status === "pending";
                const statusClass = isPending ? "text-amber-500" : item.status === "unavailable" ? "text-red-500" : "text-green-500";
                const isSelected = selectedItems.includes(item.sqid);

                return (
                  <div key={item.sqid || idx} className="bg-white border border-gray-200 rounded-lg p-4 relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        {!isSettled && isPending && (
                          <div className="mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={(e) => handleSelectOne(item.sqid, e.target.checked)}
                              className="rounded-sm border-gray-300 w-4 h-4 text-docuhealth-primary cursor-pointer" 
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 text-[15px] leading-tight">{drug.name}</p>
                          <p className={`text-[12px] font-semibold capitalize ${statusClass} mt-0.5`}>{item.status}</p>
                        </div>
                      </div>

                      {!isSettled && isPending && (
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === item.sqid ? null : item.sqid)} 
                            className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${openMenuId === item.sqid ? "bg-slate-200 text-gray-700" : "bg-gray-50 hover:bg-gray-100 text-gray-500"}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {openMenuId === item.sqid && (
                            <div className="absolute right-0 top-10 mt-1 bg-white border shadow-sm rounded-sm p-2 w-48 z-30" onClick={(e) => e.stopPropagation()}>
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 pt-1">Option card</p>
                              <p 
                                onClick={() => {
                                  handleUpdateStatus([item.sqid], "dispensed");
                                  setOpenMenuId(null);
                                }}
                                className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer transition-colors"
                              >
                                Drug has been dispensed
                              </p>
                              <p 
                                onClick={() => {
                                  handleUpdateStatus([item.sqid], "unavailable");
                                  setOpenMenuId(null);
                                }}
                                className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer transition-colors"
                              >
                                Drug is unavailable
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Dosage</p>
                        <p className="text-[13px] font-medium text-gray-700">{drug.quantity} {drug.unit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Route</p>
                        <p className="text-[13px] font-medium text-gray-700">{drug.route}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Frequency</p>
                        <p className="text-[13px] font-medium text-gray-700">{drug.frequency}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Duration</p>
                        <p className="text-[13px] font-medium text-gray-700">{drug.duration?.value} {drug.duration?.rate}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-[13px] text-gray-500 mb-2 font-medium">Allergies</p>
          {allergiesList.length > 0 ? (
            <ul className="space-y-2">
              {allergiesList.map((allergy, i) => (
                <li key={i} className="text-[13px] font-semibold text-gray-800 flex gap-2">
                   <span>{i + 1}.</span> 
                   <span>{allergy}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] font-semibold text-gray-800">No known allergies.</p>
          )}
        </div>

        {/* Vitals */}
        <div className="bg-docuhealth-light-gray rounded-lg border border-gray-200 p-4 mb-10">
          <h2 className="font-medium text-gray-800">
            {isSettled 
              ? `Patient vital signs (As at when dispensed: ${getDatetime(order.latest_vitals?.created_at || order.updated_at || order.created_at)})` 
              : `Latest patient vital signs (Last updated on: ${getDatetime(order.latest_vitals?.created_at || order.created_at)})`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px] mt-5">
             <div className="bg-white border border-gray-200 rounded-md p-3">
                <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                  <Activity size={16} className="text-docuhealth-primary" />
                  Blood pressure
                </p>
                <p className="font-medium text-[13px] text-gray-800">
                  {order.latest_vitals?.blood_pressure ? `${order.latest_vitals.blood_pressure} mmHg` : "—"}
                </p>
             </div>
             
             <div className="bg-white border border-gray-200 rounded-md p-3">
                <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                  <Thermometer size={16} className="text-docuhealth-primary" />
                  Temperature
                </p>
                <p className="font-medium text-[13px] text-gray-800">
                  {order.latest_vitals?.temp ? `${order.latest_vitals.temp}°C` : "—"}
                </p>
             </div>

             <div className="bg-white border border-gray-200 rounded-md p-3">
                <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                  <Heart size={16} className="text-docuhealth-primary" />
                  Heart rate
                </p>
                <p className="font-medium text-[13px] text-gray-800">
                  {order.latest_vitals?.heart_rate ? `${order.latest_vitals.heart_rate} bpm` : "—"}
                </p>
             </div>

             <div className="bg-white border border-gray-200 rounded-md p-3">
                <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                  <Wind size={16} className="text-docuhealth-primary" />
                  Respiratory rate
                </p>
                <p className="font-medium text-[13px] text-gray-800">
                  {order.latest_vitals?.resp_rate ? `${order.latest_vitals.resp_rate} / min` : "—"}
                </p>
             </div>
             
             <div className="bg-white border border-gray-200 rounded-md p-3">
                <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                  <Scaling size={16} className="text-docuhealth-primary" />
                  Height
                </p>
                <p className="font-medium text-[13px] text-gray-800">
                  {order.latest_vitals?.height ? `${order.latest_vitals.height} cm` : "—"}
                </p>
             </div>

             <div className="bg-white border border-gray-200 rounded-md p-3">
                <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                  <Weight size={16} className="text-docuhealth-primary" />
                  Weight
                </p>
                <p className="font-medium text-[13px] text-gray-800">
                  {order.latest_vitals?.weight ? `${order.latest_vitals.weight} Kg` : "—"}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hospital_Pharmacist_Prescription_Detail_Dashboard;
