import React, { useState, useRef } from "react";
import { ArrowLeft, Camera, Pencil, Phone, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import DynamicDate from "../../../DynamicDate/DynamicDate";
import Modal from "../../../ui/Modal";

const WorkflowReportSettings = ({ onBack }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [address, setAddress] = useState(
    "Admission: Admitted for a 3-day stay due to Community-Acquired Pneumonia and acute hypoxic respiratory failure. Treatment & Clinical Progress: Patient received IV ceftriaxone and azithromycin. He required 2L of supplemental oxygen on admission but was A follow-up ..."
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  const [contact1, setContact1] = useState("");
  const [contact2, setContact2] = useState("");

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        toast.success("Facility logo selected");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    setShowSuccess(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Row with DynamicDate and Action Buttons */}
      <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-0">
        <DynamicDate />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <button
            onClick={() => toast.success("Previewing current report style")}
            className="py-2.5 px-6 sm:px-8 rounded-full text-docuhealth-primary border border-docuhealth-primary hover:bg-indigo-50 transition-colors cursor-pointer text-xs sm:text-sm font-medium w-full sm:w-auto text-center whitespace-nowrap"
          >
            Preview current report style
          </button>

          <button
            onClick={() => toast.success("Add new report style")}
            className="py-2.5 px-6 sm:px-8 rounded-full bg-indigo-100/90 text-docuhealth-primary hover:bg-indigo-200 transition-colors cursor-pointer text-xs sm:text-sm font-medium w-full sm:w-auto text-center whitespace-nowrap"
          >
            Add new report style
          </button>
        </div>
      </div>

      {/* Main Settings Card Container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs">
        {/* Back Navigation Bar */}
        <div className="pb-5 border-b border-gray-100 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-800 hover:text-docuhealth-primary font-semibold text-sm sm:text-base transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Workflow and report settings</span>
          </button>
        </div>

        <form onSubmit={handleUpdateSettings} className="pt-6 space-y-6">
          {/* Section 1: Facility logo */}
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-docuhealth-primary">
                Facility logo
              </h3>
            </div>

            <div className="p-6 flex justify-center items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full border-2 border-dashed border-docuhealth-primary flex items-center justify-center relative cursor-pointer group hover:bg-indigo-50/20 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Facility Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-docuhealth-primary">
                    <svg
                      width="54"
                      height="54"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-docuhealth-primary"
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                )}

                {/* Edit Pencil Badge */}
                <div className="w-8 h-8 rounded-full bg-docuhealth-primary text-white flex items-center justify-center absolute bottom-1 right-2 shadow-md hover:bg-docuhealth-dark-primary transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Add Facility Address */}
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-docuhealth-primary">
                Add Facility Address
              </h3>
            </div>

            <div className="p-6">
              <div className="bg-gray-50/60 border border-gray-200 rounded-xl p-4 relative">
                {/* Edit Pencil icon */}
                <button
                  type="button"
                  onClick={() => setIsEditingAddress((prev) => !prev)}
                  className="absolute top-3 right-3 p-1.5 text-docuhealth-primary hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit address"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {isEditingAddress ? (
                  <textarea
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs sm:text-sm text-slate-800 outline-none resize-none focus:border-indigo-300 pr-8"
                    placeholder="Enter facility address..."
                    autoFocus
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pr-8">
                    {showFullAddress ? address : address.slice(0, 180)}
                    {address.length > 180 && (
                      <button
                        type="button"
                        onClick={() => setShowFullAddress(!showFullAddress)}
                        className="text-docuhealth-primary font-medium ml-1.5 hover:underline cursor-pointer"
                      >
                        {showFullAddress ? "See less" : "... See more"}
                      </button>
                    )}
                  </p>
                )}

                <div className="text-right mt-2 text-[11px] text-gray-400 font-medium">
                  {address.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Add contact */}
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-docuhealth-primary">
                Add contact
              </h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Contact 1 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Contact 1
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={contact1}
                    onChange={(e) => setContact1(e.target.value)}
                    placeholder="Type contact here"
                    className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-gray-400 outline-none focus:border-indigo-300 transition-colors"
                  />
                </div>
              </div>

              {/* Contact 2 (optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Contact 2 (optional)
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={contact2}
                    onChange={(e) => setContact2(e.target.value)}
                    placeholder="Type contact here"
                    className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-gray-400 outline-none focus:border-indigo-300 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-3 bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-sm font-semibold rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
            >
              Update settings
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        maxWidth="md"
        className="p-2"
      >
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={() => setShowSuccess(false)}
            className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-700 transition-colors z-20 cursor-pointer p-1 rounded-full hover:bg-gray-100"
          >
            <X size={22} />
          </button>

          <div className="flex flex-col items-center text-center py-6 px-4">
            <div className="w-24 h-24 rounded-full bg-green-100/80 flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center shadow-md">
                <Check className="w-9 h-9 text-white stroke-[3]" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-8 max-w-xs leading-relaxed">
              You have successfully updated your Test Result Report Style
            </h3>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-[#22C55E] hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition-colors cursor-pointer shadow-sm text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkflowReportSettings;
