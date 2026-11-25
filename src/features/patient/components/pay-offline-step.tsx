import { CopySimpleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { FormDialogBody, FormDialogFooter } from "@/components/dashboard/form-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Bill } from "@/features/patient/api/pending-bills";
import { DetailRows } from "@/features/patient/components/patient-ui";
import { facilityLabel, outstanding } from "@/features/patient/lib/bills";
import { formatNaira } from "@/features/patient/lib/lab-results";

/**
 * Paying by bank transfer (the facility's account to send it to) or at the facility's POS, then
 * "I've paid", which tells the facility to look out for it.
 */
export function PayOfflineStep({
  bill,
  method,
  pending,
  onPaid,
}: {
  bill: Bill;
  method: "bank_transfer" | "pos";
  pending: boolean;
  onPaid: () => void;
}) {
  const amount = formatNaira(outstanding(bill));
  const account = bill.payTo?.accountNumber;

  return (
    <>
      <FormDialogBody>
        {method === "bank_transfer" ? (
          bill.payTo ? (
            <>
              <p className="type-body-sm-regular text-fg-body">
                Transfer {amount} to {bill.facility}’s account. Use invoice {bill.invoice} as the
                narration so they can match it.
              </p>
              <DetailRows
                rows={[
                  ["Bank", bill.payTo.bank],
                  ["Account name", bill.payTo.accountName],
                  [
                    "Account number",
                    <span key="account" className="inline-flex items-center gap-2">
                      {bill.payTo.accountNumber}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Copy account number"
                        onClick={() => {
                          if (!account) return;
                          void navigator.clipboard
                            ?.writeText(account)
                            .then(() => toast.success("Account number copied"));
                        }}
                      >
                        <CopySimpleIcon />
                      </Button>
                    </span>,
                  ],
                  ["Amount", amount],
                  ["Narration", bill.invoice],
                ]}
              />
            </>
          ) : (
            <p className="type-body-sm-regular text-fg-body">
              Ask {facilityLabel(bill)} for the account to transfer {amount} to, and use invoice{" "}
              {bill.invoice} as the narration.
            </p>
          )
        ) : (
          <p className="type-body-sm-regular text-fg-body">
            Pay {amount} with your card at the cashier at {facilityLabel(bill)}. Give them invoice{" "}
            {bill.invoice} so they can match it.
          </p>
        )}
        <p className="type-caption text-fg-caption">
          Once you’ve paid, tell us below. {bill.facility} confirms it, usually within a day, and
          your balance updates then.
        </p>
      </FormDialogBody>
      <FormDialogFooter>
        <Button
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={onPaid}
          className="h-11 px-5 type-heading-sm"
        >
          {pending && <Spinner data-icon="inline-start" aria-hidden />}
          I’ve paid
        </Button>
      </FormDialogFooter>
    </>
  );
}
