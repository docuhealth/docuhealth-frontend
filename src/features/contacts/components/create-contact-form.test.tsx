import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { env } from "@/env";
import { CreateContactForm } from "@/features/contacts/components/create-contact-form";
import { server } from "@/mocks/node";
import { renderWithProviders } from "@/test/render";

describe("CreateContactForm", () => {
  it("validates before submitting", async () => {
    const { user } = renderWithProviders(<CreateContactForm />);
    await user.click(screen.getByRole("button", { name: "Add contact" }));
    expect(await screen.findByText("At least 2 characters")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
  });

  it("creates a contact and resets the form", async () => {
    const { user } = renderWithProviders(<CreateContactForm />);
    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Add contact" }));

    expect(await screen.findByText("Ada Lovelace added")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("shows the backend's error message", async () => {
    server.use(
      http.post(`${env.VITE_API_URL}/contacts`, () =>
        HttpResponse.json({ message: "Email already exists" }, { status: 409 }),
      ),
    );
    const { user } = renderWithProviders(<CreateContactForm />);
    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Add contact" }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });
});
