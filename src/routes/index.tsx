import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/features/landing/components/about-section";
import { DataPrivacySection } from "@/features/landing/components/data-privacy-section";
import { DocuhealthCoreProduct } from "@/features/landing/components/docuhealth-coreproduct";
import { HeroPage } from "@/features/landing/components/hero-page";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { WhereWeOperateSection } from "@/features/landing/components/where-we-operate-section";
import { ContactSection } from "@/features/landing/components/contact-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { Footer } from "@/features/landing/components/footer";
import { NewsUpdatesSection } from "@/features/landing/components/news-update";
import { TrustedProvidersSection } from "@/features/landing/components/trusted-providers-section";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <main>
        <title>DocuHealth</title>
        <LandingContainer className="pb-0 lg:pb-0">
          <HeroPage />
        </LandingContainer>
        <AboutSection />
        <DocuhealthCoreProduct />
        <DataPrivacySection />
        <WhereWeOperateSection />
        <TrustedProvidersSection />
        <FaqSection />
        <NewsUpdatesSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
