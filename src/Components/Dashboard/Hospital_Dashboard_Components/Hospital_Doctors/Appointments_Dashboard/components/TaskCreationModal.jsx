import React, { useState } from "react";
import { ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../../../ui/Input";
import Select from "../../../../../ui/Select";
import Spinner from "../../../../../ui/Spinner";
import {
  FREQUENCY_OPTIONS,
  PRIORITY_OPTIONS,
  DURATION_RATE_OPTIONS,
  REPEAT_UNTIL_OPTIONS,
  DEFAULT_FREQUENCY,
  DEFAULT_PRIORITY,
  DEFAULT_DURATION_RATE,
  DEFAULT_REPEAT_UNTIL,
} from "../../../../../../utils/careTaskConstants";

const DEFAULT_START_TIME = "11:00";
const DEFAULT_DURATION_VALUE = 24;

const todayDateString = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

export const FIELD_LABEL_CLASS = "block text-sm font-medium text-docuhealth-primary mb-2";
export const FIELD_BOX_CLASS = "border border-gray-200 rounded-2xl p-5";

/**
 * Shared "create a task" modal shell for the OtherMedicalServicesFab
 * quick-service items backed by
 * `POST /api/inpatients/admissions/<sqid>/tasks`. It owns the fields every
 * task type shares (start date/time, frequency, duration, repeat-until,
 * priority, instructions) and leaves the type-specific `config` to the
 * caller.
 *
 * For layouts that don't fit the single "primary select" shape (e.g. a
 * repeatable drug chart or IV fluid details), pass `topSection` to render
 * custom content in its place and `isTopSectionValid` to gate the submit
 * button on it.
 *
 * Callers pass `onSubmit(sharedFields)`, which receives the common fields
 * already shaped for the API body (`start_time`, `frequency`, `duration`,
 * `repeat_until`, `priority`, `instructions`, plus whatever the "primary"
 * select holds) and is expected to merge in `task_type`/`config` and POST
 * it. If a caller has no endpoint to hit yet, omit `onSubmit` and this
 * just shows the success screen locally — swap in a real `onSubmit` once
 * one exists.
 */
const TaskCreationModal = ({
  title,
  primaryLabel,
  primaryOptions,
  topSection,
  isTopSectionValid = true,
  frequencyLabel = "Frequency",
  frequencyOptions = FREQUENCY_OPTIONS,
  durationRateOptions = DURATION_RATE_OPTIONS,
  priorityOptions = PRIORITY_OPTIONS,
  defaultFrequency = DEFAULT_FREQUENCY,
  defaultDurationValue = DEFAULT_DURATION_VALUE,
  defaultDurationRate = DEFAULT_DURATION_RATE,
  defaultRepeatUntil = DEFAULT_REPEAT_UNTIL,
  defaultPriority = DEFAULT_PRIORITY,
  showFrequencyDuration = true,
  successMessage,
  onSubmit,
  onClose,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    primary: primaryOptions?.[0]?.value ?? "",
    frequency: frequencyOptions.some((o) => o.value === defaultFrequency)
      ? defaultFrequency
      : (frequencyOptions[0]?.value ?? ""),
    repeatUntil: defaultRepeatUntil,
    durationValue: String(defaultDurationValue),
    durationRate: durationRateOptions.some((o) => o.value === defaultDurationRate)
      ? defaultDurationRate
      : (durationRateOptions[0]?.value ?? ""),
    date: todayDateString(),
    time: DEFAULT_START_TIME,
    priority: priorityOptions.some((o) => o.value === defaultPriority)
      ? defaultPriority
      : (priorityOptions[0]?.value ?? ""),
    instructions: "",
  });

  const updateField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  const updateValue = (field) => (value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const isDurationNeeded = showFrequencyDuration && formData.repeatUntil === "duration";

  const isFormFilled =
    (topSection ? isTopSectionValid : !!formData.primary) &&
    (!showFrequencyDuration ||
      (!!formData.frequency &&
        !!formData.repeatUntil &&
        (!isDurationNeeded || (Number(formData.durationValue) > 0 && !!formData.durationRate)))) &&
    !!formData.date &&
    !!formData.time &&
    !!formData.priority;

  const buildSharedPayload = () => {
    const shared = {
      start_time: new Date(`${formData.date}T${formData.time}`).toISOString(),
      priority: formData.priority,
      instructions: formData.instructions || "",
      primary: formData.primary,
    };
    if (showFrequencyDuration) {
      shared.frequency = formData.frequency;
      shared.repeat_until = formData.repeatUntil;
      if (formData.repeatUntil === "duration") {
        shared.duration = { value: Number(formData.durationValue), rate: formData.durationRate };
      }
    }
    return shared;
  };

  const handleCreateTask = async () => {
    if (!isFormFilled) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!onSubmit) {
      // No backend endpoint wired up for this task type yet.
      setShowSuccess(true);
      return;
    }

    try {
      setIsCreating(true);
      await onSubmit(buildSharedPayload());
      setShowSuccess(true);
    } catch {
      // The caller's mutation already surfaces an error toast.
    } finally {
      setIsCreating(false);
    }
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
              <label className={FIELD_LABEL_CLASS}>{primaryLabel}<span className="text-red-500"> *</span></label>
              <Select
                value={formData.primary}
                onChange={updateValue("primary")}
                options={primaryOptions}
              />
            </div>
          )}

          {showFrequencyDuration && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className={FIELD_BOX_CLASS}>
                <label className={FIELD_LABEL_CLASS}>{frequencyLabel}<span className="text-red-500"> *</span></label>
                <Select
                  value={formData.frequency}
                  onChange={updateValue("frequency")}
                  options={frequencyOptions}
                />
              </div>

              <div className={FIELD_BOX_CLASS}>
                <label className={FIELD_LABEL_CLASS}>Runs until</label>
                <Select
                  value={formData.repeatUntil}
                  onChange={updateValue("repeatUntil")}
                  options={REPEAT_UNTIL_OPTIONS}
                />
              </div>
            </div>
          )}

          {isDurationNeeded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className={FIELD_BOX_CLASS}>
                <label className={FIELD_LABEL_CLASS}>Duration<span className="text-red-500"> *</span></label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter duration..."
                  value={formData.durationValue}
                  onChange={updateField("durationValue")}
                />
              </div>

              <div className={FIELD_BOX_CLASS}>
                <label className={FIELD_LABEL_CLASS}>Duration unit<span className="text-red-500"> *</span></label>
                <Select
                  value={formData.durationRate}
                  onChange={updateValue("durationRate")}
                  options={durationRateOptions}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className={FIELD_BOX_CLASS}>
              <label className={FIELD_LABEL_CLASS}>Task start date<span className="text-red-500"> *</span></label>
              <Input type="date" value={formData.date} onChange={updateField("date")} />
            </div>

            <div className={FIELD_BOX_CLASS}>
              <label className={FIELD_LABEL_CLASS}>Task start time<span className="text-red-500"> *</span></label>
              <Input type="time" value={formData.time} onChange={updateField("time")} />
            </div>
          </div>

          <div className={FIELD_BOX_CLASS}>
            <label className={FIELD_LABEL_CLASS}>Level of priority</label>
            <Select
              value={formData.priority}
              onChange={updateValue("priority")}
              options={priorityOptions}
            />
          </div>

          <div className={FIELD_BOX_CLASS}>
            <label className={FIELD_LABEL_CLASS}>Add task instruction (optional)</label>
            <textarea
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-docuhealth-primary resize-none placeholder:text-gray-400"
              placeholder="Add comment..."
              value={formData.instructions}
              onChange={updateField("instructions")}
            />
          </div>
        </div>

        <div className="flex justify-end px-6 pb-6">
          <button
            onClick={handleCreateTask}
            disabled={!isFormFilled || isCreating}
            className={`py-3 px-8 rounded-full text-sm font-medium text-white transition-colors ${
              isFormFilled && !isCreating
                ? "bg-docuhealth-primary cursor-pointer hover:bg-docuhealth-dark-primary"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4 text-white" />
                Creating task...
              </span>
            ) : (
              "Create this task"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCreationModal;
