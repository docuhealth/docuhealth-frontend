import { createFileRoute } from "@tanstack/react-router";
import { Prescriptions } from "@/features/pharmacy/components/prescriptions";

export const Route = createFileRoute("/hospital/pharmacy/prescriptions/")({
  component: PrescriptionsPage,
});

function PrescriptionsPage() {
  return (
    <>
      <title>Prescriptions · DocuHealth</title>
      <Prescriptions />
    </>
  );
}
