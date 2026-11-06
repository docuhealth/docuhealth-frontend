import docubillImageUrl from "@/assets/images/core-product-docubill.png";
import patientsImageUrl from "@/assets/images/core-product-patients.png";
import providerImageUrl from "@/assets/images/core-product-provider.png";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { SectionHeading } from "@/features/landing/components/section-heading";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  image: string;
  alt: string;
  imageClassName?: string;
  /** Space between the image and the text. */
  bodyClassName: string;
  audience: string;
  name: string;
  tagline: string;
  description: string;
};

function ProductCard({
  image,
  alt,
  imageClassName,
  bodyClassName,
  audience,
  name,
  tagline,
  description,
}: ProductCardProps) {
  return (
    <article className="flex flex-1 flex-col rounded-lg bg-card px-4 pb-5 shadow-card sm:px-6">
      <img src={image} alt={alt} className={cn("w-full", imageClassName)} />
      <div className={bodyClassName}>
        <p className="type-body-sm-medium text-primary uppercase">{audience}</p>
        <h3 className="mt-3 type-title text-fg-heading">
          <strong>{name}:</strong> {tagline}
        </h3>
        <p className="mt-2.5 type-body-tight text-fg-body">{description}</p>
      </div>
    </article>
  );
}

export function DocuhealthCoreProduct() {
  return (
    <LandingContainer id="products" className="pt-20 lg:pt-40">
      <SectionHeading
        title={
          <>
            DocuHealth <strong>Core Product</strong>
          </>
        }
        description="Explore DocuHealth’s core products, their features, and how they help simplify healthcare management."
      />

      <div className="mx-auto mt-12 grid max-w-290 grid-cols-1 gap-5 lg:grid-cols-2">
        <ProductCard
          image={providerImageUrl}
          alt="Patient record timeline for providers"
          imageClassName="rounded-b-lg"
          bodyClassName="mt-10"
          audience="For Providers"
          name="DocuCore"
          tagline="The clinical backbone of Hospitals, clinics, diagnostic centres and Local Pharmacies"
          description="Keep one unified patient record and documentation across your facility. Share medical summaries and lab results securely with other providers, and manage billing and insurance claims in the same place. Communicate seamlessly with pharmacies and other care teams."
        />

        <div className="flex flex-col gap-5">
          <ProductCard
            image={patientsImageUrl}
            alt="Patient discharge record and lab result permissions"
            bodyClassName="mt-8"
            audience="For Patients"
            name="DocuCore"
            tagline="Your lifelong health companion."
            description="View your results and summaries, track medications and appointments, and use secure messaging and telehealth. You decide who sees your health information."
          />
          <ProductCard
            image={docubillImageUrl}
            alt="Claims overview analytics chart"
            bodyClassName="mt-8"
            audience="Payer Platform"
            name="DocuBill"
            tagline="For insurers, HMOs and direct-pay patients.."
            description="Verify and adjudicate claims in real time. Keep reimbursements transparent and detect fraud early. Use analytics dashboards to optimize your financial performance and services."
          />
        </div>
      </div>
    </LandingContainer>
  );
}
