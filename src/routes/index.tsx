import { createFileRoute, Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logos/logo.svg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="grid min-h-svh place-content-center justify-items-center gap-4 p-6 text-center">
      <title>DocuHealth</title>
      <img src={logoUrl} alt="" width={90} height={84} />
      <h1 className="type-h1">DocuHealth</h1>
      <Link to="/design-system" className="text-primary underline underline-offset-4">
        View the design system
      </Link>
    </main>
  );
}
