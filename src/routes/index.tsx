import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/features/landing/components/about-section";
import { DataPrivacySection } from "@/features/landing/components/data-privacy-section";
import { DocuhealthCoreProduct } from "@/features/landing/components/docuhealth-coreproduct";
import { HeroPage } from "@/features/landing/components/hero-page";
import { WhereWeOperateSection } from "@/features/landing/components/where-we-operate-section";
import { ContactSection } from "@/features/landing/components/contact-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { Footer } from "@/features/landing/components/footer";
import { Navbar } from "@/features/landing/components/navbar";
import { NewsUpdatesSection } from "@/features/landing/components/news-update";
import { TrustedProvidersSection } from "@/features/landing/components/trusted-providers-section";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    // The design sets Inter at its default optical size at every text size.
    <div className="[font-optical-sizing:none]">
      <Navbar />
      <main>
        <title>DocuHealth</title>
        <HeroPage />
        <AboutSection />
        <DocuhealthCoreProduct />
        <DataPrivacySection />
        <WhereWeOperateSection />
        <NewsUpdatesSection />
        <TrustedProvidersSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
