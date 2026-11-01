import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { resetMockData } from "@/mocks/handlers";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";

// jsdom has no matchMedia; sonner, the theme store and the sidebar need it.
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

// Any request without a handler fails the test instead of hitting the network.
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockData();
  useAuthStore.getState().clearSession();
});
afterAll(() => server.close());
