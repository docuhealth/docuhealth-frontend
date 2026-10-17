import React from "react";
import { Check, X } from "lucide-react";
import Modal from "../../../ui/Modal";

const ApprovalSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative flex flex-col items-center text-center py-4 px-1 sm:px-2">
        {/* Cancel / Close icon */}
        <button
          onClick={onClose}
          className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Success Icon Badge */}
        <div className="w-24 h-24 rounded-full bg-[#D1FAE5] flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center shadow-xs">
            <Check size={32} className="text-white" strokeWidth={3.5} />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-[#0F172A] mb-8 max-w-xs leading-snug">
          Test result has been approved successfully!
        </h3>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer shadow-sm"
        >
          Done
        </button>
      </div>
    </Modal>
  );
};

export default ApprovalSuccessModal;
