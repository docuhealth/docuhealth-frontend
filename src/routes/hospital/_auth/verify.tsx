import { WarningCircleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthNotice } from "@/features/auth/components/auth-header";
import { FacilityVerification } from "@/features/auth/components/facility-verification";

export const Route = createFileRoute("/hospital/_auth/verify")({
  // `token` comes from the "Verify Hospital Details" link in the verification email.
  validateSearch: z.object({ token: z.string().optional() }),
  component: VerifyHospitalPage,
});

function VerifyHospitalPage() {
  const { token } = Route.useSearch();

  return (
    <>
      <title>Upload documents · DocuHealth</title>
      {token ? (
        <FacilityVerification token={token} />
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
