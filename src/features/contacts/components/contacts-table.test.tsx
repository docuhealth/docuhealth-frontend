import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Contact } from "@/features/contacts/api/contacts-api";
import { ContactsTable } from "@/features/contacts/components/contacts-table";
import { renderWithProviders } from "@/test/render";

const contacts: Contact[] = [
  {
    id: "1",
    name: "Zara",
    email: "zara@example.com",
    phone: null,
    createdAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "2",
    name: "Abe",
    email: "abe@example.com",
    phone: "123",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const firstColumn = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);

describe("ContactsTable", () => {
  it("renders a row per contact, with a dash for missing phones", () => {
    renderWithProviders(<ContactsTable contacts={contacts} />);
    expect(firstColumn()).toEqual(["Zara", "Abe"]);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("sorts by name when the header is clicked", async () => {
    const { user } = renderWithProviders(<ContactsTable contacts={contacts} />);
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(firstColumn()).toEqual(["Abe", "Zara"]);
  });

  it("shows an empty state", () => {
    renderWithProviders(<ContactsTable contacts={[]} />);
    expect(screen.getByText("No contacts yet.")).toBeInTheDocument();
  });
});
