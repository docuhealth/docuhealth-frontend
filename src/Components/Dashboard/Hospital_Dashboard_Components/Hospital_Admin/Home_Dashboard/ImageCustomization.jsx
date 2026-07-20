import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, CheckCircle, Loader2 } from "lucide-react";
import axiosInstanceHos from "../../../../../utils/axiosInstanceHos";
import toast from "react-hot-toast";

const ImageCustomization = ({ onClose }) => {
  const queryClient = useQueryClient();
  
  // State for actual files and preview URLs
  const [payload, setPayload] = useState({
    bg_image: null,
    profile_image: null,
  });
  const [previews, setPreviews] = useState({
    bg: null,
    profile: null,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData) => {
      return await axiosInstanceHos.patch("/api/auth/hospital-admin-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["hospital-profile"]);
      toast.success('Cover Image changed successfully')
      onClose();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
        toast.error('Error changing Cover Image.')
    }
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setPayload((prev) => ({ ...prev, [type]: file }));
      setPreviews((prev) => ({
        ...prev,
        [type === "bg_image" ? "bg" : "profile"]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    if (payload.bg_image) formData.append("bg_image", payload.bg_image);
    if (payload.profile_image) formData.append("profile_image", payload.profile_image);
    
    mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-md font-medium  text-docuhealth-primary">Display Customization</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Background Image Section */}
          <div className="">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Cover Photo</label>
            <div 
              className="w-full h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group mt-2"
            >
              {previews.bg ? (
                <img src={previews.bg} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Upload className="mx-auto mb-1" size={20} />
                  <p className="text-xs">Click to upload cover</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, "bg_image")} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Hospital Logo</label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                {previews.profile ? (
                  <img src={previews.profile} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={20} className="text-gray-400" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "profile_image")} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 italic">Recommended: Square PNG or JPG</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 gap-3 pt-4 text-sm">
             <button
              onClick={handleSubmit}
              disabled={isPending || (!payload.bg_image && !payload.profile_image)}
              className="flex-2 py-2.5 bg-docuhealth-primary text-white rounded-full font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all "
            >
              {isPending ? (
                <>
                <Loader2 className="animate-spin" size={20} />
                 Updating Profile
                </>
              ) : (
                <><CheckCircle size={18}/> Update Profile</>
              )}
            </button>
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
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

export default ImageCustomization;