import { Check } from "lucide-react";
import Modal from "../../../../../ui/Modal";
import Button from "../../../../../ui/Button";

const AppointmentSuccessModal = ({ onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="" maxWidth="sm">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-20 h-20 rounded-full bg-docuhealth-light-green flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-docuhealth-green flex items-center justify-center">
            <Check size={28} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <p className="text-base font-medium text-gray-800 mb-6 leading-snug">
          You have successfully booked a
          <br />
          consultation for a patient
        </p>

        <Button variant="success" fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
};

export default AppointmentSuccessModal;
