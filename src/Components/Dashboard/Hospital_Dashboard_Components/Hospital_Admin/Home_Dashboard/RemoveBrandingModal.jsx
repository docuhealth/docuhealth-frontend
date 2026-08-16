import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import Modal from "../../../../ui/Modal";
import Button from "../../../../ui/Button";

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
    <Modal isOpen={true} onClose={onClose} title={`Remove ${formattedType}`}>
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 text-sm">
        <Button
          variant="danger"
          onClick={() => mutate()}
          loading={isPending}
          loadingText="Resetting..."
        >
          <span className="flex items-center justify-center gap-2">
            <Trash2 size={18} />
            Remove {formattedType}
          </span>
        </Button>
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default RemoveBrandingModal;
