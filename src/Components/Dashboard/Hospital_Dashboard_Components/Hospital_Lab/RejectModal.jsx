import { X } from "lucide-react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";

const RejectModal = ({ isOpen, onClose, onConfirm, isPending, value, onChange }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Request">
      <div className="flex flex-col gap-4 py-2">
        <p className="text-xs text-gray-500">
          Please provide a reason for rejecting this lab request. This will be visible to the requesting doctor.
        </p>

        <textarea
          rows={4}
          placeholder="Enter reason for rejection..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400 resize-none transition-colors"
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <Button onClick={onClose} variant="outline" fullWidth>
              Cancel
            </Button>
          </div>
          <div className="flex-1">
            <Button
              onClick={onConfirm}
              disabled={isPending || !value.trim()}
              loading={isPending}
              loadingText="Rejecting..."
              variant="danger"
              fullWidth
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RejectModal;
