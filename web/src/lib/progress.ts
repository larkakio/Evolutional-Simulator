const STORAGE_KEY = "evosim_unlocked_level_v1";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Subscribe to unlock changes (same tab + optional cross-tab via storage). */
export function subscribeUnlockedLevel(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  listeners.add(onChange);
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
    listeners.delete(onChange);
  };
}

export function getUnlockedLevel(): number {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 1;
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 99);
}

export function getServerUnlockedLevel(): number {
  return 1;
}

/** After completing level `levelId`, unlock the next index. */
export function recordLevelComplete(levelId: number) {
  if (typeof window === "undefined") return;
  const nextUnlock = levelId + 1;
  const prev = getUnlockedLevel();
  if (nextUnlock > prev) {
    window.localStorage.setItem(STORAGE_KEY, String(nextUnlock));
    emit();
  }
}
