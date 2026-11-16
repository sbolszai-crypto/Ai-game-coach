import type { AppPersistedState } from "../types";

export const STORAGE_KEY = "gamecoach_ai_platform_v2";

export interface StorageRepository {
  readonly mode: "local" | "remote";
  readonly description: string;
  load(): AppPersistedState | null;
  save(state: AppPersistedState): void;
  clear(): void;
}

export class LocalStorageRepository implements StorageRepository {
  readonly mode = "local" as const;
  readonly description =
    "Salvataggio locale sul dispositivo (browser storage). Nessun dato personale viene inviato a database esterni di terze parti.";

  load(): AppPersistedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppPersistedState;
    } catch {
      return null;
    }
  }

  save(state: AppPersistedState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Gestione silenziosa in caso di spazio esaurito
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("gamecoach_ai_state_v1");
    } catch {
      // Ignore
    }
  }
}

export const storageRepository: StorageRepository = new LocalStorageRepository();
