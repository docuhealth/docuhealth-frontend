import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MedicationSection from "../Appointments_Dashboard/components/MedicationSection";
import Input from "../../../../ui/Input";
import Select from "../../../../ui/Select";
import ConfirmDischargeModal from "./ConfirmDischargeModal";
import DischargeSuccessModal from "./DischargeSuccessModal";

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
          <button type="button" className="flex items-center gap-2 cursor-pointer w-fit" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 text-docuhealth-primary" />
            <span className="font-medium text-docuhealth-primary">Discharge summary</span>
          </button>
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
                    <Input
                      name="referral"
                      value={formData.referral}
                      onChange={handleTextChange}
                      placeholder="Enter Referral Hospital HIN"
                      containerClassName="w-full md:w-1/2"
                    />
                  ) : (
                    <Select
                      value="Medical Outpatient Clinic"
                      onChange={() => {}}
                      options={[{ value: "Medical Outpatient Clinic", label: "Medical Outpatient Clinic" }]}
                      disabled
                      className="w-full md:w-1/2"
                    />
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
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    containerClassName="flex-1"
                  />
                  <Input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    containerClassName="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Pending results/investigations</label>
                <Select
                  value=""
                  onChange={() => {}}
                  options={[]}
                  placeholder="Select pending investigations/results (Patient's will receive these results once available)"
                />
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

      <DischargeSuccessModal
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
