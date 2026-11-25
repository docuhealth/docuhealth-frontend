import { ReceiptIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { billingQuery } from "@/features/patient/api/pending-bills";
import { FacilityFilter } from "@/features/patient/components/facility-filter";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { PaymentRow } from "@/features/patient/components/payment-row";
import { RecordList, SectionLabel } from "@/features/patient/components/patient-ui";
import {
  facilityLabel,
  paymentDetail,
  paymentFacilities,
  paymentsByMonth,
} from "@/features/patient/lib/bills";

/** Every payment, by month, newest first, filtered by facility. TODO(api): see pending-bills.ts. */
export function PaymentHistoryPage() {
  const { data, isError } = useQuery(billingQuery());
  const [facility, setFacility] = useState<string | null>(null);
  const payments = data?.payments ?? [];
  const facilities = paymentFacilities(payments);
  const months = paymentsByMonth(
    payments.filter((payment) => !facility || payment.facility === facility),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Payment history"
        back={{ to: "/patient/bills", label: "Back to Bills & payments" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : payments.length === 0 ? (
        <PatientEmpty
          icon={<ReceiptIcon />}
          title="No payments yet"
          description="Payments you make to your hospitals will appear here"
        />
      ) : (
        <>
          {facilities.length > 1 && (
            <FacilityFilter facilities={facilities} value={facility} onChange={setFacility} />
          )}
          {months.map((month) => (
            <section key={month.label} aria-label={month.label} className="flex flex-col gap-2">
              <SectionLabel>{month.label}</SectionLabel>
              <RecordList label={`Payments in ${month.label}`}>
                {month.payments.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    title={facilityLabel(payment)}
                    detail={paymentDetail(payment)}
                  />
                ))}
              </RecordList>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
