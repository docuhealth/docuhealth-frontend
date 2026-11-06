import { BuildingOfficeIcon, HospitalIcon, PillIcon } from "@phosphor-icons/react";

export function TrustedProvidersSection() {
  return (
    <section id="testimonials" className="w-full py-16 sm:py-20 lg:py-28">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 className="type-accent-h1 md:type-h2">
          <span className="font-normal">Trusted by</span>{" "}
          <span className="font-bold">health providers.</span>
        </h2>
        <p className="mt-3 max-w-md type-body-sm-regular text-fg-body sm:type-body">
          Hear from the doctors, pharmacists and administrators who use DocuHealth every day.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {/* Row 1, Col 1: Testimonial 1 */}
        <article className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-line bg-card p-6 shadow-xs">
          <p className="type-body-sm-regular leading-relaxed text-fg-body">
            “Before DocuHealth, we waited on paper files before every consultation. Now a
            patient&apos;s history is on my screen when they walk in.”
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
              <HospitalIcon className="size-5" />
            </span>
            <div>
              <p className="type-body-sm font-bold text-fg-heading">Dr. [Name]</p>
              <p className="type-caption text-fg-caption">Medical Director, [Hospital name]</p>
            </div>
          </div>
        </article>

        {/* Row 1, Col 2: Stat 1 */}
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-fg-heading p-6 text-center text-white shadow-xs">
          <p className="type-h1 font-bold text-white">10+</p>
          <p className="mt-2 type-body-sm text-white/80">Health providers</p>
        </div>

        {/* Row 1, Col 3: Testimonial 2 */}
        <article className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-line bg-card p-6 shadow-xs">
          <p className="type-body-sm-regular leading-relaxed text-fg-body">
            “Prescriptions reach us directly and clearly, already linked to the patient&apos;s
            record. That means fewer errors at the counter and less time spent calling the clinic to
            confirm.”
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-white">
              <PillIcon className="size-5" />
            </span>
            <div>
              <p className="type-body-sm font-bold text-fg-heading">[Name]</p>
              <p className="type-caption text-fg-caption">Pharmacist, [Pharmacy name]</p>
            </div>
          </div>
        </article>

        {/* Row 2, Col 1: Stat 2 */}
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-fg-heading p-6 text-center text-white shadow-xs">
          <p className="type-h1 font-bold text-white">95%</p>
          <p className="mt-2 type-body-sm text-white/80">Faster record access</p>
        </div>

        {/* Row 2, Col 2: Testimonial 3 */}
        <article className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-line bg-card p-6 shadow-xs">
          <p className="type-body-sm-regular leading-relaxed text-fg-body">
            “Claims used to mean endless back-and-forth. Having the record and the billing in one
            place has made our team&apos;s work much simpler.”
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
              <BuildingOfficeIcon className="size-5" />
            </span>
            <div>
              <p className="type-body-sm font-bold text-fg-heading">[Name]</p>
              <p className="type-caption text-fg-caption">Administrator, [Clinic name]</p>
            </div>
          </div>
        </article>

        {/* Row 2, Col 3: Stat 3 */}
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-fg-heading p-6 text-center text-white shadow-xs">
          <p className="type-h1 font-bold text-white">15K+</p>
          <p className="mt-2 type-body-sm text-white/80">Patient records unified</p>
        </div>
      </div>
    </section>
  );
}
