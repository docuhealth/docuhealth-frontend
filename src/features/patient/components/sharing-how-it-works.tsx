import { SectionLabel } from "@/features/patient/components/patient-ui";

const steps = [
  {
    title: "Choose who and what",
    text: "Pick the facility, the person, and which parts of your record to share.",
  },
  { title: "Verify it’s you", text: "Confirm with a one-time code sent to your phone." },
  {
    title: "Give them the code",
    text: "They use the access code or secure link until it expires.",
  },
];

/** "How it works": the three numbered steps of sharing. */
export function SharingHowItWorks() {
  return (
    <section aria-label="How it works" className="flex flex-col gap-2">
      <SectionLabel>How it works</SectionLabel>
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <span
              aria-hidden
              className="grid size-7 place-content-center rounded-full bg-brand-50 type-caption-semibold text-primary"
            >
              {index + 1}
            </span>
            <p className="type-body-sm-medium text-fg-heading">{step.title}</p>
            <p className="type-caption text-fg-caption">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
