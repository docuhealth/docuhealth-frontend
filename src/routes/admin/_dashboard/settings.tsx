import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DhAdminSettings } from "@/features/dh-admin/components/dh-admin-settings";
import { ChangePasswordDialog } from "@/features/staff/components/account-dialogs";

export const Route = createFileRoute("/admin/_dashboard/settings")({
  component: SettingsPage,
});

/** The admin's account; the password dialog is the staff settings' own. */
function SettingsPage() {
  const [changingPassword, setChangingPassword] = useState(false);
  return (
    <>
      <title>Settings · DocuHealth admin</title>
      <DhAdminSettings onChangePassword={() => setChangingPassword(true)} />
      <ChangePasswordDialog open={changingPassword} onOpenChange={setChangingPassword} />
    </>
  );
}
