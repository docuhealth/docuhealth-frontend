import { useState } from "react";
import {
  CaretRightIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const companyLinks = [
  { label: "About us", href: "#about" },
  { label: "Mission", href: "#about" },
  { label: "Vision", href: "#about" },
  { label: "DocuHealth API", href: "#products" },
  { label: "Legal Notice", href: "#" },
  { label: "Terms and Conditions", href: "#" },
  { label: "Privacy policy", href: "#" },
] as const;

const socialLinks = [
  {
    icon: FacebookLogoIcon,
    href: "https://facebook.com",
    label: "Facebook",
  },
  {
    icon: InstagramLogoIcon,
    href: "https://instagram.com",
    label: "Instagram",
  },
  {
    icon: YoutubeLogoIcon,
    href: "https://youtube.com",
    label: "YouTube",
  },
  {
    icon: XLogoIcon,
    href: "https://x.com",
    label: "X (Twitter)",
  },
  {
    icon: LinkedinLogoIcon,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
] as const;

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
      <div className="mx-auto w-full max-w-11/12 px-4 py-16 sm:py-20 lg:py-24 xl:px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr] xl:gap-16">
          {/* Left Column: White Newsletter Card */}
          <div className="rounded-2xl border border-line/20 bg-white p-6 text-fg-heading shadow-xl sm:p-8">
            <h3 className="type-accent-h2 leading-tight">
              <span className="font-normal text-fg-heading">Subscribe to our</span>
              <br />
              <span className="font-bold text-fg-heading">Newsletter</span>
            </h3>

            <p className="mt-3 type-body-sm-regular text-fg-body">
              Subscribe to our Newsletter to always be the first to receive DocuHealth important
              updates right in your email, we promise not to ever spam you
            </p>

            <form onSubmit={handleSubscribe} className="mt-6 flex flex-col gap-4">
              <Input
                type="text"
                placeholder="YOUR NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-lg border-line bg-surface px-4 type-body-sm text-fg-heading placeholder:type-caption placeholder:text-fg-caption focus-visible:border-primary"
                required
              />
              <Input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-lg border-line bg-surface px-4 type-body-sm text-fg-heading placeholder:type-caption placeholder:text-fg-caption focus-visible:border-primary"
                required
              />
              <Button type="submit" loading={isSubmitting} className="mt-1 h-12 w-fit px-6">
                <span>Subscribe now</span>
                <CaretRightIcon data-icon="inline-end" className="size-3.5" />
              </Button>
            </form>
          </div>

          {/* Right Column: Navigation Links, Contact, and Credentials */}
          <div className="flex flex-col justify-between gap-12">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              {/* Company Links */}
              <div>
                <p className="type-label text-footer-accent">COMPANY</p>
                <ul className="mt-6 flex flex-col gap-3">
                  {companyLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="type-body-sm text-white/80 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Us & Socials */}
              <div>
                <p className="type-label text-footer-accent">CONTACT US</p>
                <div className="mt-6 flex flex-col gap-2">
                  <a
                    href="tel:+2348081988860"
                    className="type-body-sm text-white/80 transition-colors hover:text-white"
                  >
                    +2348081988860
                  </a>
                  <a
                    href="mailto:support@docuhealthservices.net"
                    className="type-body-sm text-white/80 transition-colors hover:text-white"
                  >
                    support@docuhealthservices.net
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={social.label}
                        className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-all hover:border-white hover:bg-white/10 hover:text-white"
                      >
                        <Icon className="size-4.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Compliance Credentials & Images */}
            <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xs type-caption text-white/60 italic">
                Our certification and compliance credentials, so you can see the standards we work
                to.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <img
                  src="https://res.cloudinary.com/drhfrgahv/image/upload/v1778081304/WhatsApp_Image_2026-05-04_at_08.37.36_g8lo95.jpg"
                  alt="DocuHealth Federal Republic of Nigeria Certificate"
                  width={320}
                  height={240}
                  className="h-20 w-auto rounded-lg border border-white/20 bg-white object-contain p-1 shadow-md sm:h-24 md:h-28"
                />
                <img
                  src="https://res.cloudinary.com/drhfrgahv/image/upload/v1762777826/docuhealth_fhir_zdtw2p.jpg"
                  alt="DocuHealth FHIR"
                  width={240}
                  height={180}
                  className="h-20 w-auto rounded-lg bg-white object-contain p-2 shadow-md sm:h-24 md:h-28"
                />
                <img
                  src="https://res.cloudinary.com/drhfrgahv/image/upload/v1762777839/docuhealth_ndpr_audit_lwqlq8.jpg"
                  alt="DocuHealth NDPR Audit"
                  width={160}
                  height={120}
                  className="h-20 w-auto rounded-lg bg-white object-contain p-2 shadow-md sm:h-24 md:h-28"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
