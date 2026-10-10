import React from "react";
import { Info, X } from "lucide-react";
import Modal from "../../../ui/Modal";

const AcceptApprovalModal = ({ isOpen, onClose, onConfirm, isPending }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative flex flex-col items-center text-center py-2 px-1 sm:px-2">
        {/* Cancel / Close icon */}
        <button
          onClick={onClose}
          className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Info Icon with Dark Outline */}
        <div className="w-14 h-14 rounded-full border-2 border-[#1E293B] flex items-center justify-center mb-4">
          <Info size={28} className="text-[#1E293B]" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#0F172A] mb-4">
          Accept test result
        </h3>

        {/* Description Box */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-6 w-full text-left bg-white shadow-xs">
          <p className="text-sm text-gray-600 leading-relaxed">
            By proceeding you confirm that you have carefully reviewed this test result uploaded by a lab technician and you want it to be seen by every other concerned person.
          </p>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="w-full bg-docuhealth-primary hover:bg-docuhealth-primary-hover text-white py-3.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center disabled:opacity-60 cursor-pointer shadow-sm"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Approving...</span>
            </div>
          ) : (
            "Confirm approval"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default AcceptApprovalModal;
