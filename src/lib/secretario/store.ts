import { create } from "zustand";
import type { SecretarioData, SecretarioTab } from "./types";
import { defaultSecretarioData } from "./defaults";

type SecretarioStore = {
  data: SecretarioData;
  hydrated: boolean;
  currentTab: SecretarioTab;
  toast: string | null;
  hydrate: (data: SecretarioData) => void;
  apply: (fn: (data: SecretarioData) => SecretarioData) => void;
  setTab: (tab: SecretarioTab) => void;
  showToast: (msg: string) => void;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useSecretarioStore = create<SecretarioStore>((set) => ({
  data: defaultSecretarioData(),
  hydrated: false,
  currentTab: "hoy",
  toast: null,
  hydrate: (data) => set({ data, hydrated: true }),
  apply: (fn) => set((state) => ({ data: fn(state.data) })),
  setTab: (tab) => set({ currentTab: tab }),
  showToast: (msg) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: msg });
    toastTimer = setTimeout(() => set({ toast: null }), 1800);
  },
}));
