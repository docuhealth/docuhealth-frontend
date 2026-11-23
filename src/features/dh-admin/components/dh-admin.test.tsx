import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginForm } from "@/features/auth/components/login-form";
import { DhAdminOverview } from "@/features/dh-admin/components/dh-admin-overview";
import { DhAdminUsers } from "@/features/dh-admin/components/dh-admin-users";
import { FacilityApplications } from "@/features/dh-admin/components/facility-applications";
import { SubscriptionPlans } from "@/features/dh-admin/components/subscription-plans";
import { pickOption, renderWithRouter } from "@/test/render";
import { getPostLoginDestination, useAuthStore } from "@/stores/auth-store";

describe("DocuHealth admin", () => {
  it("logs a dhadmin in without an account type and sends them to the admin section", async () => {
    const { user } = renderWithRouter(<LoginForm audience="dhadmin" />);
    // Dev prefill may have filled the form in.
    const identifier = await screen.findByLabelText("Email address");
    await user.clear(identifier);
    await user.type(identifier, "dhadmin@docuhealthservices.net");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    // The test router has no /admin page; where the login sends them is the session's destination.
    await waitFor(() => expect(useAuthStore.getState().session).not.toBeNull());
    const { session } = useAuthStore.getState();
    expect(session?.user.role).toBe("dhadmin");
    expect(session?.accountType).toBeUndefined();
    expect(getPostLoginDestination(session)).toBe("/admin");
    useAuthStore.getState().clearSession();
  });

  it("shows the totals, the trends and where users are", async () => {
    const { user } = renderWithRouter(<DhAdminOverview />);
    expect(await screen.findByText("₦54,600")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(await screen.findByText("Registered users, monthly")).toBeInTheDocument();
    expect(screen.getByText("Lagos")).toBeInTheDocument();
    expect(screen.getByText("With dependants")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "Registered users period" }));
    await pickOption("Yearly");
    expect(await screen.findByText("Registered users, yearly")).toBeInTheDocument();
  });

  it("deactivates a hospital and searches individuals", async () => {
    const { user } = renderWithRouter(<DhAdminUsers />);
    const table = await screen.findByRole("table");
    expect(await within(table).findByText("Ada Okafor")).toBeInTheDocument();
    expect(within(table).getByText("Deactivated")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search users"), "bayo");
    await waitFor(() => expect(within(table).queryByText("Ada Okafor")).not.toBeInTheDocument());
    expect(within(table).getByText("Bayo Adeleke")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Hospitals/ }));
    await user.clear(screen.getByLabelText("Search users"));
    const row = (await within(table).findByText("Ikeja General")).closest("tr")!;
    // "None, None, None, None" isn't an address.
    expect(within(row).getByText("—")).toBeInTheDocument();
    await user.click(within(row).getByRole("button", { name: "Deactivate Ikeja General" }));
    const dialog = await screen.findByRole("dialog", { name: "Deactivate account" });
    await user.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    expect(await screen.findByText("Ikeja General is deactivated.")).toBeInTheDocument();
    expect(
      await within(row).findByRole("button", { name: "Activate Ikeja General" }),
    ).toBeInTheDocument();
  });

  it("approves one application and rejects another with a reason", async () => {
    const { user } = renderWithRouter(<FacilityApplications />);
    await user.click(await screen.findByRole("button", { name: /Mercy Hospital/ }));
    expect(await screen.findByRole("link", { name: /operating-licence\.pdf/ })).toHaveAttribute(
      "href",
      "https://files.example.com/licence-1.pdf",
    );
    await user.click(screen.getByRole("button", { name: "Approve Mercy Hospital’s application" }));
    const approve = await screen.findByRole("dialog", { name: "Approve application" });
    await user.click(within(approve).getByRole("button", { name: "Approve" }));
    expect(
      await screen.findByText("Mercy Hospital is approved. We’ve emailed them a login link."),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Mercy Hospital")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Clearview Diagnostics/ }));
    await user.click(
      await screen.findByRole("button", { name: "Reject Clearview Diagnostics’s application" }),
    );
    const reject = await screen.findByRole("dialog", { name: "Reject application" });
    await user.click(within(reject).getByRole("button", { name: "Reject" }));
    expect(
      await within(reject).findByText("Say why the application is rejected"),
    ).toBeInTheDocument();
    await user.type(within(reject).getByLabelText(/Reason/), "Licence expired");
    await user.click(within(reject).getByRole("button", { name: "Reject" }));
    expect(
      await screen.findByText("Clearview Diagnostics’s application is rejected."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Rejected/ }));
    await user.click(await screen.findByRole("button", { name: /Clearview Diagnostics/ }));
    expect(await screen.findByText("Licence expired")).toBeInTheDocument();
  });

  it("adds a plan and edits another", async () => {
    const { user } = renderWithRouter(<SubscriptionPlans />);
    expect(await screen.findByText("Hospital Standard")).toBeInTheDocument();
    expect(screen.getByText("Not on Paystack yet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New plan" }));
    const dialog = await screen.findByRole("dialog", { name: "New plan" });
    await user.click(within(dialog).getByRole("button", { name: "Add plan" }));
    expect(await within(dialog).findByText("Enter the plan’s name")).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/Name/), "Clinic Lite");
    await user.type(within(dialog).getByLabelText(/Price/), "12.5");
    await user.type(within(dialog).getByLabelText(/Description/), "For small clinics");
    await user.type(within(dialog).getByLabelText("Features"), "Up to 5 staff\nBasic reports");
    await user.click(within(dialog).getByRole("button", { name: "Add plan" }));
    expect(
      await within(dialog).findByText("Enter the price as a whole number of naira"),
    ).toBeInTheDocument();
    await user.clear(within(dialog).getByLabelText(/Price/));
    await user.type(within(dialog).getByLabelText(/Price/), "12000");
    await user.click(within(dialog).getByRole("button", { name: "Add plan" }));
    expect(await screen.findByText("The Clinic Lite plan is added.")).toBeInTheDocument();
    const plans = screen.getByRole("list", { name: "Plans" });
    expect(await within(plans).findByText("₦12,000")).toBeInTheDocument();
    expect(within(plans).getByText("Basic reports")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit the Individual plan" }));
    const edit = await screen.findByRole("dialog", { name: "Edit plan" });
    await user.clear(within(edit).getByLabelText(/Price/));
    await user.type(within(edit).getByLabelText(/Price/), "1500");
    await user.click(within(edit).getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("The Individual plan is updated.")).toBeInTheDocument();
    expect(await within(plans).findByText("₦1,500")).toBeInTheDocument();
  });
});
