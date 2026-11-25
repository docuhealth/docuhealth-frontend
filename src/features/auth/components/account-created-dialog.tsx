import { CopyHinButton } from "@/components/copy-hin-button";
import { SuccessDialog } from "@/components/success-dialog";

/**
 * Shown once sign-up succeeds; "Log in" takes them to the login page to sign in with their
 * new account. Only "Done" closes it, so the HIN can't be lost to a stray click. `loginWith` names
 * what they'll log in with next time (the contact their code went to).
 */
export function AccountCreatedDialog({
  open,
  hin,
  loginWith,
  onDone,
}: {
  open: boolean;
  hin: string;
  loginWith: "phone number" | "email";
  onDone: () => void;
}) {
  return (
    <SuccessDialog
      open={open}
      dismissible={false}
      title="Account Created!"
      description={`Your account is ready. Log in with your ${loginWith} and the password you just set.`}
      primaryAction={{ label: "Log in", onClick: onDone }}
    >
      <div className="rounded-md border border-info-100 bg-info-100/40 px-3 py-2.5 text-left">
        <p className="flex items-center gap-1 type-heading-sm-regular text-fg-heading">
          Your HIN: <strong className="text-primary">{hin}</strong>
          <CopyHinButton
            hin={hin}
            failureMessage="Couldn’t copy. Please write your HIN down instead."
          />
        </p>
        <p className="mt-1 type-caption-tight text-muted-foreground">
          Please write down your HIN and keep it confidential.
        </p>
      </div>
    </SuccessDialog>
  );
}
