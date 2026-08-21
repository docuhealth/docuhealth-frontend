import React, { useState } from "react";
import { ArrowLeft, X, Plus, Info, Check } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MedicationSection from "../Appointments_Dashboard/components/MedicationSection";
import Modal from "../../../../ui/Modal";

// Sub-component for Confirm Discharge Modal
const ConfirmDischargeModal = ({ isOpen, onConfirm, onCancel, isPending }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="md" className="!p-1 text-center">
      <div className="flex justify-end mb-2">
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1">
          <X size={18} />
        </button>
      </div>
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-docuhealth-primary text-docuhealth-primary flex items-center justify-center">
          <Info size={24} />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-docuhealth-dark mb-4">Discharge patient</h2>
      <p className="text-gray-600 text-sm mb-8 px-4">
        Are you sure this patient is clear for discharge? By proceeding you agree that you have carried out every necessary test and you are certain that the patient is good to go!
      </p>
      <button
        onClick={onConfirm}
        disabled={isPending}
        className={`w-full py-3 rounded-full text-white font-medium flex justify-center items-center gap-2 ${
          isPending ? "bg-docuhealth-primary/70 cursor-not-allowed" : "bg-docuhealth-primary hover:bg-docuhealth-primary/90"
        }`}
      >
        {isPending ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Confirming...
          </>
        ) : (
          "Confirm discharge"
        )}
      </button>
    </Modal>
  );
};

// Sub-component for Success Modal
const SuccessModal = ({ isOpen, onDone }) => {
  return (
    <Modal isOpen={isOpen} onClose={onDone} maxWidth="sm" className="!rounded-3xl !p-3 text-center">
      <div className="flex justify-center mb-6 mt-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
            <Check size={32} strokeWidth={3} />
          </div>
        </div>
      </div>
      <p className="text-docuhealth-dark font-medium mb-8 px-4 leading-relaxed">
        You have successfully discharged<br />this patient from the hospital!
      </p>
      <button
        onClick={onDone}
        className="w-full py-3.5 bg-green-500 hover:bg-green-600 rounded-full text-white font-medium"
      >
        Done
      </button>
    </Modal>
  );
};

const OutpatientDischargeSummary = ({ selectedPatient, onClose }) => {
  const queryClient = useQueryClient();
  const sqid = selectedPatient?.sqid; // Check-in SQID

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
    condition_at_checkout: "",
    follow_up_instructions: "",
    will_continue_followup: true,
    referral: "",
  });

  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");

  const [medications, setMedications] = useState([]);

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Medication state changes are handled internally by MedicationSection

  const dischargeMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstanceHos.post(`api/doctors/check-ins/${sqid}/discharge`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
      queryClient.invalidateQueries({ queryKey: ["hospital-outpatients-doctor"] });
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    },
    onError: (err) => {
      setShowConfirmModal(false);
      console.error("Error discharging patient", err);
      toast.error(err.response?.data?.check_in || err.response?.data?.message || "Error discharging patient");
    }
  });

  const handleValidateAndShowConfirm = () => {
    if (
      !formData.chief_complaint.trim() ||
      !formData.diagnosis.trim() ||
      !formData.treatment_plan.trim() ||
      !formData.condition_at_checkout.trim()
    ) {
      toast.error("Please fill all compulsory fields: Chief Complaint, Diagnosis, Treatment Plan, and Condition.");
      return;
    }

    // Filter out completely empty medication rows
    const activeMeds = medications.filter(m => m.drug && m.drug.trim() !== "");
    const hasIncompleteMedication = activeMeds.some(
      (med) => (!med.dosage || !med.duration || !med.frequency)
    );

    if (hasIncompleteMedication) {
      toast.error("Please fill in Dosage, Frequency, and Duration for all entered medications.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleSubmit = () => {
    const activeMeds = medications.filter(m => m.drug && m.drug.trim() !== "");
    const drug_records_data = activeMeds.map((med) => ({
      name: med.drug,
      route: med.route,
      quantity: Number(med.dosage) || 1,
      unit: med.dosageUnit || "tablets",
      frequency: {
        value: 1, // Fallback since MedicationSection only provides the rate
        rate: med.frequency,
      },
      duration: {
        value: Number(med.duration) || 1,
        rate: med.durationUnit?.toLowerCase() || "days",
      },
      allergies: [],
    }));

    const payload = {
      chief_complaint: formData.chief_complaint,
      diagnosis: formData.diagnosis,
      treatment_plan: formData.treatment_plan,
      condition_at_checkout: formData.condition_at_checkout,
      will_continue_followup: formData.will_continue_followup,
      follow_up_instructions: formData.follow_up_instructions,
      pending_investigations: [], // Optional
    };

    if (drug_records_data.length > 0) {
      payload.drug_records_data = drug_records_data;
    }

    if (!formData.will_continue_followup && formData.referral.trim()) {
      payload.referral = formData.referral;
    }

    if (followUpDate && followUpTime) {
      const scheduledTime = new Date(`${followUpDate}T${followUpTime}`).toISOString();
      payload.follow_up_appointment = {
        type: "follow_up",
        note: formData.follow_up_instructions || "Follow up", // Optional note
        scheduled_time: scheduledTime,
      };
    }

    dischargeMutation.mutate(payload);
  };

  return (
    <>
      <div className="w-full pb-10">
        
        {/* Header */}
        <div className="py-4 mb-2">
          <div className="flex items-center gap-2 cursor-pointer w-fit" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 text-docuhealth-primary" />
            <span className="font-medium text-docuhealth-primary">Discharge summary</span>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="space-y-6">
          
          {/* Chief Complaint */}
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="font-semibold text-gray-700 mb-3">Chief complaint (compulsory)</p>
            <textarea
              name="chief_complaint"
              value={formData.chief_complaint}
              onChange={handleTextChange}
              className="w-full rounded-md focus:outline-none focus:ring-0 p-0 text-sm text-gray-600 resize-none h-24 border-none"
              placeholder="Enter chief complaint..."
            ></textarea>
          </div>

          {/* Diagnosis */}
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="font-semibold text-gray-700 mb-3">Diagnosis (compulsory)</p>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleTextChange}
              className="w-full rounded-md focus:outline-none focus:ring-0 p-0 text-sm text-gray-600 resize-none h-24 border-none"
              placeholder="Enter investigation/Diagnosis (separate with a comma)..."
            ></textarea>
          </div>

          {/* Treatment Plan */}
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="font-semibold text-gray-700 mb-3">Treatment plan (compulsory)</p>
            <textarea
              name="treatment_plan"
              value={formData.treatment_plan}
              onChange={handleTextChange}
              className="w-full rounded-md focus:outline-none focus:ring-0 p-0 text-sm text-gray-600 resize-none h-24 border-none"
              placeholder="Enter treatment plan (separate with a comma)..."
            ></textarea>
          </div>

          {/* Medications at Discharge */}
          <MedicationSection 
            medications={medications}
            setMedications={setMedications}
          />

          {/* Condition at discharge */}
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="font-semibold text-gray-700 mb-3">Condition at discharge (compulsory)</p>
            <textarea
              name="condition_at_checkout"
              value={formData.condition_at_checkout}
              onChange={handleTextChange}
              className="w-full rounded-md focus:outline-none focus:ring-0 p-0 text-sm text-gray-600 resize-none h-24 border-none"
              placeholder="Enter the patient's condition at discharge..."
            ></textarea>
          </div>

          {/* Follow-up Section */}
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="font-semibold text-docuhealth-primary mb-6">Follow-up, Pending Results & Referrals</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Follow-up clinic selection</label>
                <div className="flex flex-col gap-3">
                  {!formData.will_continue_followup ? (
                    <input 
                      type="text"
                      name="referral"
                      value={formData.referral}
                      onChange={handleTextChange}
                      placeholder="Enter Referral Hospital HIN"
                      className="w-full md:w-1/2 border border-gray-200 rounded-lg p-3 text-sm focus:border-docuhealth-primary outline-none"
                    />
                  ) : (
                    <div className="relative w-full md:w-1/2">
                      <select className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-400 bg-gray-50 outline-none appearance-none" disabled>
                        <option>Medical Outpatient Clinic</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-xs text-gray-600 font-medium cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      name="will_continue_followup"
                      checked={formData.will_continue_followup}
                      onChange={handleTextChange}
                      className="w-4 h-4 text-docuhealth-primary rounded border-gray-300 focus:ring-docuhealth-primary cursor-pointer accent-blue-700"
                    />
                    Patient will continue here
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Follow-up date/time</label>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-1/2">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-docuhealth-primary outline-none text-gray-600"
                    />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="time"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-docuhealth-primary outline-none text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Pending results/investigations</label>
                <div className="relative">
                  <select className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-500 bg-white outline-none appearance-none">
                    <option>Select pending investigations/results (Patient's will receive these results once available)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Follow-up instruction(s)</label>
                <div className="border border-gray-200 rounded-lg p-4 relative bg-white">
                   <textarea
                    name="follow_up_instructions"
                    value={formData.follow_up_instructions}
                    onChange={handleTextChange}
                    className="w-full focus:outline-none focus:ring-0 p-0 text-sm text-gray-600 resize-none h-20 border-none"
                    placeholder="Enter follow up instructions..."
                  ></textarea>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end mt-8 border-t pt-4">
            <button
              onClick={handleValidateAndShowConfirm}
              className="bg-docuhealth-primary hover:bg-docuhealth-primary/90 text-white font-medium py-3 px-10 rounded-full transition-colors"
            >
              Upload/proceed
            </button>
          </div>

        </div>
      </div>

      <ConfirmDischargeModal
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleSubmit}
        isPending={dischargeMutation.isPending}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onDone={() => {
          setShowSuccessModal(false);
          onClose(); 
        }}
      />
    </>
  );
};

export default OutpatientDischargeSummary;
