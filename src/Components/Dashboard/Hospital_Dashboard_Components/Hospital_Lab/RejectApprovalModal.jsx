import React from "react";
import { X } from "lucide-react";
import Modal from "../../../ui/Modal";

const RejectApprovalModal = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  reason,
  onReasonChange,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative flex flex-col py-2 px-1 sm:px-2">
        {/* Cancel / Close icon */}
        <button
          onClick={onClose}
          className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h3 className="text-xl font-bold text-[#0F172A] mb-1 text-center">
          Reject uploaded result
        </h3>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Kindly provide a feedback for Decline
        </p>

        {/* Textarea Field */}
        <div className="w-full text-left">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Add note :
          </label>
          <textarea
            rows={4}
            placeholder="Please provide a feedback for Decline..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-gray-700 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary resize-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Reject Button */}
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending || !reason.trim()}
          className="w-full mt-6 bg-[#EF4444] hover:bg-red-600 text-white py-3.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Rejecting...</span>
            </div>
          ) : (
            "Reject result"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default RejectApprovalModal;
