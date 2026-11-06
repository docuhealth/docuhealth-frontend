import { useState } from "react";
import {
  CaretRightIcon,
  InstagramLogoIcon,
  TwitterLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LandingContainer } from "@/features/landing/components/landing-container";

const companyLinks = [
  { label: "About us", href: "#about" },
  { label: "Mission", href: "#about" },
  { label: "Vision", href: "#about" },
  { label: "DocuHealth API", href: "#products" },
  { label: "Legal Notice", href: "#" },
  { label: "Terms and Conditions", href: "#" },
  { label: "Privacy policy", href: "#" },
] as const;

/** Phosphor's Facebook mark is round; the design uses the square one. */
function FacebookSquareIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-6">
      <path d="M22 3.5v17c0 .8-.7 1.5-1.5 1.5H16v-7.7h2.6l.4-3H16V9.4c0-.9.2-1.5 1.5-1.5H19V5.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.3h-2.6v3H13V22H3.5C2.7 22 2 21.3 2 20.5v-17C2 2.7 2.7 2 3.5 2h17c.8 0 1.5.7 1.5 1.5z" />
    </svg>
  );
}

const socialLinks = [
  { icon: <FacebookSquareIcon />, href: "https://facebook.com", label: "Facebook" },
  {
    icon: <InstagramLogoIcon className="size-6" />,
    href: "https://instagram.com",
    label: "Instagram",
  },
  {
    icon: <YoutubeLogoIcon weight="fill" className="size-6" />,
    href: "https://youtube.com",
    label: "YouTube",
  },
  {
    icon: <TwitterLogoIcon weight="fill" className="size-6" />,
    href: "https://x.com",
    label: "Twitter",
  },
  {
    icon: <TwitterLogoIcon weight="fill" className="size-6" />,
    href: "https://x.com",
    label: "Twitter",
  },
];

const newsletterFieldClassName =
  "flex h-14 flex-col justify-center rounded-lg border border-line bg-card px-3 transition-colors focus-within:border-primary";
const newsletterInputClassName =
  "h-auto rounded-none border-0 bg-transparent p-0 type-body text-fg-heading shadow-none focus-visible:ring-0";

export function Footer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setName("");
      setEmail("");
      toast.success("Thank you for subscribing to our newsletter!");
    }, 600);
  }

  return (
    <footer className="bg-fg-heading text-white">
      <LandingContainer className="py-16 lg:py-25">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[392px_1fr] lg:gap-32">
          <div className="rounded-xl bg-card p-6 text-fg-heading">
            <h3 className="type-title-xl">
              Subscribe to our
              <br />
              <strong>Newsletter</strong>
            </h3>

            <p className="mt-3 pr-2 type-body-sm-regular text-fg-body">
              Subscribe to our Newsletter to always be the first to receive DocuHealth important
              updates right in your email, we promise not to ever spam you
            </p>

            <form onSubmit={handleSubscribe} className="mt-6 flex flex-col gap-4">
              <label htmlFor="newsletter-name" className={newsletterFieldClassName}>
                <span className="type-caption text-fg-caption uppercase">Your name</span>
                <Input
                  id="newsletter-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={newsletterInputClassName}
                  required
                />
              </label>
              <label htmlFor="newsletter-email" className={newsletterFieldClassName}>
                <span className="type-caption text-fg-caption uppercase">Email address</span>
                <Input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={newsletterInputClassName}
                  required
                />
              </label>
              <Button
                type="submit"
                loading={isSubmitting}
                className="mt-2 h-11.5 w-fit gap-2.5 rounded-md px-4"
              >
                <span>Subscribe now</span>
                <CaretRightIcon data-icon="inline-end" className="size-3.5" />
              </Button>
            </form>
          </div>

          <div className="flex flex-col justify-between gap-12">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              <div>
                <p className="type-caption-medium text-footer-accent uppercase">Company</p>
                <ul className="mt-5.5 flex flex-col gap-2">
                  {companyLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="type-body-sm-regular text-white transition-colors hover:text-white/70"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="type-caption-medium text-footer-accent uppercase">Contact us</p>
                <div className="mt-5.5 flex flex-col gap-2.5">
                  <a
                    href="tel:+2348081988860"
                    className="type-body-sm-regular text-white transition-colors hover:text-white/70"
                  >
                    +2348081988860
                  </a>
                  <a
                    href="mailto:support@docuhealthservices.net"
                    className="type-body-sm-regular break-all text-white transition-colors hover:text-white/70"
                  >
                    support@docuhealthservices.net
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 lg:mt-27">
                  {socialLinks.map((social, index) => (
                    <a
                      key={`${social.label}-${index}`}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="flex size-12.5 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white hover:bg-white/10"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-75 type-body-sm-regular text-white/80 italic">
                Our certification and compliance credentials, so you can see the standards we work
                to.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <img
                  src="https://res.cloudinary.com/drhfrgahv/image/upload/v1778081304/WhatsApp_Image_2026-05-04_at_08.37.36_g8lo95.jpg"
                  alt="DocuHealth Federal Republic of Nigeria Certificate"
                  width={108}
                  height={80}
                  className="h-20 w-27 bg-white object-cover"
                />
                <img
                  src="https://res.cloudinary.com/drhfrgahv/image/upload/v1762777826/docuhealth_fhir_zdtw2p.jpg"
                  alt="DocuHealth FHIR"
                  width={135}
                  height={80}
                  className="h-20 w-34 bg-white object-contain"
                />
                <img
                  src="https://res.cloudinary.com/drhfrgahv/image/upload/v1762777839/docuhealth_ndpr_audit_lwqlq8.jpg"
                  alt="DocuHealth NDPR Audit"
                  width={80}
                  height={80}
                  className="size-20 bg-white object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </LandingContainer>
    </footer>
  );
}
