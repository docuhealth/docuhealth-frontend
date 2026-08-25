import React, { useState } from "react";
import { ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../../../ui/Input";
import Select from "../../../../../ui/Select";

export const DEFAULT_FREQUENCY_OPTIONS = [
  "Q1H (Every hour)",
  "Q2H (Every 2 hours)",
  "Q4H (Every 4 hours)",
  "Q6H (Every 6 hours)",
  "Q8H (Every 8 hours)",
  "Q12H (Every 12 hours)",
  "Once per shift",
];

export const DEFAULT_DURATION_OPTIONS = [
  "8 hours",
  "12 hours",
  "24 hours",
  "48 hours",
  "72 hours",
  "Until discontinued",
];

export const DEFAULT_PRIORITY_OPTIONS = [
  "Low priority task",
  "Medium priority task",
  "High priority task",
];

const DEFAULT_FREQUENCY = "Q6H (Every 6 hours)";
const DEFAULT_DURATION = "24 hours";
const DEFAULT_PRIORITY = "High priority task";
const DEFAULT_START_TIME = "11:00";

export const FIELD_LABEL_CLASS = "block text-sm font-medium text-docuhealth-primary mb-2";
export const FIELD_BOX_CLASS = "border border-gray-200 rounded-2xl p-5";

/**
 * Shared "create a task" modal shell for the OtherMedicalServicesFab
 * quick-service items that don't have a backend endpoint yet (I&O,
 * ward procedures, ...). Each caller supplies its own title/primary
 * field; frequency, duration, priority, and the instruction box are the
 * same shape across all of them, so they're centralized here instead of
 * being copy-pasted into every modal.
 *
 * For layouts that don't fit the single "primary select" shape (e.g. a
 * repeatable drug chart), pass `topSection` to render custom content in
 * its place, `isTopSectionValid` to gate the submit button on it, and
 * `showFrequencyDuration={false}` to drop the shared Frequency/Duration
 * row entirely.
 */
const TaskCreationModal = ({
  title,
  primaryLabel,
  primaryOptions,
  topSection,
  isTopSectionValid = true,
  frequencyLabel = "Frequency",
  frequencyOptions = DEFAULT_FREQUENCY_OPTIONS,
  durationOptions = DEFAULT_DURATION_OPTIONS,
  priorityOptions = DEFAULT_PRIORITY_OPTIONS,
  defaultFrequency = DEFAULT_FREQUENCY,
  defaultDuration = DEFAULT_DURATION,
  defaultPriority = DEFAULT_PRIORITY,
  showFrequencyDuration = true,
  successMessage,
  onClose,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    primary: primaryOptions?.[0] || "",
    frequency: frequencyOptions.includes(defaultFrequency)
      ? defaultFrequency
      : frequencyOptions[0] || "",
    duration: durationOptions.includes(defaultDuration)
      ? defaultDuration
      : durationOptions[0] || "",
    startTime: DEFAULT_START_TIME,
    priority: priorityOptions.includes(defaultPriority)
      ? defaultPriority
      : priorityOptions[0] || "",
    instruction: "",
  });

  const updateField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  const updateValue = (field) => (value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const isFormFilled =
    (topSection ? isTopSectionValid : !!formData.primary) &&
    (!showFrequencyDuration || (!!formData.frequency && !!formData.duration)) &&
    !!formData.startTime &&
    !!formData.priority;

  const handleCreateTask = () => {
    if (!isFormFilled) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // TODO: wire up to the real task endpoint once it exists.
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full relative text-sm p-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              {successMessage || "Task created successfully!"}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:opacity-90 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full relative text-sm max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <i className="bx bx-x text-2xl"></i>
        </button>

        <div className="flex flex-col items-center text-center pt-8 px-6 pb-5 border-b border-gray-100">
          <ClipboardList className="w-9 h-9 text-docuhealth-primary mb-3" strokeWidth={1.75} />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-[13px] mt-1">
            Fill in the required details below to create a task!
          </p>
        </div>

        <div className="p-6 space-y-5">
          {topSection ? (
            topSection
          ) : (
            <div className={FIELD_BOX_CLASS}>
              <label className={FIELD_LABEL_CLASS}>{primaryLabel}</label>
              <Select
                value={formData.primary}
                onChange={updateValue("primary")}
                options={primaryOptions.map((option) => ({ value: option, label: option }))}
              />
            </div>
          )}

          {showFrequencyDuration && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className={FIELD_BOX_CLASS}>
                <label className={FIELD_LABEL_CLASS}>{frequencyLabel}</label>
                <Select
                  value={formData.frequency}
                  onChange={updateValue("frequency")}
                  options={frequencyOptions.map((option) => ({ value: option, label: option }))}
                />
              </div>

              <div className={FIELD_BOX_CLASS}>
                <label className={FIELD_LABEL_CLASS}>Duration</label>
                <Select
                  value={formData.duration}
                  onChange={updateValue("duration")}
                  options={durationOptions.map((option) => ({ value: option, label: option }))}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className={FIELD_BOX_CLASS}>
              <label className={FIELD_LABEL_CLASS}>Task start time</label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={updateField("startTime")}
              />
            </div>

            <div className={FIELD_BOX_CLASS}>
              <label className={FIELD_LABEL_CLASS}>Level of priority</label>
              <Select
                value={formData.priority}
                onChange={updateValue("priority")}
                options={priorityOptions.map((option) => ({ value: option, label: option }))}
              />
            </div>
          </div>

          <div className={FIELD_BOX_CLASS}>
            <label className={FIELD_LABEL_CLASS}>Add task instruction (optional)</label>
            <textarea
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-docuhealth-primary resize-none placeholder:text-gray-400"
              placeholder="Add comment..."
              value={formData.instruction}
              onChange={updateField("instruction")}
            />
          </div>
        </div>

        <div className="flex justify-end px-6 pb-6">
          <button
            onClick={handleCreateTask}
            disabled={!isFormFilled}
            className={`py-3 px-8 rounded-full text-sm font-medium text-white transition-colors ${
              isFormFilled
                ? "bg-docuhealth-primary cursor-pointer hover:bg-docuhealth-dark-primary"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Create this task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCreationModal;
