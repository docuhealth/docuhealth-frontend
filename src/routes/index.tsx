import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/features/landing/components/about-section";
import { ContactSection } from "@/features/landing/components/contact-section";
import { DataPrivacySection } from "@/features/landing/components/data-privacy-section";
import { DocuhealthCoreProduct } from "@/features/landing/components/docuhealth-coreproduct";
import { FaqSection } from "@/features/landing/components/faq-section";
import { Footer } from "@/features/landing/components/footer";
import { HeroPage } from "@/features/landing/components/hero-page";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { Navbar } from "@/features/landing/components/navbar";
import { NewsUpdatesSection } from "@/features/landing/components/news-update";
import { TrustedProvidersSection } from "@/features/landing/components/trusted-providers-section";
import { WhereWeOperateSection } from "@/features/landing/components/where-we-operate-section";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <title>DocuHealth</title>
      <Navbar />
      <main>
        <HeroPage />
        <AboutSection />
        <LandingContainer>
          <DocuhealthCoreProduct />
          <DataPrivacySection />
          <WhereWeOperateSection />
          <TrustedProvidersSection />
          <FaqSection />
          <NewsUpdatesSection />
          <ContactSection />
        </LandingContainer>
      </main>
      <Footer />
    </>
  );
}
