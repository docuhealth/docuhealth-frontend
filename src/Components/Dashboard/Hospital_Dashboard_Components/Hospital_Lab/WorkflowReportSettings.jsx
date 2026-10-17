import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, Pencil, Phone, Check, X, Building, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DynamicDate from "../../../DynamicDate/DynamicDate";
import Modal from "../../../ui/Modal";
import ReportStylePreviewModal from "./ReportStylePreviewModal";
import { fetchLabAdminProfile, updateLabProfile } from "../../../../queries/Hospital/lab/profile";
import { extractApiErrorMessage } from "../../../../utils/apiError";

const WorkflowReportSettings = ({ onBack }) => {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  const [contact1, setContact1] = useState("");
  const [contact2, setContact2] = useState("");

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ["lab-admin-profile"],
    queryFn: fetchLabAdminProfile,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.address) setAddress(profile.address);
      if (profile.logo?.url) setLogoPreview(profile.logo.url);
      if (Array.isArray(profile.contacts)) {
        if (profile.contacts[0]) setContact1(profile.contacts[0]);
        if (profile.contacts[1]) setContact2(profile.contacts[1]);
      }
    }
  }, [profile]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Logo must be an image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be under 2MB");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        toast.success("Facility logo selected");
      };
      reader.readAsDataURL(file);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (formData) => updateLabProfile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-admin-profile"] });
      queryClient.invalidateQueries({ queryKey: ["lab-dashboard"] });
      setShowSuccess(true);
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update laboratory profile."));
    },
  });

  const handleUpdateSettings = (e) => {
    e.preventDefault();

    const formData = new FormData();
    let fieldsCount = 0;

    if (name.trim() && name !== profile?.name) {
      formData.append("name", name.trim());
      fieldsCount++;
    }

    if (address.trim() && address !== profile?.address) {
      formData.append("address", address.trim());
      fieldsCount++;
    }

    const contactsArr = [contact1.trim(), contact2.trim()].filter(Boolean);
    if (contactsArr.length > 0) {
      // Must be sent as JSON string because form fields can only carry text: contacts=["08012345678"]
      formData.append("contacts", JSON.stringify(contactsArr));
      fieldsCount++;
    }

    if (logoFile) {
      formData.append("logo", logoFile);
      fieldsCount++;
    }

    if (fieldsCount === 0) {
      toast("No changes detected to update.");
      return;
    }

    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Row with DynamicDate and Action Buttons */}
      <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-0">
        <DynamicDate />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => toast.success("Coming Soon !")}
            className="py-2.5 px-6 sm:px-8 rounded-full text-docuhealth-primary border border-docuhealth-primary hover:bg-indigo-50 transition-colors cursor-pointer text-xs sm:text-sm font-medium w-full sm:w-auto text-center whitespace-nowrap"
          >
            Preview current report style
          </button>
        </div>
      </div>

      {/* Main Settings Card Container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs">
        {/* Back Navigation Bar */}
        <div className="pb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-800 hover:text-docuhealth-primary font-semibold text-sm sm:text-base transition-colors cursor-pointer group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Workflow and report settings</span>
          </button>
          {profile?.hospital_info?.name && (
            <div className="text-xs text-gray-500 bg-gray-50/80 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-100/90 inline-flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <span className="text-gray-400">Hospital:</span>
              <strong className="text-slate-700 font-semibold">{profile.hospital_info.name}</strong>
              {profile.hospital_info.hin && (
                <span className="text-gray-400 font-mono text-[11px]">({profile.hospital_info.hin})</span>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 text-sm">
            <div className="w-6 h-6 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin mb-3" />
            <span>Loading laboratory profile...</span>
          </div>
        ) : isError ? (
          <div className="py-14 text-center text-red-500 text-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p>{error?.response?.data?.detail || "No laboratory profile found or unauthorized."}</p>
          </div>
        ) : (
          <form onSubmit={handleUpdateSettings} className="pt-6 space-y-6">
            {/* Section 0: Laboratory Name */}
            <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-docuhealth-primary" />
                <h3 className="text-sm font-semibold text-docuhealth-primary">
                  Laboratory Name
                </h3>
              </div>
              <div className="p-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Central Diagnostics Laboratory"
                  className="w-full bg-gray-50/60 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-gray-400 outline-none focus:border-indigo-300 transition-colors"
                />
              </div>
            </div>

            {/* Section 1: Facility logo */}
            <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-docuhealth-primary">
                  Facility logo
                </h3>
              </div>

              <div className="p-6 flex flex-col items-center justify-center gap-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-40 h-40 rounded-full border-2 border-dashed border-docuhealth-primary flex items-center justify-center relative cursor-pointer group hover:bg-indigo-50/20 transition-colors overflow-hidden"
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
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-docuhealth-primary">
                      <Camera className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-[11px] font-medium mt-1">Upload logo</span>
                    </div>
                  )}

                  {/* Edit Pencil Badge */}
                  <div className="w-8 h-8 rounded-full bg-docuhealth-primary text-white flex items-center justify-center absolute bottom-1 right-2 shadow-md hover:bg-docuhealth-dark-primary transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">PNG, JPG, or WEBP under 2MB</p>
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
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pr-8 min-h-[40px]">
                      {address ? (
                        <>
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
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No address provided. Click the edit icon to add one.</span>
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
                  Add Contact Numbers
                </h3>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Contact 1 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Contact 1 (Primary)
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={contact1}
                      onChange={(e) => setContact1(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-gray-400 outline-none focus:border-indigo-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Contact 2 (optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Contact 2 (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={contact2}
                      onChange={(e) => setContact2(e.target.value)}
                      placeholder="e.g. 07099887766"
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
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto px-10 py-3 bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-sm font-semibold rounded-full shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving settings...</span>
                  </>
                ) : (
                  <span>Update settings</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        maxWidth="md"
        className="p-2"
      >
        <div className="relative">
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
              Laboratory Profile & Workflow Settings Updated Successfully!
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

      {/* Laboratory Report Style Preview Modal */}
      <ReportStylePreviewModal
        isOpen={showReportPreview}
        onClose={() => setShowReportPreview(false)}
        labName={name.trim() || profile?.name}
        labAddress={address.trim() || profile?.address}
        contacts={[contact1.trim(), contact2.trim()].filter(Boolean)}
        logo={logoPreview || profile?.logo?.url}
        patientName="Amiefa Obed"
        sex="Male"
        requestDate="27/02/2026"
        collectionDate="27/02/2026"
        requestingClinician="Dr. Paypal Moniepoint"
        labTechnician="Dr. Paypal Moniepoint"
      />
    </div>
  );
};

export default WorkflowReportSettings;
