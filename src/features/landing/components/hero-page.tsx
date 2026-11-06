import { CaretRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import heroImageUrl from "@/assets/images/hero-image.png";
import { Button } from "@/components/ui/button";

export function HeroPage() {
  return (
    <section className="flex flex-col items-center px-4 pt-10 pb-16 text-center sm:px-6 sm:pt-14 sm:pb-20 md:pt-16">
      <h1 className="max-w-4xl type-h2 md:type-h1">
        Nigeria’s First <span className="text-primary">Centralized</span>
        <br className="hidden sm:inline" /> Healthcare Platform
      </h1>

      <p className="mt-5 max-w-xl type-body text-fg-body">
        Connecting patients and healthcare providers through secure digital records for more
        accessible, connected care.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="h-11 px-5">
          <Link to="/hospital/register">Partner with Us</Link>
        </Button>

        <Button asChild variant="outline" className="h-11 bg-card px-5">
          <Link to="/register" search={{ type: "individual" }}>
            Get your HIN
            <CaretRightIcon data-icon="inline-end" className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="relative mt-12 w-full md:mt-14">
        <img
          src={heroImageUrl}
          alt="DocuHealth healthcare providers and receptionist dashboard"
          className="w-full"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-background via-background/75 to-transparent sm:h-40 md:h-52"
        />
      </div>
    </section>
  );
}
