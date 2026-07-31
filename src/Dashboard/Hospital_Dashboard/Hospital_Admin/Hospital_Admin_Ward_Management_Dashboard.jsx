import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import Wards from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Ward_Mangement_Dashboard/Wards";
import { HosAppContext } from "../../../context/HospitalContext/Admin/HosAppContext";
import axiosInstanceHos from "../../../lib/axios/hospital";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Hospital_Admin_Ward_Management_Dashboard = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [formData, setFormData] = useState({ name: "", total_beds: "" });

  const queryClient = useQueryClient();

  const createWardMutation = useMutation({
    mutationFn: (createWardData) =>
      axiosInstanceHos.post("api/hospitals/wards", {
        name : createWardData.name,
        total_beds : createWardData.total_beds
      }),
    onSuccess: () => {
      toast.success("Ward created successfully!");
      queryClient.invalidateQueries(["hospital-wards"])
      setShowOverlay(false);
      setFormData({ name: "", total_beds: "" });

    },
    onError : (err) => {
         console.error("Error creating ward:", err);
      toast.error(err.response?.data?.message || "Failed to create ward");
    }
  });

  const handleCreateWard = async (e) => {
    e.preventDefault();

    createWardMutation.mutate({
      name: formData.name,
      total_beds: parseInt(formData.total_beds),
    });
  };



  return (
    <>
      <div className="py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm  gap-3 sm:gap-0">
        <DynamicDate />
        <div className="w-full sm:w-auto">
          <button
            className="flex justify-center items-center gap-2 px-8 py-2 border border-docuhealth-primary text-docuhealth-primary font-medium rounded-full hover:bg-blue-50 transition w-full sm:w-auto cursor-pointer"
            onClick={() => setShowOverlay(true)}
          >
            Create Ward
          </button>
        </div>
      </div>
      <div className="bg-white my-5 rounded-lg">
        <div className=" border rounded-lg p-4 lg:p-6">
          <h2 className=" mb-4 pb-2 border-b font-medium">Hospital Wards</h2>
          <div>
            <Wards />
          </div>
        </div>
      </div>
      {showOverlay && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-3 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="font-medium text-gray-900">Add New Ward</h3>
              <button
                onClick={() => setShowOverlay(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWard} className="p-6 space-y-5 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Ward Name
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emergency"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none  focus:border-docuhealth-primary transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {/* Visual suffix "Ward" for the user */}
                  <span className="absolute right-4 text-gray-400 text-sm font-medium pointer-events-none">
                    Ward
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Total Beds
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Enter number of beds"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none  focus:border-docuhealth-primary transition-all cursor-pointer"
                  value={formData.total_beds}
                  onChange={(e) =>
                    setFormData({ ...formData, total_beds: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOverlay(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600  rounded-full hover:bg-gray-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWardMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-docuhealth-primary text-white  rounded-full  disabled:opacity-50 transition-all text-sm shadow shadow-indigo-100 cursor-pointer"
                >
                  {createWardMutation.isPending ? "Creating..." : "Create Ward"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Hospital_Admin_Ward_Management_Dashboard;
