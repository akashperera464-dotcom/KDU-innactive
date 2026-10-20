import { Entry, Supplier, RouteItem, StatusReasonItem, CustomQuestionItem } from "@/types";

const QUEUE_KEY = "kdu_offline_queue";
const CACHED_ENTRIES_KEY = "kdu_cached_entries";
const CACHED_SUPPLIERS_KEY = "kdu_cached_suppliers";
const CACHED_ROUTES_KEY = "kdu_cached_routes";
const CACHED_REASONS_KEY = "kdu_cached_reasons";
const CACHED_QUESTIONS_KEY = "kdu_cached_questions";
const AUTH_KEY = "kdu_auth_user";
const THEME_KEY = "kdu_app_theme";

export function getOfflineQueue(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: Entry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to save offline queue:", err);
  }
}

export function enqueueOfflineEntry(entry: Entry): Entry[] {
  const current = getOfflineQueue();
  const updated = [entry, ...current.filter((e) => e.id !== entry.id)];
  saveOfflineQueue(updated);
  return updated;
}

export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

export function getCachedSuppliers(): Supplier[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHED_SUPPLIERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedSuppliers(suppliers: Supplier[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHED_SUPPLIERS_KEY, JSON.stringify(suppliers));
  } catch (err) {}
}

export function getCachedRoutes(): RouteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHED_ROUTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedRoutes(routes: RouteItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHED_ROUTES_KEY, JSON.stringify(routes));
  } catch (err) {}
}

export function getCachedReasons(): StatusReasonItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHED_REASONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedReasons(reasons: StatusReasonItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHED_REASONS_KEY, JSON.stringify(reasons));
  } catch (err) {}
}

export function getCachedQuestions(): CustomQuestionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHED_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedQuestions(questions: CustomQuestionItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHED_QUESTIONS_KEY, JSON.stringify(questions));
  } catch (err) {}
}

export function getStoredUser(): any {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(AUTH_KEY);
  } else {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

export function getStoredTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  try {
    return (localStorage.getItem(THEME_KEY) as "dark" | "light") || "dark";
  } catch {
    return "dark";
  }
}

export function setStoredTheme(theme: "dark" | "light"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
}

export async function syncOfflineQueueToServer(): Promise<{ success: boolean; syncedCount: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { success: true, syncedCount: 0 };
  }

  try {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: queue }),
    });

    if (res.ok) {
      clearOfflineQueue();
      return { success: true, syncedCount: queue.length };
    } else {
      return { success: false, syncedCount: 0 };
    }
  } catch (err) {
    console.error("Sync error:", err);
    return { success: false, syncedCount: 0 };
  }
}
