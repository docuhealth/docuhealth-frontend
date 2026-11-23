import { CaretRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Prose } from "@/features/landing/components/info-page";
import { api } from "@/features/landing/content/pages";

/** What the DocuHealth API is for, how to ask for access, and its terms. */
export function ApiDetails() {
  return (
    <>
      <Prose blocks={api.body} />
      <section className="flex flex-col gap-4">
        <h2 className="type-title-sm text-fg-heading">What the API does</h2>
        <Prose blocks={[api.uses]} />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="type-title-sm text-fg-heading">How to request access</h2>
        <p className="type-body text-fg-body">
          Email{" "}
          <a
            href={`mailto:${api.requestEmail}`}
            className="text-primary underline underline-offset-2"
          >
            {api.requestEmail}
          </a>{" "}
          with:
        </p>
        <Prose blocks={[api.requestDocuments]} />
        <Button asChild className="h-12 w-fit gap-2 px-5 type-heading-sm">
          <a href={`mailto:${api.requestEmail}?subject=DocuHealth%20API%20access`}>
            <EnvelopeSimpleIcon data-icon="inline-start" />
            Request access
          </a>
        </Button>
      </section>
      <aside className="flex flex-col gap-3 rounded-xl border bg-card p-6">
        <h2 className="type-title-sm text-fg-heading">API Terms & Conditions</h2>
        <p className="type-body text-fg-body">
          Before integrating, please review the rules governing access to and use of the DocuHealth
          After Visit Summary (AVS) API.
        </p>
        <Link
          to="/api-terms-and-conditions"
          className="inline-flex w-fit items-center gap-2 type-body-sm-tight-semibold text-primary hover:underline"
        >
          Read the API terms
          <CaretRightIcon className="size-3.5" />
        </Link>
      </aside>
    </>
  );
}
