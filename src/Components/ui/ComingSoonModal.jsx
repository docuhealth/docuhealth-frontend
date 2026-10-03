import { Clock } from "lucide-react";
import Modal from "./Modal";

const ComingSoonModal = ({ isOpen, onClose, feature }) => (
  <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
    <div className="flex flex-col items-center text-center py-4">
      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Clock size={28} className="text-docuhealth-primary" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Coming soon</h3>
      <p className="mt-2 text-sm text-gray-500">
        {feature ? `${feature} is` : "This feature is"} not available yet. We're working on it.
      </p>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-docuhealth-primary text-white text-sm font-medium py-2.5 rounded-lg hover:bg-docuhealth-dark-primary"
      >
        Got it
      </button>
    </div>
  </Modal>
);

export default ComingSoonModal;
