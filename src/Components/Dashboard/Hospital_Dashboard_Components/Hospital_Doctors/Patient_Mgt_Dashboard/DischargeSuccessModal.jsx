import React from "react";
import { Check } from "lucide-react";
import Modal from "../../../../ui/Modal";

// Shared "done" confirmation shown after a discharge is finalized — used by
// both the outpatient and inpatient discharge flows.
const DischargeSuccessModal = ({
  isOpen,
  onDone,
  message = (
    <>
      You have successfully discharged
      <br />
      this patient from the hospital!
    </>
  ),
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onDone} maxWidth="sm" className="!rounded-3xl !p-3 text-center">
      <div className="flex justify-center mb-6 mt-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
            <Check size={32} strokeWidth={3} />
          </div>
        </div>
      </div>
      <p className="text-docuhealth-dark font-medium mb-8 px-4 leading-relaxed">{message}</p>
      <button
        onClick={onDone}
        className="w-full py-3.5 bg-green-500 hover:bg-green-600 rounded-full text-white font-medium"
      >
        Done
      </button>
    </Modal>
  );
};

export default DischargeSuccessModal;
