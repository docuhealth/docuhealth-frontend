import Modal from "./Modal";

// Confirm step before closing an appointment (POST /api/appointments/{sqid}/close), which cannot be undone.
const CloseAppointmentModal = ({ isOpen, onClose, onConfirm, isPending, firstname, title = "Mark appointment as done?", confirmLabel = "Mark as done" }) => (
  <Modal isOpen={isOpen} onClose={() => !isPending && onClose()}>
    <div className="text-sm">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1">
        This closes {firstname ? `${firstname}'s` : "the"} appointment and records that the patient was seen. It cannot be undone.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 border border-gray-300 text-gray-700 rounded-full py-2.5 cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 bg-docuhealth-primary text-white rounded-full py-2.5 cursor-pointer disabled:opacity-60"
        >
          {isPending ? "Closing..." : confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default CloseAppointmentModal;
