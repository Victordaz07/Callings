import { useSecretarioStore } from "./store";
import { translate, type TranslationKey } from "./translations";

export function useT() {
  const lang = useSecretarioStore((s) => s.data.lang);
  return (key: TranslationKey) => translate(lang, key);
}

export function useLang() {
  return useSecretarioStore((s) => s.data.lang);
}
