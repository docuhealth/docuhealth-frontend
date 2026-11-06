import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { SectionHeading } from "@/features/landing/components/section-heading";

const faqs = [
  {
    question: "Can DocuHealth be trusted?",
    answer:
      "Yes, DocuHealth prioritizes security, transparency, and compliance. We ensure all user data is handled safely and ethically.",
  },
  {
    question: "Can DocuHealth’s API be shared?",
    answer:
      "Yes, our healthcare API supports secure interoperability with certified electronic medical record (EMR) systems, laboratories, and insurance partners under strict consent protocols.",
  },
  {
    question: "Is DocuHealth NDPR compliant?",
    answer:
      "DocuHealth is fully compliant with the Nigeria Data Protection Regulation (NDPR) audited under the National Data Protection Commission (NDPC).",
  },
  {
    question: "Are my data safe and protected on DocuHealth?",
    answer:
      "All data is encrypted both in transit (TLS 1.3) and at rest (AES-256). Access is role-restricted and requires patient authorization.",
  },
  {
    question: "Is DocuHealth Services for everyone?",
    answer:
      "Yes, DocuHealth serves patients seeking lifelong control of their health records, as well as hospitals, clinics, diagnostic labs, pharmacies, and HMO payers.",
  },
] as const;

export function FaqSection() {
  return (
    <LandingContainer id="faq" className="pt-20 lg:pt-40">
      <SectionHeading
        title={
          <>
            Frequently asked <strong>questions</strong>
          </>
        }
        description="See the answers to some of the frequent questions we're being asked about DocuHealth."
      />

      <div className="mx-auto mt-10 max-w-175">
        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="py-0 first:border-t-0 last:border-b-0"
            >
              <AccordionTrigger className="py-4.75 type-title-sm">{faq.question}</AccordionTrigger>
              <AccordionContent className="pt-0 type-body">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </LandingContainer>
  );
}
