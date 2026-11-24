import { CaretRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import heroImageUrl from "@/assets/images/hero-image.png";
import { Button } from "@/components/ui/button";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { motion } from "motion/react";
import { ease } from "@/features/landing/lib/motion";

const rise = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export function HeroPage() {
  return (
    <LandingContainer className="pb-20 lg:pb-40">
      <motion.section
        className="flex flex-col items-center pt-16 text-center lg:pt-20"
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
      >
        <motion.h1 variants={rise} className="type-h2 tracking-tight md:type-h1">
          Nigeria’s First <span className="text-primary">Centralized</span>
          <br className="hidden sm:inline" /> Healthcare Platform
        </motion.h1>

        <motion.p variants={rise} className="mt-8 max-w-160 type-lead text-fg-body">
          Connecting patients and healthcare providers through secure digital records for more
          accessible, connected care.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
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
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 48, scale: 0.97 },
            shown: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease } },
          }}
          className="relative mt-12 w-full"
        >
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
        </motion.div>
      </motion.section>
    </LandingContainer>
  );
}
