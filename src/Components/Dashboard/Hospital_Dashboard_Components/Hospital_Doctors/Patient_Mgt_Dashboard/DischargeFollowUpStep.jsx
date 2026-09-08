import React from "react";
import DischargeInvestigationPicker from "./DischargeInvestigationPicker";
import Input from "../../../../ui/Input";
import TimeInput from "../../../../ui/TimeInput";

// Follow-up plan options. The endpoint models follow-up as a single boolean
// (`continue_followup_at_curr_hospital`) plus an optional external
// `follow_up_clinic`, and the two are mutually exclusive — so the three real
// choices a doctor has are surfaced as one radio group here and mapped back to
// the payload in InpatientDischargeSummary.buildFollowUpPayload.
const FOLLOW_UP_PLANS = [
  {
    value: "this_hospital",
    title: "Follow-up at this hospital",
    hint: "The patient returns here for review.",
  },
  {
    value: "external",
    title: "Follow-up at another clinic",
    hint: "Refer the patient elsewhere for review.",
  },
  {
    value: "none",
    title: "No follow-up needed",
    hint: "Discharge with no scheduled review.",
  },
];

const DischargeFollowUpStep = ({
  formData,
  onFieldChange,
  hospitalName,
  pendingInvestigationOptions,
  onTogglePendingInvestigation,
}) => {
  const plan = formData.follow_up_plan;
  const showSchedule = plan !== "none";

  return (
    <div className="animate-in fade-in duration-300">
      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-6 text-[15px]">
          Follow-up, Pending Results &amp; Referrals
        </h3>

        <div className="space-y-6">
          <div>
            <p className="text-[13px] font-semibold pb-2">
              Follow-up plan<span className="text-red-500"> *</span>
            </p>
            <div className="flex flex-col gap-2">
              {FOLLOW_UP_PLANS.map((option) => {
                const active = plan === option.value;
                const title =
                  option.value === "this_hospital" && hospitalName
                    ? `Follow-up at ${hospitalName}`
                    : option.title;
                return (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      active
                        ? "border-docuhealth-primary bg-docuhealth-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="follow_up_plan"
                      value={option.value}
                      checked={active}
                      onChange={() => onFieldChange("follow_up_plan", option.value)}
                      className="mt-0.5 w-4 h-4 accent-blue-700 cursor-pointer"
                    />
                    <span>
                      <span className="block text-[13px] font-medium text-gray-800">
                        {title}
                      </span>
                      <span className="block text-[12px] text-gray-500">
                        {option.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {plan === "external" && (
            <div className="md:w-1/2">
              <Input
                label="Follow-up clinic"
                required
                value={formData.follow_up_clinic}
                onChange={(e) =>
                  onFieldChange("follow_up_clinic", e.target.value)
                }
                placeholder="e.g. Medical Outpatient Clinic"
              />
            </div>
          )}

          {showSchedule && (
            <div>
              <p className="text-[13px] font-semibold pb-1">
                Follow-up date/time<span className="text-red-500"> *</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-1/2">
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) =>
                    onFieldChange("follow_up_date", e.target.value)
                  }
                />
                <TimeInput
                  value={formData.follow_up_time}
                  onChange={(e) =>
                    onFieldChange("follow_up_time", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          <DischargeInvestigationPicker
            label="Pending results/investigations"
            placeholder="Select pending investigations/results (patient will receive these once available)"
            options={pendingInvestigationOptions}
            selected={formData.pending_investigations}
            onToggle={onTogglePendingInvestigation}
          />

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">
              Care instructions (for the patient)
              <span className="text-red-500"> *</span>
            </label>
            <textarea
              value={formData.care_instructions}
              onChange={(e) =>
                onFieldChange("care_instructions", e.target.value)
              }
              placeholder="Home care, wound care, activity, diet, warning signs — one item per line..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-[13px] text-gray-700 focus:outline-none focus:border-docuhealth-primary resize-y"
            ></textarea>
          </div>

          {showSchedule && (
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                Follow-up instruction(s)
              </label>
              <textarea
                value={formData.follow_up_instructions}
                onChange={(e) =>
                  onFieldChange("follow_up_instructions", e.target.value)
                }
                placeholder="Enter follow up instructions..."
                rows={4}
                className="w-full border border-gray-200 rounded-lg p-3 text-[13px] text-gray-700 focus:outline-none focus:border-docuhealth-primary resize-y"
              ></textarea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DischargeFollowUpStep;
