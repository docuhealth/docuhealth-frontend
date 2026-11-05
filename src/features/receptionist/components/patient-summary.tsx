/** The "Patient" box at the top of a front-desk dialog: name, then HIN and contact details. */
export function PatientSummary({
  patient,
}: {
  patient: { name: string; hin: string; phone?: string | null; email?: string | null };
}) {
  const details = [`HIN-${patient.hin}`, patient.phone, patient.email].filter(Boolean);
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-surface px-5 py-4">
      <span className="type-label text-fg-caption">Patient</span>
      <span className="type-h5">{patient.name}</span>
      <span className="type-body-sm-regular wrap-anywhere text-fg-caption">
        {details.join(" · ")}
      </span>
    </div>
  );
}
