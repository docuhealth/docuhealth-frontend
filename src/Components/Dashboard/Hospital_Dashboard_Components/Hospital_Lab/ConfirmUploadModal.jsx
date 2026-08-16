import { X, Info } from "lucide-react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";

const ConfirmUploadModal = ({ isOpen, onClose, onConfirm, isPending }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
          <Info size={22} className="text-gray-800" />
        </div>

        <h3 className="text-base font-semibold text-gray-800 mb-3">Confirm Upload</h3>

        <p className="text-sm text-gray-500 leading-relaxed mb-6 text-justify">
          By proceeding you confirm that you have carried out the requested test and you are certain of the results/finding. Once uploaded, result will be shared to both doctor and patient!
        </p>

        <Button
          onClick={onConfirm}
          disabled={isPending}
          loading={isPending}
          loadingText="Uploading..."
          fullWidth
        >
          Confirm upload
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmUploadModal;
