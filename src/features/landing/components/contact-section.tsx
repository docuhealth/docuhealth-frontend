import {
  CaretRightIcon,
  EnvelopeSimpleIcon,
  HandshakeIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { SectionHeading } from "@/features/landing/components/section-heading";
import { cn } from "@/lib/utils";

const contactChannels = [
  {
    icon: PhoneIcon,
    label: "CALL US",
    value: "+234 808 198 8860",
    description: "Speak to our team about DocuHealth and your Health Identification Number.",
    descriptionClassName: "max-w-80",
    action: {
      label: "Call Now",
      href: "tel:+2348081988860",
      isLink: false,
    },
  },
  {
    icon: EnvelopeSimpleIcon,
    label: "EMAIL US",
    value: "support@docuhealthservices.net",
    description: "Send us your questions and we will point you in the right direction.",
    descriptionClassName: "max-w-80",
    action: {
      label: "Email support",
      href: "mailto:support@docuhealthservices.net",
      isLink: false,
    },
  },
  {
    icon: HandshakeIcon,
    label: "PARTNERSHIPS AND COLLABORATIONS",
    value: "admin@docuhealthservices.net",
    description:
      "For hospitals, clinics, pharmacies and entities that want to partner with DocuHealth.",
    descriptionClassName: undefined,
    action: {
      label: "Partner with us",
      to: "/hospital/register",
      isLink: true,
    },
  },
] as const;

export function ContactSection() {
  return (
    <LandingContainer id="contact" className="py-20 lg:py-40">
      <SectionHeading
        title={
          <>
            Contact <strong>Us</strong>
          </>
        }
        description="Questions about DocuHealth, or ready to work with us? Reach the right team directly."
        descriptionClassName="max-w-120"
      />

      <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {contactChannels.map((channel) => {
          const Icon = channel.icon;
          return (
            <article
              key={channel.label}
              className="flex flex-col items-start rounded-lg bg-card p-5 shadow-card"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>

              <p className="mt-7.5 type-body-sm-medium text-fg-caption">{channel.label}</p>
              <p className="mt-2.5 type-title-lg wrap-anywhere text-fg-heading">{channel.value}</p>
              <p className={cn("mt-2 type-body-tight text-fg-body", channel.descriptionClassName)}>
                {channel.description}
              </p>

              <Button asChild className="mt-7.5 h-11.5 gap-2.5 rounded-md px-4">
                {channel.action.isLink ? (
                  <Link to={channel.action.to}>
                    {channel.action.label}
                    <CaretRightIcon data-icon="inline-end" className="size-3.5" />
                  </Link>
                ) : (
                  <a href={channel.action.href}>
                    {channel.action.label}
                    <CaretRightIcon data-icon="inline-end" className="size-3.5" />
                  </a>
                )}
              </Button>
            </article>
          );
        })}
      </div>
    </LandingContainer>
  );
}
