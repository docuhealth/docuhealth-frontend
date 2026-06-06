import { Check } from "lucide-react";

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-6 sm:p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
            <Check size={28} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
          You have successfully uploaded a<br />completed test result!
        </p>

        <button
          onClick={onClose}
          className="w-full bg-green-700 text-white text-sm font-semibold py-3 rounded-full hover:bg-green-800 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
