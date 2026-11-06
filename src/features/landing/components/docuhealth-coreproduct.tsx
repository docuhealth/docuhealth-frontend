import docubillImageUrl from "@/assets/images/core-product-docubill.png";
import patientsImageUrl from "@/assets/images/core-product-patients.png";
import providerImageUrl from "@/assets/images/core-product-provider.png";

export function DocuhealthCoreProduct() {
  return (
    <section id="products" className="w-full py-16 sm:py-20 lg:py-28">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 className="type-accent-h1 md:type-h2">
          <span className="font-normal">DocuHealth</span>{" "}
          <span className="font-bold">Core Product</span>
        </h2>
        <p className="mt-3 max-w-md type-body-sm-regular text-fg-body sm:type-body">
          Explore DocuHealth’s core products, their features, and how they help simplify healthcare
          management.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-2">
        {/* Left column: Providers */}
        <article className="flex flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
          <div className="overflow-hidden rounded-xl">
            <img
              src={providerImageUrl}
              alt="Patient record timeline for providers"
              className="w-full object-cover"
            />
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <p className="type-label text-primary">For Providers</p>
            <h3 className="type-accent-h3 text-fg-heading">
              <span className="font-bold">DocuCore:</span>{" "}
              <span className="font-medium">
                The clinical backbone of Hospitals, clinics, diagnostic centres and Local Pharmacies
              </span>
            </h3>
            <p className="type-body-sm-regular text-fg-body">
              Keep one unified patient record and documentation across your facility. Share medical
              summaries and lab results securely with other providers, and manage billing and
              insurance claims in the same place. Communicate seamlessly with pharmacies and other
              care teams.
            </p>
          </div>
        </article>

        {/* Right column: Patients & Payer Platform */}
        <div className="flex flex-col gap-6">
          <article className="flex flex-1 flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <div className="overflow-hidden rounded-xl border border-line/60">
              <img
                src={patientsImageUrl}
                alt="Patient discharge record and lab result permissions"
                className="w-full object-cover"
              />
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <p className="type-label text-primary">For Patients</p>
              <h3 className="type-accent-h3 text-fg-heading">
                <span className="font-bold">DocuCore:</span>{" "}
                <span className="font-medium">Your lifelong health companion.</span>
              </h3>
              <p className="type-body-sm-regular text-fg-body">
                View your results and summaries, track medications and appointments, and use secure
                messaging and telehealth. You decide who sees your health information.
              </p>
            </div>
          </article>

          <article className="flex flex-1 flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <div className="overflow-hidden rounded-xl border border-line/60">
              <img
                src={docubillImageUrl}
                alt="Claims overview analytics chart"
                className="w-full object-cover"
              />
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <p className="type-label text-primary">Payer Platform</p>
              <h3 className="type-accent-h3 text-fg-heading">
                <span className="font-bold">DocuBill:</span>{" "}
                <span className="font-medium">For insurers, HMOs and direct-pay patients..</span>
              </h3>
              <p className="type-body-sm-regular text-fg-body">
                Verify and adjudicate claims in real time. Keep reimbursements transparent and
                detect fraud early. Use analytics dashboards to optimize your financial performance
                and services.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
