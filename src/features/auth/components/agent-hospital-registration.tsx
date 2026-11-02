import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SuccessDialog } from "@/components/success-dialog";
import { AdminDetailsForm } from "@/features/auth/components/admin-details-form";
import { HospitalDetailsForm } from "@/features/auth/components/hospital-details-form";
import { HospitalLocationForm } from "@/features/auth/components/hospital-location-form";
import type {
  AdminDetailsValues,
  HospitalDetailsValues,
  HospitalLocationValues,
} from "@/features/auth/lib/schemas";

const TOTAL_STEPS = 3;

/** A field agent registers a hospital: details, location, then the admin who sets it up. */
export function AgentHospitalRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState<HospitalDetailsValues>();
  const [location, setLocation] = useState<HospitalLocationValues>();
  const [admin, setAdmin] = useState<AdminDetailsValues>();

  async function register(adminDetails: AdminDetailsValues) {
    // TODO(api): send `details` + `location` + `adminDetails` once the v2 API is defined.
    await Promise.resolve();
    setAdmin(adminDetails);
  }

  // TODO: return to the agent's dashboard once it exists.
  const leave = () => void navigate({ to: "/" });

  if (step === 3 && details && location) {
    return (
      <>
        <AdminDetailsForm step={3} totalSteps={TOTAL_STEPS} onRegister={register} />
        <SuccessDialog
          open={admin !== undefined}
          onOpenChange={(open) => !open && leave()}
          title="Hospital Registered!"
          description={`${details.hospitalName} has been added to DocuHealth. We’ve emailed ${admin?.firstName} at ${admin?.email} to finish setup.`}
          primaryAction={{ label: "Done", onClick: leave }}
        />
      </>
    );
  }

  if (step === 2 && details) {
    return (
      <HospitalLocationForm
        step={2}
        totalSteps={TOTAL_STEPS}
        defaultValues={location}
        onContinue={(values) => {
          setLocation(values);
          setStep(3);
        }}
      />
    );
  }

  return (
    <HospitalDetailsForm
      step={1}
      totalSteps={TOTAL_STEPS}
      defaultValues={details}
      onContinue={(values) => {
        setDetails(values);
        setStep(2);
      }}
    />
  );
}
