import { CaretRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import heroImageUrl from "@/assets/images/hero-image.png";
import { Button } from "@/components/ui/button";
import { LandingContainer } from "@/features/landing/components/landing-container";

export function HeroPage() {
  return (
    <LandingContainer className="pb-20 lg:pb-40">
      <section className="flex flex-col items-center pt-16 text-center lg:pt-20">
        <h1 className="type-h2 tracking-tight md:type-h1">
          Nigeria’s First <span className="text-primary">Centralized</span>
          <br className="hidden sm:inline" /> Healthcare Platform
        </h1>

        <p className="mt-8 max-w-160 type-lead text-fg-body">
          Connecting patients and healthcare providers through secure digital records for more
          accessible, connected care.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild className="h-11.5 rounded-md px-4">
            <Link to="/hospital/register">Partner with Us</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11.5 gap-2.5 rounded-md bg-card px-4 text-fg-heading"
          >
            <Link to="/register" search={{ type: "individual" }}>
              Get your HIN
              <CaretRightIcon data-icon="inline-end" className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="relative mt-12 w-full">
          <img
            src={heroImageUrl}
            alt="DocuHealth healthcare providers and receptionist dashboard"
            width={1280}
            height={700}
            className="w-full"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background from-5% to-transparent sm:h-48"
          />
        </div>
      </section>
    </LandingContainer>
  );
}
