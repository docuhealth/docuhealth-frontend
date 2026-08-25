import React from "react";
import { X } from "lucide-react";
import Modal from "../../../../ui/Modal";

// Shared "are you sure?" confirmation shown before a discharge is finalized —
// used by both the outpatient and inpatient discharge flows.
const ConfirmDischargeModal = ({ isOpen, onConfirm, onCancel, isPending }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="md" className="!p-1 text-center">
      <div className="flex justify-end mb-2">
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1">
          <X size={18} />
        </button>
      </div>
      <div className="flex justify-center mb-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20.0026 36.6654C10.7979 36.6654 3.33594 29.2034 3.33594 19.9987C3.33594 10.7939 10.7979 3.33203 20.0026 3.33203C29.2073 3.33203 36.6693 10.7939 36.6693 19.9987C36.6693 29.2034 29.2073 36.6654 20.0026 36.6654ZM20.0026 33.332C27.3664 33.332 33.3359 27.3625 33.3359 19.9987C33.3359 12.6349 27.3664 6.66536 20.0026 6.66536C12.6388 6.66536 6.66927 12.6349 6.66927 19.9987C6.66927 27.3625 12.6388 33.332 20.0026 33.332ZM21.6693 17.4987V24.9987H23.3359V28.332H16.6693V24.9987H18.3359V20.832H16.6693V17.4987H21.6693ZM22.5026 13.332C22.5026 14.7127 21.3833 15.832 20.0026 15.832C18.6219 15.832 17.5026 14.7127 17.5026 13.332C17.5026 11.9513 18.6219 10.832 20.0026 10.832C21.3833 10.832 22.5026 11.9513 22.5026 13.332Z"
            fill="var(--color-docuhealth-dark)"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-docuhealth-dark mb-4">Discharge patient</h2>
      <p className="text-gray-600 text-sm mb-8 px-4">
        Are you sure this patient is clear for discharge? By proceeding you agree that you have carried out every necessary test and you are certain that the patient is good to go!
      </p>
      <button
        onClick={onConfirm}
        disabled={isPending}
        className={`w-full py-3 rounded-full text-white font-medium flex justify-center items-center gap-2 ${
          isPending ? "bg-docuhealth-primary/70 cursor-not-allowed" : "bg-docuhealth-primary hover:bg-docuhealth-primary/90"
        }`}
      >
        {isPending ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Confirming...
          </>
        ) : (
          "Confirm discharge"
        )}
      </button>
    </Modal>
  );
};

export default ConfirmDischargeModal;
