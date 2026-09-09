import React, { useState, useEffect } from "react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { Loader2, Calendar, Clock, User } from "lucide-react";
import CarePlanDetail from "./CarePlanDetail";
import AddCarePlanForm from "./AddCarePlanForm";

const CarePlanHistory = ({ patient, patientFullInfo }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [view, setView] = useState("list"); // 'list', 'detail', 'add'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientHin = patient?.hin || patientFullInfo?.hin || patientFullInfo?.patient?.hin;

  const fetchCarePlans = async () => {
    if (!patientHin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstanceHos.get(`api/nurses/${patientHin}/care-plans`);
      setPlans(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch care plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlans();
  }, [patientHin]);

  const handleUpload = async (formData) => {
    if (!patientHin) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        patient: patientHin
      };
      await axiosInstanceHos.post(`api/nurses/care-plans`, payload);
      toast.success("Care plan added successfully");
      fetchCarePlans();
      setView("list");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add care plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = (index) => {
    if (openDropdown === index) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(index);
    }
  };

  const handleViewDetail = (plan) => {
    setSelectedPlan(plan);
    setView("detail");
    setOpenDropdown(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (view === "detail" && selectedPlan) {
    return (
      <CarePlanDetail 
        plan={{
          ...selectedPlan,
          patientName: patient ? `${patient.firstname} ${patient.lastname}` : "N/A",
          hin: patientHin,
          nurseName: selectedPlan?.staff_info ? `Nurse ${selectedPlan.staff_info.firstname} ${selectedPlan.staff_info.lastname}` : "Nurse",
          date: formatDate(selectedPlan.created_at),
          time: formatTime(selectedPlan.created_at)
        }} 
        onBack={() => setView("list")} 
      />
    );
  }

  if (view === "add") {
    return (
      <AddCarePlanForm 
        onBack={() => setView("list")}
        onUpload={handleUpload}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-0">
        <h2 className="text-xl font-semibold text-gray-800">Care plan history</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setView("add")}
            className="w-full sm:w-auto text-docuhealth-primary border border-docuhealth-primary font-medium rounded-full px-5 py-2 text-sm hover:bg-blue-50 transition-colors"
          >
            Add new care plan
          </button>
          <button className="w-full sm:w-auto flex justify-center items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black whitespace-nowrap">
            Filter 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-docuhealth-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            No care plans found.
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              {plans.map((item) => (
                <div
                  key={item.sqid}
                  className="mb-4 p-4 border rounded-md flex flex-wrap gap-4 lg:gap-10 relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">
                        Date uploaded
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(item.created_at) || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">
                        Time uploaded
                      </p>
                      <p className="text-sm font-medium">
                        {formatTime(item.created_at) || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">
                        Patient
                      </p>
                      <p className="text-sm font-medium">
                        {patient ? `${patient.firstname} ${patient.lastname}` : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto relative">
                    <button onClick={() => toggleDropdown(item.sqid)} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="19" cy="12" r="1"/>
                        <circle cx="5" cy="12" r="1"/>
                      </svg>
                    </button>
                    
                    {openDropdown === item.sqid && (
                      <div className="absolute right-0 top-10 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-[0px_4px_20px_rgba(0,0,0,0.08)] z-50 p-1.5">
                        <button onClick={() => handleViewDetail(item)} className="w-full text-left p-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                          View full details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="block lg:hidden space-y-4 my-4">
              {plans.map((item) => (
                <div
                  key={item.sqid}
                  className="bg-white border border-gray-200 rounded-md p-4 transition-transform relative"
                >
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-50 mb-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11Z" fill="var(--color-docuhealth-primary)" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Care Plan Uploaded
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(item.created_at) || "N/A"} at {formatTime(item.created_at) || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {patient ? `${patient.firstname?.[0] || ""}${patient.lastname?.[0] || ""}` : "?"}
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Patient</p>
                          <p className="text-[13px] font-medium text-gray-700">
                            {patient ? `${patient.firstname} ${patient.lastname}` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full bg-white border border-docuhealth-primary text-docuhealth-primary rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                    onClick={() => handleViewDetail(item)}
                  >
                    View full details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CarePlanHistory;
