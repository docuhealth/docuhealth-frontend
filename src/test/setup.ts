import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";

// jsdom has no matchMedia; sonner and the sidebar need it.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom has no elementFromPoint; the verification-code input (input-otp) calls it.
document.elementFromPoint = () => null;

// jsdom has no ResizeObserver; Radix (e.g. the checkbox) measures elements with it.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Any request without a handler fails the test instead of hitting the network.
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  useAuthStore.getState().clearSession();
});
afterAll(() => server.close());
