import { useState } from "react";
import { toast } from "sonner";
import { FormDialog, FormDialogHeader } from "@/components/dashboard/form-dialog";
import {
  type Bill,
  type Paid,
  type PayRequest,
  usePayBill,
} from "@/features/patient/api/pending-bills";
import { PayCardForm } from "@/features/patient/components/pay-card-form";
import { PayOfflineStep } from "@/features/patient/components/pay-offline-step";
import { PaymentDoneStep } from "@/features/patient/components/payment-done-step";
import { Segments } from "@/features/patient/components/patient-ui";
import { facilityLabel, outstanding } from "@/features/patient/lib/bills";
import { formatNaira } from "@/features/patient/lib/lab-results";
import { errorCode, getErrorMessage } from "@/lib/api";

type Method = PayRequest["method"];

/**
 * "Pay bill": the balance by card, or the facility's account to transfer to, or paying at its
 * POS; then "Payment successful" with a receipt. TODO(api): patients can't pay yet; see
 * `pending-bills.ts`.
 */
export function PayBillDialog({
  bill,
  open,
  onOpenChange,
}: {
  bill: Bill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Remounts on each open, so nothing typed survives closing it. */}
      {open && <PaySteps bill={bill} />}
    </FormDialog>
  );
}

function PaySteps({ bill }: { bill: Bill }) {
  const pay = usePayBill();
  const [method, setMethod] = useState<Method>("card");
  const [paid, setPaid] = useState<Paid | null>(null);
  const [declined, setDeclined] = useState<string | null>(null);
  const amount = outstanding(bill);

  if (paid) return <PaymentDoneStep bill={bill} paid={paid} />;

  const submit = (payment: PayRequest) => {
    setDeclined(null);
    pay.mutate(payment, {
      onSuccess: setPaid,
      onError: (error) => {
        if (errorCode(error) === "card_declined") setDeclined(getErrorMessage(error));
        else toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <>
      <FormDialogHeader
        title="Pay bill"
        description={`${formatNaira(amount)} to ${facilityLabel(bill)} · Invoice ${bill.invoice}`}
      >
        <div className="pb-4 *:w-full *:max-w-none sm:*:w-full">
          <Segments
            label="How to pay"
            value={method}
            onChange={setMethod}
            options={[
              { value: "card", label: "Card" },
              { value: "bank_transfer", label: "Bank transfer" },
              { value: "pos", label: "Via POS" },
            ]}
          />
        </div>
      </FormDialogHeader>
      {method === "card" ? (
        <PayCardForm
          amount={amount}
          pending={pay.isPending}
          declined={declined}
          onPay={(card) => submit({ billId: bill.id, method: "card", card })}
        />
      ) : (
        <PayOfflineStep
          key={method}
          bill={bill}
          method={method}
          pending={pay.isPending}
          onPaid={() => submit({ billId: bill.id, method })}
        />
      )}
    </>
  );
}
