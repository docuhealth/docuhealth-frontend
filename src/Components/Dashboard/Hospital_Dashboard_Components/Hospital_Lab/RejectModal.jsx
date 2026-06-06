import { X } from "lucide-react";

const RejectModal = ({ isOpen, onClose, onConfirm, isPending, value, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-6 relative flex flex-col gap-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>

        <h3 className="text-base font-semibold text-gray-800">Reject Request</h3>
        <p className="text-xs text-gray-500">
          Please provide a reason for rejecting this lab request. This will be visible to the requesting doctor.
        </p>

        <textarea
          rows={4}
          placeholder="Enter reason for rejection..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-red-400 resize-none transition-colors"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-full hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending || !value.trim()}
            className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {isPending ? (
              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Rejecting...</>
            ) : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
