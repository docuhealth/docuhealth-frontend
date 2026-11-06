import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section id="faq" className="w-full py-16 sm:py-20 lg:py-28">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 className="type-accent-h1 md:type-h2">
          <span className="font-normal">Frequently asked</span>{" "}
          <span className="font-bold">questions</span>
        </h2>
        <p className="mt-3 max-w-md type-body-sm-regular text-fg-body sm:type-body">
          See the answers to some of the frequent questions we&apos;re being asked about DocuHealth.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl lg:mt-16">
        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="type-body sm:type-accent-h3">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
