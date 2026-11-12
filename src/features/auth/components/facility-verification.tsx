import { WarningCircleIcon } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import {
  useSetFacilityApplicationAdmin,
  useSubmitFacilityApplicationDocuments,
  useVerifyFacilityApplicationAdminCode,
  useVerifyFacilityApplicationEmail,
} from "@/features/auth/api/mutations";
import type { FacilityApplicationSubmitted } from "@/features/auth/api/schemas";
import { AdminDetailsForm } from "@/features/auth/components/admin-details-form";
import { AuthNotice } from "@/features/auth/components/auth-header";
import { FacilityDocumentsForm } from "@/features/auth/components/facility-documents-form";
import { VerifyCodeForm } from "@/features/auth/components/verify-code-form";
import type {
  AdminDetailsValues,
  FacilityDocumentsValues,
  OrganisationType,
} from "@/features/auth/lib/schemas";
import { getErrorMessage } from "@/lib/api";

const TOTAL_STEPS = 2;

/**
 * Opened from the facility verification email link (`/hospital/verify?token=...&application=...`):
 * 1. Confirms the official email token on load
 * 2. Captures the primary admin's details (and verifies the admin's email OTP if different from official email)
 * 3. Captures the facility's physical address and licensing documents
 */
export function FacilityVerification({
  token,
  application,
}: {
  token: string;
  application: string;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"admin" | "admin-otp" | "documents">("admin");
  const [appInfo, setAppInfo] = useState<FacilityApplicationSubmitted | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminDetailsValues>();
  const [documents, setDocuments] = useState<FacilityDocumentsValues>();
  const [completed, setCompleted] = useState(false);

  const verifyEmailMutation = useVerifyFacilityApplicationEmail();
  const setAdminMutation = useSetFacilityApplicationAdmin();
  const verifyAdminOtpMutation = useVerifyFacilityApplicationAdminCode();
  const submitDocumentsMutation = useSubmitFacilityApplicationDocuments();

  const verifiedRef = useRef(false);
  useEffect(() => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;
    verifyEmailMutation
      .mutateAsync({ application, token })
      .then((info) => {
        setAppInfo(info);
      })
      .catch((error: unknown) => {
        setLinkError(getErrorMessage(error));
      });
  }, [application, token, verifyEmailMutation]);

  const facilityType: OrganisationType | undefined = appInfo?.facility_type;

  async function saveAdminDetails(values: AdminDetailsValues) {
    try {
      const response = await setAdminMutation.mutateAsync({
        application,
        token,
        email: values.email.trim(),
        facility_type: facilityType,
        part: facilityType,
        profile: {
          firstname: values.firstName.trim(),
          lastname: values.lastName.trim(),
          phone_num: values.phone.trim(),
          role: values.role,
          gender: values.gender,
          specialization: values.specialization?.trim() || undefined,
        },
      });
      setAdmin(values);
      if (response.email_verified === false) {
        setStep("admin-otp");
      } else {
        setStep("documents");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleVerifyAdminOtp(code: string) {
    try {
      await verifyAdminOtpMutation.mutateAsync({
        application,
        token,
        code,
        facility_type: facilityType,
      });
      setStep("documents");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleSubmitDocuments(values: FacilityDocumentsValues) {
    try {
      await submitDocumentsMutation.mutateAsync({
        application,
        token,
        country: values.country.trim(),
        state: values.state.trim(),
        city: values.city.trim(),
        street: values.street.trim(),
        documents: values.files,
      });
      setDocuments(values);
      setCompleted(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const leave = () => void navigate({ to: "/" });

  if (linkError) {
    return (
      <div className="flex flex-col gap-6">
        <AuthNotice icon={<WarningCircleIcon />} tone="error" title="Verification failed">
          <p className="type-body-sm-regular text-muted-foreground">{linkError}</p>
        </AuthNotice>
        <Button asChild variant="outline" className="h-12 w-full bg-card">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (step === "documents") {
    return (
      <>
        <FacilityDocumentsForm
          step={2}
          totalSteps={TOTAL_STEPS}
          defaultValues={documents}
          onContinue={handleSubmitDocuments}
        />
        <SuccessDialog
          open={completed}
          onOpenChange={(open) => !open && leave()}
          title="Application Submitted!"
          description={`${appInfo?.name ?? "Your facility"} has completed verification. Our team will review your documents and email ${admin?.firstName ?? "your administrator"} at ${admin?.email ?? "their email"} once approved.`}
          primaryAction={{ label: "Done", onClick: leave }}
        />
      </>
    );
  }

  if (step === "admin-otp" && admin) {
    return (
      <VerifyCodeForm
        email={admin.email}
        step={1}
        totalSteps={TOTAL_STEPS}
        title="Verify admin email"
        login={null}
        onChangeEmail={() => setStep("admin")}
        onVerified={handleVerifyAdminOtp}
        onResend={async () => {
          await saveAdminDetails(admin);
        }}
      />
    );
  }

  return (
    <AdminDetailsForm
      step={1}
      totalSteps={TOTAL_STEPS}
      facilityType={facilityType}
      defaultValues={admin}
      submitLabel="Continue"
      onRegister={saveAdminDetails}
    />
  );
}
