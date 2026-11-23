import { screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ApiDetails } from "@/features/landing/components/api-details";
import { Footer } from "@/features/landing/components/footer";
import { InfoPage, LegalSections } from "@/features/landing/components/info-page";
import { NewsList } from "@/features/landing/components/news-list";
import { NewsUpdatesSection } from "@/features/landing/components/news-update";
import { TermsPage } from "@/features/landing/components/terms-page";
import { privacyPolicy } from "@/features/landing/content/legal";
import { renderWithRouter } from "@/test/render";

function Terms() {
  const [audience, setAudience] = useState<"patient" | "hospital">("patient");
  return <TermsPage audience={audience} onAudienceChange={setAudience} />;
}

describe("Public site pages", () => {
  it("lays a legal document out as numbered sections with lists", async () => {
    renderWithRouter(
      <InfoPage title={privacyPolicy.title} lead={privacyPolicy.intro.join(" ")}>
        <LegalSections document={privacyPolicy} />
      </InfoPage>,
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Privacy Policy" }),
    ).toBeInTheDocument();
    const sharing = screen.getByRole("heading", {
      name: "6. Data Sharing With Partners",
    }).parentElement!;
    expect(within(sharing).getByRole("list")).toHaveTextContent("Care coordination");
    expect(
      within(sharing).getByText(
        "DocuHealth does not sell your personal information under any circumstances.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the patients' terms, then the hospitals'", async () => {
    const { user } = renderWithRouter(<Terms />);
    expect(
      await screen.findByRole("heading", { name: "3. Medication Use and Self-Medication" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Hospital" }));
    expect(await screen.findByRole("heading", { name: "1. Scope of Service" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "the API terms" })).toHaveAttribute(
      "href",
      "/api-terms-and-conditions",
    );
  });

  it("links the home page's news cards to their story on the News page", async () => {
    renderWithRouter(
      <>
        <NewsUpdatesSection />
        <NewsList />
      </>,
    );
    const link = await screen.findByRole("link", {
      name: "Read more: Corporate Affairs Commission (CAC) certification",
    });
    expect(link).toHaveAttribute("href", "/docuhealth-news#cac-certification");
    expect(
      screen.getByRole("article", { name: "DocuHealth Medical Summary API has been launched" }),
    ).toHaveAttribute("id", "medical-summary-api");
  });

  it("tells developers how to ask for the API", async () => {
    renderWithRouter(<ApiDetails />);
    expect(await screen.findByRole("link", { name: /Request access/ })).toHaveAttribute(
      "href",
      "mailto:admin@docuhealthservices.net?subject=DocuHealth%20API%20access",
    );
    expect(screen.getByText("CAC Certificate")).toBeInTheDocument();
  });

  it("links the footer to the pages, and says the newsletter isn't open yet", async () => {
    const { user } = renderWithRouter(<Footer />);
    expect(await screen.findByRole("link", { name: "Privacy policy" })).toHaveAttribute(
      "href",
      "/privacy-policy",
    );
    expect(screen.getByRole("link", { name: "About us" })).toHaveAttribute("href", "/#about");

    await user.type(screen.getByLabelText(/Your name/), "Ada");
    await user.type(screen.getByLabelText(/Email address/), "ada@example.com");
    await user.click(screen.getByRole("button", { name: /Subscribe now/ }));
    expect(
      await screen.findByText("Newsletter sign-up isn’t available yet. Please try again soon."),
    ).toBeInTheDocument();
  });
});
