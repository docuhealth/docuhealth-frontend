import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";

const RemoveBrandingModal = ({ onClose, type }) => {
  const queryClient = useQueryClient();

  const formattedType = type === "bg_image" ? "Cover Image" : type === "profile_image" ? "Profile Image" : type;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        fields : [
          type
        ]
      }
      return await axiosInstanceHos.post("/api/hospitals/remove-branding",payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["hospital-profile"]);
      toast.success(`${formattedType} removed successfully`);
      onClose();
    },
    onError: (error) => {
      console.error("Removal failed:", error);
      toast.error(error?.response?.data?.message || `Error removing ${formattedType}.`);
    },
  });

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-docuhealth-primary">
      <div className="bg-white w-full max-w-lg rounded-lg shadow overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center py-3 px-5 border-b border-gray-100">
            <h3 className="text-md font-medium">Remove {formattedType}</h3>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-gray-900">Are you sure?</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                This will reset your hospital's {formattedType.toLowerCase()} to the default.

              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1  gap-2 sm:grid-cols-2 gap-3 pt-4 text-sm">
              <button
              onClick={() => mutate()}
              disabled={isPending}
              className="flex-[1.5] py-3 bg-red-500 text-white rounded-full font-semibold flex items-center justify-center gap-2  active:scale-[0.98] disabled:bg-red-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg "
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Remove {formattedType}

                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border border-gray-200 rounded-full font-semibold text-gray-600  hover:border-gray-300 transition-all duration-200"
              disabled={isPending}
            >
              Cancel
            </button>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveBrandingModal;
