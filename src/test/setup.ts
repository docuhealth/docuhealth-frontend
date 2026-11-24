import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { clearAllDrafts } from "@/lib/form-drafts";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";

// The suite runs its files in parallel, and a screen that makes several requests can take more
// than the default second to settle under that load, so find* and waitFor wait up to three.
configure({ asyncUtilTimeout: 3000 });

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

// jsdom has no IntersectionObserver; the landing page's scroll animations use it. Everything
// counts as in view at once, so animated content shows straight away.
class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  private readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver ??=
  IntersectionObserverStub as unknown as typeof IntersectionObserver;

// Any request without a handler fails the test instead of hitting the network.
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  useAuthStore.getState().clearSession();
  // Saved form drafts would otherwise carry one test's typing into the next.
  clearAllDrafts();
});
afterAll(() => server.close());
