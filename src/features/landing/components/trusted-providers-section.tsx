import { LandingContainer } from "@/features/landing/components/landing-container";
import { SectionHeading } from "@/features/landing/components/section-heading";
import { cn } from "@/lib/utils";

function HospitalGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
    >
      <path d="M11.6673 1.66602V3.33268M11.6673 3.33268V4.99935M11.6673 3.33268H8.33398M8.33398 3.33268V1.66602M8.33398 3.33268V4.99935" />
      <path d="M2.5 18.334V9.48465C2.5 6.56448 2.5 5.10442 3.46106 4.19724C4.07186 3.62068 4.91927 3.41056 6.25 3.33398M17.5 18.334V9.48465C17.5 6.56448 17.5 5.10442 16.5389 4.19724C15.9282 3.62068 15.0807 3.41056 13.75 3.33398" />
      <path d="M11.666 8.33398H13.3327" />
      <path d="M11.666 11.666H13.3327" />
      <path d="M5.83398 11.666H7.50065" />
      <path d="M5.83398 8.33398H7.50065" />
      <path d="M1.66602 18.334H7.91602M18.3327 18.334H12.0827" />
      <path d="M7.91602 18.3327V16.2493C7.91602 15.4705 7.91602 15.0811 8.08348 14.791C8.19319 14.601 8.35102 14.4432 8.54102 14.3335C8.8311 14.166 9.22052 14.166 9.99935 14.166C10.7782 14.166 11.1676 14.166 11.4577 14.3335C11.6477 14.4432 11.8055 14.601 11.9152 14.791C12.0827 15.0811 12.0827 15.4705 12.0827 16.2493V18.3327" />
    </svg>
  );
}

function Testimonial({
  quote,
  name,
  position,
  badgeClassName,
}: {
  quote: string;
  name: string;
  position: string;
  badgeClassName: string;
}) {
  return (
    <article className="flex min-h-62.5 flex-col justify-between gap-6 rounded-lg bg-card p-5 shadow-card">
      <p className="type-accent-h4 text-fg-heading">{quote}</p>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full text-white",
            badgeClassName,
          )}
        >
          <HospitalGlyph />
        </span>
        <div>
          <p className="type-title-sm text-fg-heading">{name}</p>
          <p className="mt-1 type-body-sm-regular text-fg-body">{position}</p>
        </div>
      </div>
    </article>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-h-62.5 flex-col items-center justify-center rounded-lg bg-fg-heading p-5 pb-8 text-center text-white">
      <p className="type-stat-lg">{value}</p>
      <p className="mt-2 type-body-lg">{label}</p>
    </div>
  );
}

export function TrustedProvidersSection() {
  return (
    <LandingContainer id="testimonials" className="pt-20 lg:pt-40">
      <SectionHeading
        title={
          <>
            Trusted by <strong>health providers.</strong>
          </>
        }
        description="Hear from the doctors, pharmacists and administrators who use DocuHealth every day."
      />

      <div className="mt-14.5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Testimonial
          quote="“Before DocuHealth, we waited on paper files before every consultation. Now a patient’s history is on my screen when they walk in.”"
          name="Dr. [Name]"
          position="Medical Director, [Hospital name]"
          badgeClassName="bg-warning-500"
        />
        <Stat value="10+" label="Health providers" />
        <Testimonial
          quote="“Prescriptions reach us directly and clearly, already linked to the patient’s record. That means fewer errors at the counter and less time spent calling the clinic to confirm.”"
          name="[Name]"
          position="Pharmacist, [Pharmacy name]"
          badgeClassName="bg-fuchsia-600"
        />
        <Stat value="95%" label="Faster record access" />
        <Testimonial
          quote="“Claims used to mean endless back-and-forth. Having the record and the billing in one place has made our team’s work much simpler.”"
          name="[Name]"
          position="Administrator, [Clinic name]"
          badgeClassName="bg-blue-500"
        />
        <Stat value="15K+" label="Patient records unified" />
      </div>
    </LandingContainer>
  );
}
