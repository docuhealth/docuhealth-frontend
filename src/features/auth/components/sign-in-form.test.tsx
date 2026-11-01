import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithProviders } from "@/test/render";

describe("SignInForm", () => {
  it("validates before calling the API", async () => {
    const { user } = renderWithProviders(<SignInForm onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
  });

  it("stores the session and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    const { user } = renderWithProviders(<SignInForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(useAuthStore.getState().session?.user.email).toBe("admin@example.com");
  });

  it("shows the API's error on wrong credentials", async () => {
    const { user } = renderWithProviders(<SignInForm onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong email or password");
  });
});
