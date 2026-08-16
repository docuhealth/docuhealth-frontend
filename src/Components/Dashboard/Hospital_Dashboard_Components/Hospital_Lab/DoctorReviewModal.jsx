import { X, Info, AlertTriangle } from "lucide-react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";

const DoctorReviewModal = ({ isOpen, onClose, onConfirm, isPending, type }) => {
  if (!isOpen) return null;

  const isApprove = type === "approve";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-4 ${isApprove ? 'border-docuhealth-dark' : 'border-red-500'}`}>
          {isApprove ? (
            <Info size={22} className="text-docuhealth-dark" />
          ) : (
            <AlertTriangle size={22} className="text-red-500" />
          )}
        </div>

        <h3 className="text-base font-semibold text-gray-800 mb-4">
          {isApprove ? "Approve/Accept test result?" : "Reject test result?"}
        </h3>

        <div className="border border-gray-200 rounded-md p-4 mb-6 w-full">
          <p className="text-[13px] text-gray-600 leading-relaxed text-left">
            {isApprove 
              ? "By Accepting this test result, you approve that you have checked and validated the result. by proceeding, you agree that the result be added to your SOAP note and patient's AVS!"
              : "By rejecting this test result, you indicate that the result is invalid or requires a re-test. This action cannot be undone."}
          </p>
        </div>

        <Button
          onClick={onConfirm}
          disabled={isPending}
          loading={isPending}
          loadingText={isApprove ? "Approving..." : "Rejecting..."}
          variant={isApprove ? "primary" : "danger"}
          fullWidth
        >
          {isApprove ? "Confirm approval" : "Confirm rejection"}
        </Button>
      </div>
    </Modal>
  );
};

export default DoctorReviewModal;
