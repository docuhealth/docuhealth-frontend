import { X, Info } from "lucide-react";

const ConfirmUploadModal = ({ isOpen, onClose, onConfirm, isPending }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-6 relative flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
          <Info size={22} className="text-gray-800" />
        </div>

        <h3 className="text-base font-semibold text-gray-800 mb-3">Confirm Upload</h3>

        <p className="text-sm text-gray-500 leading-relaxed mb-6 text-justify">
          By proceeding you confirm that you have carried out the requested test and you are certain of the results/finding. Once uploaded, result will be shared to both doctor and patient!
        </p>

        <button
          onClick={onConfirm}
          disabled={isPending}
          className="w-full bg-[#3E4095] text-white text-sm font-semibold py-3 rounded-full hover:bg-[#2e3070] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
          ) : "Confirm upload"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmUploadModal;
