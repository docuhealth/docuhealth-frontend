import { Check } from "lucide-react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
            <Check size={28} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
          You have successfully uploaded a<br />completed test result!
        </p>

        <Button
          onClick={onClose}
          fullWidth
        >
          Done
        </Button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
