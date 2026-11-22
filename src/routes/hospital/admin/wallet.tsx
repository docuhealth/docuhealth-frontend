import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "@/features/hospital-admin/components/wallet";

export const Route = createFileRoute("/hospital/admin/wallet")({
  component: WalletPage,
});

function WalletPage() {
  return (
    <>
      <title>Wallet · DocuHealth</title>
      <Wallet />
    </>
  );
}
