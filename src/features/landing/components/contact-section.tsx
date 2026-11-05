import {
  CaretRightIcon,
  EnvelopeSimpleIcon,
  HandshakeIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const contactChannels = [
  {
    icon: PhoneIcon,
    label: "CALL US",
    value: "+234 808 198 8860",
    description: "Speak to our team about DocuHealth and your Health Identification Number.",
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
    action: {
      label: "Partner with us",
      to: "/hospital/register",
      isLink: true,
    },
  },
] as const;

export function ContactSection() {
  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-11/12 px-4 py-16 sm:py-20 lg:py-28 xl:px-6"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 className="type-accent-h1 md:type-h2">
          <span className="font-normal">Contact</span> <span className="font-bold">Us</span>
        </h2>
        <p className="mt-3 max-w-md type-body-sm-regular text-fg-body sm:type-body">
          Questions about DocuHealth, or ready to work with us? Reach the right team directly.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {contactChannels.map((channel) => {
          const Icon = channel.icon;
          return (
            <article
              key={channel.label}
              className="flex min-h-[300px] flex-col justify-between rounded-2xl border border-line bg-card p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7"
            >
              <div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5.5" />
                </span>

                <div className="mt-6">
                  <p className="type-label text-fg-caption">{channel.label}</p>
                  <p className="mt-2 type-accent-h3 font-bold text-balance text-fg-heading">
                    {channel.value}
                  </p>
                  <p className="mt-3 type-body-sm-regular text-fg-body">{channel.description}</p>
                </div>
              </div>

              <div className="mt-8">
                {channel.action.isLink ? (
                  <Button asChild className="h-10 px-4">
                    <Link to={channel.action.to}>
                      {channel.action.label}
                      <CaretRightIcon data-icon="inline-end" className="size-3.5" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="h-10 px-4">
                    <a href={channel.action.href}>
                      {channel.action.label}
                      <CaretRightIcon data-icon="inline-end" className="size-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
