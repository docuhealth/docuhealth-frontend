import { createFileRoute } from "@tanstack/react-router";
import { TestCatalogue } from "@/features/lab-scientist/components/test-catalogue";

// Every lab scientist reads it; only the lab's admin adds and edits tests (the page hides the
// buttons from the rest, and the API refuses them).
export const Route = createFileRoute("/hospital/lab-scientist/test-catalogue")({
  component: TestCataloguePage,
});

function TestCataloguePage() {
  return (
    <>
      <title>Test catalogue · DocuHealth</title>
      <TestCatalogue />
    </>
  );
}
