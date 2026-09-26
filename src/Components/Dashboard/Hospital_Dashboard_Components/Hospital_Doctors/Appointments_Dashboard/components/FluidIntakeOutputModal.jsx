import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TaskCreationModal from "./TaskCreationModal";
import { createInpatientTask } from "../../../../../../queries/Hospital/doctor/inpatientTasks";

// The only three `tracking_mode` values the backend accepts.
const IO_TRACKING_MODE_OPTIONS = [
  { value: "strict_24_hour_fluid_balance", label: "Strict 24-Hour Fluid Balance (Intake + Output)" },
  { value: "intake_only", label: "Intake Only Monitoring" },
  { value: "output_only", label: "Output Only Monitoring" },
];

/**
 * "Fluid Input and Output" quick-service flow from OtherMedicalServicesFab.
 * Creates an `input_output` care task on the patient's admission via
 * POST /api/inpatients/admissions/<sqid>/tasks.
 */
const FluidIntakeOutputModal = ({ admissionSqid, onClose }) => {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (payload) => createInpatientTask({ admissionSqid, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inpatient-tasks"] });
    },
    onError: (err) => {
      console.error("Error creating input/output task:", err);
      toast.error(err.response?.data?.message || "Failed to create input/output task.");
    },
  });

  const handleSubmit = ({ primary, ...shared }) =>
    mutateAsync({
      task_type: "input_output",
      config: { tracking_mode: primary },
      ...shared,
    });

  return (
    <TaskCreationModal
      title="Fluid Input & Output Task"
      primaryLabel="I&O Protocol Type"
      primaryOptions={IO_TRACKING_MODE_OPTIONS}
      successMessage="Fluid Input and Output task created!"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};

export default FluidIntakeOutputModal;
