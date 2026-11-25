import { ChatCircleIcon, ReceiptIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { type Bill, billingQuery } from "@/features/patient/api/pending-bills";
import { BillServices } from "@/features/patient/components/bill-services";
import { BillSplitCard } from "@/features/patient/components/bill-split-card";
import { BillSummaryCard } from "@/features/patient/components/bill-summary-card";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { PayBillDialog } from "@/features/patient/components/pay-bill-dialog";

/** One bill: its balance, the services charged, how it's split, and paying it. */
export function BillDetails({ billId }: { billId: string }) {
  const { data, isError } = useQuery(billingQuery());
  const bill = data?.bills.find((each) => each.id === billId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Bill detail"
        back={{ to: "/patient/bills", label: "Back to Bills & payments" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : bill ? (
        <BillScreen bill={bill} />
      ) : (
        <PatientEmpty
          icon={<ReceiptIcon />}
          title="Bill not found"
          description="It may have been removed. Your bills are all on the Bills & payments page."
        />
      )}
    </div>
  );
}

function BillScreen({ bill }: { bill: Bill }) {
  const [paying, setPaying] = useState(false);
  return (
    <>
      <BillSummaryCard bill={bill} onPay={() => setPaying(true)} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <BillServices services={bill.services} />
        <div className="flex flex-col items-center gap-4 lg:pt-10">
          <div className="w-full">
            <BillSplitCard bill={bill} />
          </div>
          <Link
            to="/patient/messages"
            className="flex items-center gap-2 type-body-sm-regular text-fg-body hover:text-primary"
          >
            <ChatCircleIcon aria-hidden className="size-4" />
            Question about this bill? Message billing
          </Link>
        </div>
      </div>
      <PayBillDialog bill={bill} open={paying} onOpenChange={setPaying} />
    </>
  );
}
