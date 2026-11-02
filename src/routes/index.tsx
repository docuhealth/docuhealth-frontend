import { createFileRoute, Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logos/logo.svg";
import { LandingContainer } from "@/features/landing/components/landing-container";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <title>DocuHealth</title>
      <LandingContainer className="flex flex-col items-center gap-4 text-center">
        <img src={logoUrl} alt="" width={90} height={84} />
        <h1 className="type-h1">DocuHealth</h1>
        <Link to="/design-system" className="text-primary underline underline-offset-4">
          View the design system
        </Link>
      </LandingContainer>

      <LandingContainer>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-80 bg-black"></div>
          <div className="h-80 bg-black"></div>
          <div className="h-80 bg-black"></div>
        </div>
      </LandingContainer>
    </main>
  );
}
