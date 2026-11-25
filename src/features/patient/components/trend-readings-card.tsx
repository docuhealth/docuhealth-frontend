import type { VitalReading } from "@/features/patient/api/schemas";
import { VitalStatusTag } from "@/features/patient/components/vital-status-tag";
import { notYet } from "@/features/patient/lib/not-yet";
import { type VitalKey, vitalStatus, vitalUnits, vitalValue } from "@/features/patient/lib/vitals";
import { formatDay } from "@/lib/format";

/** How many readings the card lists before "See all". */
const SHOWN = 5;

/** The vital's readings, newest first: value, when and where, and how each sits. */
export function TrendReadingsCard({
  readings,
  vital,
}: {
  readings: VitalReading[];
  vital: VitalKey;
}) {
  const taken = readings.filter((reading) => vitalValue(reading, vital) != null);
  return (
    <section aria-labelledby="all-readings" className="flex flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 id="all-readings" className="type-body-sm-medium text-fg-heading">
          All readings
        </h2>
        {/* TODO(design): no page for a vital's full history yet. */}
        {taken.length > SHOWN && (
          <button
            type="button"
            onClick={notYet("Seeing every reading")}
            className="type-caption-medium text-primary hover:underline"
          >
            See all
          </button>
        )}
      </div>
      {taken.length === 0 ? (
        <p className="border-t px-4 py-6 text-center type-body-sm-regular text-fg-caption">
          Nothing recorded yet.
        </p>
      ) : (
        <ul aria-label="All readings" className="flex flex-col divide-y border-t">
          {taken.slice(0, SHOWN).map((reading) => {
            const status = vitalStatus(reading, vital);
            return (
              <li key={reading.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate type-body-sm-medium text-fg-heading">
                    {vitalValue(reading, vital)} {vitalUnits[vital]}
                  </span>
                  <span className="truncate type-caption text-fg-caption">
                    {[formatDay(new Date(reading.at)), reading.facility]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {status && <VitalStatusTag status={status} />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
