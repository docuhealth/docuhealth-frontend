import { createFileRoute } from "@tanstack/react-router";
import { ResultReview } from "@/features/doctor/components/result-review";

export const Route = createFileRoute("/hospital/doctor/results")({
  component: ResultsPage,
});

function ResultsPage() {
  return (
    <div className="flex flex-col gap-6">
      <title>Results · DocuHealth</title>
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Results</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Lab results and scan reports waiting for your review.
        </p>
      </div>
      <ResultReview />
    </div>
  );
}
