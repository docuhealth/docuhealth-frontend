import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="grid min-h-svh place-content-center justify-items-center gap-4 p-6 text-center">
      <title>DocuHealth</title>
      <img src="/logo.png" alt="" width={84} height={80} />
      <h1 className="type-h1">DocuHealth</h1>
    </main>
  );
}
