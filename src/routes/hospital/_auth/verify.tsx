import { WarningCircleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthNotice } from "@/features/auth/components/auth-header";
import { FacilityVerification } from "@/features/auth/components/facility-verification";

export const Route = createFileRoute("/hospital/_auth/verify")({
  // `token` and `application` come from the verification link in the official facility email.
  validateSearch: z.object({
    token: z.string().optional(),
    application: z.string().optional(),
  }),
  component: VerifyHospitalPage,
});

function VerifyHospitalPage() {
  const { token, application } = Route.useSearch();

  return (
    <>
      <title>Verify facility · DocuHealth</title>
      {token ? (
        <FacilityVerification token={token} application={application ?? "fapp_default"} />
      ) : (
        <div className="flex flex-col gap-6">
          <AuthNotice icon={<WarningCircleIcon />} tone="error" title="Link expired">
            <p className="type-body-sm-regular text-muted-foreground">
              This verification link is invalid or has expired. Use the link in your latest email
              from DocuHealth, or contact info@docuhealth.online.
            </p>
          </AuthNotice>
          <Button asChild variant="outline" className="h-12 w-full bg-card">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      )}
    </>
  );
}
