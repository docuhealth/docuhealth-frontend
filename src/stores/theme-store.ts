import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// The inline script in index.html applies the saved theme before first paint;
// keep its storage key ("theme") in sync with this one.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "theme" },
  ),
);

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && media().matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Call once at startup: applies the theme now and whenever it or the OS setting changes. */
export function syncTheme() {
  applyTheme(useThemeStore.getState().theme);
  useThemeStore.subscribe((s) => applyTheme(s.theme));
  media().addEventListener("change", () => applyTheme(useThemeStore.getState().theme));
}
