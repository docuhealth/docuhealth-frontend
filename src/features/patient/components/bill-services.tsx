import type { BillService } from "@/features/patient/api/pending-bills";
import { RecordList, RecordRow } from "@/features/patient/components/patient-ui";
import { formatNaira } from "@/features/patient/lib/lab-results";

/** "Services charged": each service, its department and what it cost. */
export function BillServices({ services }: { services: BillService[] }) {
  return (
    <section aria-labelledby="bill-services" className="flex flex-col gap-3">
      <h2 id="bill-services" className="type-h5 text-fg-heading">
        Services charged
      </h2>
      <RecordList label="Services charged">
        {services.map((service, index) => (
          <RecordRow
            key={`${service.name}-${index}`}
            title={service.name}
            meta={service.department}
            status={
              <span className="shrink-0 type-body-sm-medium text-fg-heading">
                {formatNaira(service.amount)}
              </span>
            }
          />
        ))}
      </RecordList>
    </section>
  );
}
