import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SuccessDialog } from "@/components/success-dialog";
import { AdminDetailsForm } from "@/features/auth/components/admin-details-form";
import { FacilityDocumentsForm } from "@/features/auth/components/facility-documents-form";
import type { AdminDetailsValues, FacilityDocumentsValues } from "@/features/auth/lib/schemas";

const TOTAL_STEPS = 2;

/** Opened from the verification email: documents, then the admin who'll set the facility up. */
export function FacilityVerification({ token: _token }: { token: string }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [documents, setDocuments] = useState<FacilityDocumentsValues>();
  const [admin, setAdmin] = useState<AdminDetailsValues>();

  async function register(details: AdminDetailsValues) {
    // TODO(api): send `documents` + `details` with `_token` once the v2 API is defined.
    await Promise.resolve();
    setAdmin(details);
  }

  const leave = () => void navigate({ to: "/" });

  if (step === 2 && documents) {
    return (
      <>
        <AdminDetailsForm step={2} totalSteps={TOTAL_STEPS} onRegister={register} />
        <SuccessDialog
          open={admin !== undefined}
          onOpenChange={(open) => !open && leave()}
          title="Hospital Registered!"
          // TODO(api): name the facility once the token tells us which one it is.
          description={`Your facility has been added to DocuHealth. We’ve emailed ${admin?.firstName} at ${admin?.email} to finish setup.`}
          primaryAction={{ label: "Done", onClick: leave }}
        />
      </>
    );
  }

  return (
    <FacilityDocumentsForm
      step={1}
      totalSteps={TOTAL_STEPS}
      defaultValues={documents}
      onContinue={(values) => {
        setDocuments(values);
        setStep(2);
      }}
    />
  );
}
