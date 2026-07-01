import { X, Info, AlertTriangle } from "lucide-react";

const DoctorReviewModal = ({ isOpen, onClose, onConfirm, isPending, type }) => {
  if (!isOpen) return null;

  const isApprove = type === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto p-6 relative flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full p-1"
        >
          <X size={16} />
        </button>

        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-4 ${isApprove ? 'border-[#1B2B40]' : 'border-red-500'}`}>
          {isApprove ? (
            <Info size={22} className="text-[#1B2B40]" />
          ) : (
            <AlertTriangle size={22} className="text-red-500" />
          )}
        </div>

        <h3 className="text-base font-semibold text-gray-800 mb-4">
          {isApprove ? "Approve/Accept test result?" : "Reject test result?"}
        </h3>

        <div className="border border-gray-200 rounded-md p-4 mb-6  w-full">
          <p className="text-[13px] text-gray-600 leading-relaxed text-left">
            {isApprove 
              ? "By Accepting this test result, you approve that you have checked and validated the result. by proceeding, you agree that the result be added to your SOAP note and patient's AVS!"
              : "By rejecting this test result, you indicate that the result is invalid or requires a re-test. This action cannot be undone."}
          </p>
        </div>

        <button
          onClick={onConfirm}
          disabled={isPending}
          className={`w-full text-white text-sm font-semibold py-3 rounded-full transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${
            isApprove ? "bg-[#3E4095] hover:bg-[#2e3070]" : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {isPending ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {isApprove ? "Approving..." : "Rejecting..."}</>
          ) : (
            isApprove ? "Confirm approval" : "Confirm rejection"
          )}
        </button>
      </div>
    </div>
  );
};

export default DoctorReviewModal;
