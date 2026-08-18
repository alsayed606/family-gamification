import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS, store } from "../lib/storage";
import { DEFAULT_SETTINGS } from "../types";
import type { Settings } from "../types";

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await store.get<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
      setSettingsState({ ...DEFAULT_SETTINGS, ...s });
      setReady(true);
    })();
  }, []);

  const setSettings = useCallback((next: Settings) => {
    setSettingsState(next);
    store.set(STORAGE_KEYS.settings, next);
  }, []);

  return { settings, setSettings, ready };
}
