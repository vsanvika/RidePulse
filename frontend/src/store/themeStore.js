import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
      },
    }),
    { name: "ridepulse-theme" }
  )
);

export function applyThemeClass(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
