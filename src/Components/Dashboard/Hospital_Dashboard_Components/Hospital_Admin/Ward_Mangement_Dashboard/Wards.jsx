import React, { useState, useContext } from "react";
import { ArrowRight, Bed, Users, Trash2, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { HosAppContext } from "../../../../../context/HospitalContext/Admin/HosAppContext";
import { HosWardContext } from "../../../../../context/HospitalContext/HosWardContext";
import { deleteWard } from "../../../../../queries/Hospital/fetchWards";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import ManageWardModal from "./ManageWardModal";

const Wards = () => {
  const { wards, count, currentPage, totalPages, setCurrentPage, loading } =
    useContext(HosWardContext);
  const [selectedWard, setSelectedWard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wardToDelete, setWardToDelete] = useState(null);

  const queryClient = useQueryClient();

  const deleteWardMutation = useMutation({
    mutationFn: (wardSqid) => deleteWard(wardSqid),
    onSuccess: () => {
      toast.success("Ward deleted successfully!");
      queryClient.invalidateQueries(["hospital-wards"]);
      setWardToDelete(null);
    },
    onError: (err) => {
      console.error("Error deleting ward:", err);
      toast.error(err.response?.data?.message || "Failed to delete ward");
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }

  if (wards.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
        <svg
          width="200"
          height="200"
          viewBox="0 0 366 366"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_1517_47151)">
            <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
          </g>
          <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
          <path
            d="M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z"
            fill="#929AA3"
          />
          <defs>
            <filter
              id="filter0_d_1517_47151"
              x="0"
              y="0"
              width="366"
              height="366"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="12" />
              <feGaussianBlur stdDeviation="12" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1517_47151"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1517_47151"
                result="shape"
              />
            </filter>
          </defs>
        </svg>

        <h2 className="font-medium pb-1">No Wards!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            You currently don’t have any wards in this hospital.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end items-center mb-6">
        <span className="bg-indigo-100 text-docuhealth-primary text-xs font-semibold px-3 py-1 rounded-full">
          Total: {count}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wards.map((ward) => {
          const totalBeds = ward.beds?.length || 0;
          const freeBeds = ward.available_beds;
          const occupiedCount = totalBeds - freeBeds;
          const percentage = totalBeds > 0 ? (occupiedCount / totalBeds) * 100 : 0;

          return (
            <div key={ward.sqid || ward.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
              {/* Card Top */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded border">
                      <Bed className="w-5 h-5 text-docuhealth-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{ward.name || "General Ward"}</h3>
                      <p className="text-xs text-gray-400">Ref ID: {ward.sqid || ward.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wide ${
                      freeBeds > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}>
                      {freeBeds > 0 ? "Active" : "Full"}
                    </span>
                    <button
                      type="button"
                      title="Delete Ward"
                      onClick={() => setWardToDelete(ward)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Available</p>
                    <p className="text-sm font-semibold text-gray-900">{freeBeds}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Total Capacity</p>
                    <p className="text-sm font-semibold text-gray-900">{totalBeds} Beds</p>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-semibold mb-1">
                    <span className="text-gray-400">OCCUPANCY</span>
                    <span className={percentage > 90 ? "text-red-500" : "text-gray-600"}>{Math.round(percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 90 ? "bg-red-500" : "bg-docuhealth-primary"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="w-full py-4 bg-white border-t border-gray-100 text-docuhealth-primary text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mt-auto cursor-pointer"
                onClick={() => { setSelectedWard(ward); setIsModalOpen(true); }}
              >
                MANAGE WARD <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      <Pagination2
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      <ManageWardModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedWard(null); }} 
        ward={selectedWard} 
      />

      {/* Delete Confirmation Modal */}
      {wardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Ward</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{wardToDelete.name || "this ward"}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWardToDelete(null)}
                className="flex-1 py-2 px-4 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteWardMutation.isPending}
                onClick={() => deleteWardMutation.mutate(wardToDelete.sqid || wardToDelete.id)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-full text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleteWardMutation.isPending ? "Deleting..." : "Delete Ward"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Wards;
