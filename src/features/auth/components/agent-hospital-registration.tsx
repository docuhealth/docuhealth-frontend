import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SuccessDialog } from "@/components/success-dialog";
import { useRegisterFacilityByAgent } from "@/features/auth/api/mutations";
import { AdminDetailsForm } from "@/features/auth/components/admin-details-form";
import { HospitalDetailsForm } from "@/features/auth/components/hospital-details-form";
import { HospitalLocationForm } from "@/features/auth/components/hospital-location-form";
import type {
  AdminDetailsValues,
  HospitalDetailsValues,
  HospitalLocationValues,
} from "@/features/auth/lib/schemas";
import { getErrorMessage } from "@/lib/api";

const TOTAL_STEPS = 3;

/** A field agent registers a hospital: details, location, then the admin who sets it up. */
export function AgentHospitalRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState<HospitalDetailsValues>();
  const [location, setLocation] = useState<HospitalLocationValues>();
  const [admin, setAdmin] = useState<AdminDetailsValues>();
  const registerFacilityMutation = useRegisterFacilityByAgent();

  async function register(adminDetails: AdminDetailsValues) {
    if (!details || !location) return;
    try {
      await registerFacilityMutation.mutateAsync({
        facility_type: details.facilityType,
        name: details.hospitalName.trim(),
        official_email: location.email.trim(),
        phone: location.phone.trim(),
        country: location.country.trim(),
        state: location.state.trim(),
        city: location.lga.trim(),
        street: location.streetAddress.trim(),
        login_url: `${window.location.origin}/hospital/login`,
        admins: [
          {
            part: details.facilityType,
            email: adminDetails.email.trim(),
            profile: {
              firstname: adminDetails.firstName.trim(),
              lastname: adminDetails.lastName.trim(),
              phone_num: adminDetails.phone.trim(),
              role: adminDetails.role,
              gender: adminDetails.gender,
              specialization: adminDetails.specialization?.trim() || undefined,
            },
          },
        ],
      });
      setAdmin(adminDetails);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const leave = () => void navigate({ to: "/" });

  if (step === 3 && details && location) {
    return (
      <>
        <AdminDetailsForm
          step={3}
          totalSteps={TOTAL_STEPS}
          facilityType={details.facilityType}
          submitLabel="Register hospital"
          onRegister={register}
        />
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
