import React from "react";
import DischargeInvestigationPicker from "./DischargeInvestigationPicker";
import Input from "../../../../ui/Input";

const DischargeFollowUpStep = ({
  formData,
  onFieldChange,
  pendingInvestigationOptions,
  onTogglePendingInvestigation,
}) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-6 text-[15px]">
          Follow-up, Pending Results &amp; Referrals
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex flex-col gap-3 md:w-1/2">
              {!formData.will_continue_followup ? (
                <Input
                  label="Follow-up clinic selection"
                  value={formData.referral}
                  onChange={(e) => onFieldChange("referral", e.target.value)}
                  placeholder="Enter Referral Hospital HIN"
                />
              ) : (
                <Input
                  label="Follow-up clinic selection"
                  value={formData.follow_up_clinic}
                  onChange={(e) => onFieldChange("follow_up_clinic", e.target.value)}
                  placeholder="e.g. Medical Outpatient Clinic"
                />
              )}
              <label className="flex items-center gap-2 text-[12px] text-gray-600 font-medium cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={formData.will_continue_followup}
                  onChange={(e) => onFieldChange("will_continue_followup", e.target.checked)}
                  className="w-4 h-4 text-docuhealth-primary rounded border-gray-300 focus:ring-docuhealth-primary cursor-pointer accent-blue-700"
                />
                Patient will continue here
              </label>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold pb-1">Follow-up date/time</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-1/2">
              <Input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => onFieldChange("follow_up_date", e.target.value)}
              />
              <Input
                type="time"
                value={formData.follow_up_time}
                onChange={(e) => onFieldChange("follow_up_time", e.target.value)}
              />
            </div>
          </div>

          <DischargeInvestigationPicker
            label="Pending results/investigations"
            placeholder="Select pending investigations/results (patient will receive these once available)"
            options={pendingInvestigationOptions}
            selected={formData.pending_investigations}
            onToggle={onTogglePendingInvestigation}
          />

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              Follow-up instruction(s)
            </label>
            <textarea
              value={formData.follow_up_instructions}
              onChange={(e) => onFieldChange("follow_up_instructions", e.target.value)}
              placeholder="Enter follow up instructions..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-[13px] text-gray-700 focus:outline-none focus:border-docuhealth-primary resize-y"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DischargeFollowUpStep;
