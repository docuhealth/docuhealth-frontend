import { ReceiptIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { billingQuery, useOutstandingTotal } from "@/features/patient/api/pending-bills";
import { OutstandingCarousel } from "@/features/patient/components/outstanding-carousel";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { PaymentRow } from "@/features/patient/components/payment-row";
import { RecordList } from "@/features/patient/components/patient-ui";
import {
  billsSubtitle,
  owingByFacility,
  paymentSummary,
  sortPayments,
} from "@/features/patient/lib/bills";

/** How many recent payments the page lists before "See all". */
const RECENT = 6;

/**
 * Bills & payments: what's owed, a card per facility, and the latest payments.
 * TODO(api): bills and payments come from `pending-bills.ts`.
 */
export function BillsPage() {
  const { data, isError } = useQuery(billingQuery());
  const total = useOutstandingTotal();
  const owing = owingByFacility(data?.bills ?? []);
  const payments = sortPayments(data?.payments ?? []);
  const loading = !data && !isError;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Bills & payments"
        subtitle={total === undefined ? null : billsSubtitle(total, owing)}
      />
      {loading ? (
        <div aria-hidden className="h-34 animate-pulse rounded-xl bg-primary/20" />
      ) : (
        <OutstandingCarousel owing={owing} />
      )}

      {loading ? (
        <ListSkeleton />
      ) : payments.length === 0 ? (
        data?.bills.length ? (
          <PatientEmpty
            icon={<ReceiptIcon />}
            title="No payments yet"
            description="Payments you make to your hospitals will appear here"
          />
        ) : (
          <PatientEmpty
            icon={<ReceiptIcon />}
            title="No bills yet"
            description="Your hospital bills and payment history will appear here"
          />
        )
      ) : (
        <section aria-labelledby="payment-history" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 id="payment-history" className="type-h5 text-fg-heading">
              Payment history
            </h2>
            <Link to="/patient/bills/history" className="type-link-sm text-primary hover:underline">
              See all
            </Link>
          </div>
          <RecordList label="Recent payments">
            {payments.slice(0, RECENT).map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                title={payment.facility}
                detail={paymentSummary(payment)}
                linked
              />
            ))}
          </RecordList>
        </section>
      )}
    </div>
  );
}
