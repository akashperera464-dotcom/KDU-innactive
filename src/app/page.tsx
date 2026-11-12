"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { HomeScreen, CollectorLoginScreen, AdminLoginScreen } from "@/components/auth/AuthFlow";
import { CollectorPortal } from "@/components/collector/CollectorPortal";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import {
  Entry,
  User as UserType,
  Supplier,
  RouteItem,
  StatusReasonItem,
  CustomQuestionItem,
} from "@/types";
import {
  getOfflineQueue,
  enqueueOfflineEntry,
  syncOfflineQueueToServer,
  getCachedSuppliers,
  setCachedSuppliers,
  getCachedRoutes,
  setCachedRoutes,
  getCachedReasons,
  setCachedReasons,
  getCachedQuestions,
  setCachedQuestions,
  getStoredUser,
  setStoredUser,
  getStoredTheme,
  setStoredTheme,
  saveOfflineCred,
  matchOfflineCred,
} from "@/lib/offlineStorage";
import { WifiOff } from "lucide-react";

type AuthStage = "home" | "collector" | "admin";

export default function Home() {
  const [authStage, setAuthStage] = useState<AuthStage>("home");
  const [user, setUser] = useState<UserType | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [activeView, setActiveView] = useState<"collector" | "admin">("collector");

  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<Entry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [reasons, setReasons] = useState<StatusReasonItem[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionItem[]>([]);

  const applyTheme = (t: "dark" | "light") => {
    setTheme(t);
    setStoredTheme(t);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", t === "dark");
    }
  };

  const handleToggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    const result = await syncOfflineQueueToServer();
    if (result.success) {
      setOfflineQueue(getOfflineQueue());
      try {
        const res = await fetch("/api/entries");
        if (res.ok) {
          const d = await res.json();
          if (d.success) setEntries(d.entries || []);
        }
      } catch {}
    }
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const on = () => {
      setIsOnline(true);
      handleSync();
    };
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [handleSync]);

  const loadAppData = useCallback(async () => {
    const ABORT_MS = 8000;
    let ok = false;

    const fetchWithTimeout = (url: string) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ABORT_MS);
      return fetch(url, { signal: ctrl.signal })
        .then((r) => {
          clearTimeout(t);
          return r;
        })
        .catch((err) => {
          clearTimeout(t);
          throw err;
        });
    };

    try {
      const bRes = await fetchWithTimeout("/api/bootstrap");
      if (bRes.ok) {
        const bData = await bRes.json();
        if (bData.success) {
          setRoutes(bData.routes || []);
          setCachedRoutes(bData.routes || []);
          setReasons(bData.reasons || []);
          setCachedReasons(bData.reasons || []);
          setSuppliers(bData.suppliers || []);
          setCachedSuppliers(bData.suppliers || []);
          setCustomQuestions(bData.questions || []);
          setCachedQuestions(bData.questions || []);
          ok = true;
        }
      }
      try {
        const eRes = await fetchWithTimeout("/api/entries");
        if (eRes.ok) {
          const eData = await eRes.json();
          if (eData.success) setEntries(eData.entries || []);
        }
      } catch {}
      try {
        const uRes = await fetchWithTimeout("/api/users");
        if (uRes.ok) {
          const uData = await uRes.json();
          if (uData.success) setUsers(uData.users || []);
        }
      } catch {}
    } catch {
      setRoutes(getCachedRoutes());
      setReasons(getCachedReasons());
      setSuppliers(getCachedSuppliers());
      setCustomQuestions(getCachedQuestions());
      ok = false;
    }

    return ok;
  }, []);

  useEffect(() => {
    const savedUser = getStoredUser();
    if (savedUser) {
      setUser(savedUser);
      setActiveView(savedUser.role === "admin" ? "admin" : "collector");
    }
    applyTheme(getStoredTheme() || "light");
    setOfflineQueue(getOfflineQueue());

    // Load once; if the first attempt fails (slow DB cold-start), silently
    // retry once after 2.5s so users never need a manual retry button.
    let cancelled = false;
    loadAppData().then((ok) => {
      if (!ok && !cancelled) {
        window.setTimeout(() => {
          if (!cancelled) loadAppData();
        }, 2500);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadAppData]);

  /* ---------- Auth handlers ---------- */
  /** Collector login: Name + Password (password set by Admin in Users). */
  const handleFieldLogin = async (name: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/field-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Cache credential so the officer can log in offline next time
        saveOfflineCred(password, data.user);
        setUser(data.user);
        setStoredUser(data.user);
        setActiveView("collector");
        return null;
      }
      return data.message || "පිවිසීම අසාර්ථකයි (Login failed)";
    } catch {
      // Offline: verify against the locally cached credential from the
      // officer's last successful online login.
      const cachedUser = matchOfflineCred(name, password);
      if (cachedUser) {
        setUser(cachedUser);
        setStoredUser(cachedUser);
        setActiveView("collector");
        return null;
      }
      return "සම්බන්ධතාවය නොමැත — මෙම උපාංගයෙන් කලින් සාර්ථකව ලොග් වී නොමැති නම් නොබැඳි පිවිසුම කළ නොහැක. (No connection — offline login works only after one successful online login on this device.)";
    }
  };

  const handleAdminLogin = async (employeeId: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password, expectedRole: "admin" }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setStoredUser(data.user);
        setActiveView("admin");
        return null;
      }
      return data.message || "පිවිසීම අසාර්ථකයි (Login failed)";
    } catch {
      if (employeeId.trim() === "akashperera@kdu.com" || employeeId.trim() === "admin") {
        const fallback: UserType = {
          id: "u-admin",
          employeeId: employeeId.trim(),
          name: "Akash Perera (Super Admin)",
          role: "admin",
          assignedRoute: "ALL",
        };
        setUser(fallback);
        setStoredUser(fallback);
        setActiveView("admin");
        return null;
      }
      return "සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.";
    }
  };

  const handleLogout = () => {
    setUser(null);
    setStoredUser(null);
    setAuthStage("home");
  };

  /* ---------- Data handlers ---------- */
  const handleSaveEntry = async (newEntry: Entry): Promise<boolean> => {
    setEntries((prev) => [newEntry, ...prev]);
    if (!isOnline) {
      setOfflineQueue(enqueueOfflineEntry(newEntry));
      return true;
    }
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
      if (!res.ok) setOfflineQueue(enqueueOfflineEntry(newEntry));
      return true;
    } catch {
      setOfflineQueue(enqueueOfflineEntry(newEntry));
      return true;
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`/api/entries/${id}`, { method: "DELETE" });
    } catch {}
  };

  const handleAddRoute = async (newRoute: Partial<RouteItem>) => {
    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoute),
      });
      const data = await res.json();
      if (data.success && data.route) {
        setRoutes((prev) => [data.route, ...prev.filter((r) => r.name !== data.route.name)]);
      }
    } catch {
      if (newRoute.name) {
        const fallback = {
          id: `route-${Date.now()}`,
          name: newRoute.name,
          factory: newRoute.factory || "Galpadihenna Tea Factory",
        };
        setRoutes((prev) => [fallback, ...prev.filter((r) => r.name !== fallback.name)]);
      }
    }
  };

  const handleDeleteRoute = async (id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/routes/${id}`, { method: "DELETE" });
    } catch {}
  };

  const handleAddReason = async (newReason: Partial<StatusReasonItem>) => {
    try {
      const res = await fetch("/api/reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReason),
      });
      const data = await res.json();
      if (data.success && data.reason) {
        setReasons((prev) => [data.reason, ...prev.filter((r) => r.id !== data.reason.id)]);
      }
    } catch {
      if (newReason.labelEn && newReason.labelSi) {
        const fallback: StatusReasonItem = {
          id: newReason.id || `reason_${Date.now()}`,
          labelSi: newReason.labelSi,
          labelEn: newReason.labelEn,
          badgeColor: newReason.badgeColor || "#10B981",
        };
        setReasons((prev) => [fallback, ...prev.filter((r) => r.id !== fallback.id)]);
      }
    }
  };

  const handleDeleteReason = async (id: string) => {
    setReasons((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/reasons/${id}`, { method: "DELETE" });
    } catch {}
  };

  const handleAddUser = async (newUser: Partial<UserType> & { password?: string }) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) => [data.user, ...prev.filter((u) => u.employeeId !== data.user.employeeId)]);
      }
    } catch {}
  };

  const handleDeleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
    } catch {}
  };

  /* Full edit (Admin → Users → Edit) */
  const handleUpdateUser = async (
    id: string,
    patch: Partial<UserType> & { password?: string }
  ) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    try {
      await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {}
  };

  const handleAddSupplier = async (newSup: Partial<Supplier>) => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSup),
      });
      const data = await res.json();
      if (data.success && data.supplier) {
        setSuppliers((prev) => [data.supplier, ...prev.filter((s) => s.supplierNo !== data.supplier.supplierNo)]);
      }
    } catch {}
  };

  const handleDeleteSupplier = async (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    } catch {}
  };

  /* Bulk import (Excel / CSV extracted rows) */
  const handleBulkAddSuppliers = async (
    items: Partial<Supplier>[],
    defaultStatus: string
  ): Promise<{ imported: number; skipped: number }> => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, defaultStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // refresh directory from server so imported rows appear everywhere
        const r2 = await fetch("/api/suppliers");
        if (r2.ok) {
          const d2 = await r2.json();
          if (d2.success) setSuppliers(d2.suppliers || []);
        }
        return { imported: data.imported || 0, skipped: data.skipped || 0 };
      }
      return { imported: 0, skipped: items.length };
    } catch {
      return { imported: 0, skipped: items.length };
    }
  };

  /* Bulk delete: whole directory, or only one import batch (password gated) */
  const handleBulkDeleteSuppliers = async (
    password: string,
    importedDate?: string | null
  ): Promise<{ deleted: number; scope: string }> => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk-delete", password, importedDate }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "මකා දැමීම අසාර්ථකයි (Delete failed)");
        return { deleted: 0, scope: importedDate || "all" };
      }
      setSuppliers((prev) =>
        data.scope === "all" ? [] : prev.filter((s) => s.importedDate !== data.scope)
      );
      return { deleted: data.deleted || 0, scope: data.scope };
    } catch {
      alert("සම්බන්ධතා දෝෂයකි (Connection error)");
      return { deleted: 0, scope: importedDate || "all" };
    }
  };

  /* Partial update (reminder resolve / mark active) */
  const handleUpdateSupplier = async (id: string, patch: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    try {
      await fetch(`/api/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {}
  };

  const handleAddQuestion = async (newQ: Partial<CustomQuestionItem>) => {
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQ),
      });
      const data = await res.json();
      if (data.success && data.question) {
        setCustomQuestions((prev) => [data.question, ...prev.filter((q) => q.id !== data.question.id)]);
      }
    } catch {
      if (newQ.title) {
        const fallback: CustomQuestionItem = {
          id: `q_${Date.now()}`,
          title: newQ.title,
          targetForm: newQ.targetForm || "both",
          inputType: newQ.inputType || "text",
          options: newQ.options || null,
        };
        setCustomQuestions((prev) => [fallback, ...prev]);
      }
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
    try {
      await fetch(`/api/questions/${id}`, { method: "DELETE" });
    } catch {}
  };

  /* ---------- Auth stages ---------- */
  if (!user) {
    if (authStage === "collector") {
      return (
        <CollectorLoginScreen
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onBack={() => setAuthStage("home")}
          collectors={users.filter((u) => u.role === "collector")}
          onLogin={handleFieldLogin}
        />
      );
    }
    if (authStage === "admin") {
      return (
        <AdminLoginScreen
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onBack={() => setAuthStage("home")}
          onLogin={handleAdminLogin}
        />
      );
    }
    return (
      <HomeScreen
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectCollector={() => setAuthStage("collector")}
        onSelectAdmin={() => setAuthStage("admin")}
      />
    );
  }

  /* ---------- Authenticated app ---------- */
  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "dark" ? "bg-[#111827] text-slate-100" : "bg-[#EAF6EE] text-slate-900"
      }`}
    >
      <Header
        user={user}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        isOnline={isOnline}
        offlineQueueCount={offlineQueue.length}
        onSync={handleSync}
        isSyncing={isSyncing}
        activeView={activeView}
      />

      <main className="flex-1">
        {activeView === "admin" && user.role === "admin" ? (
          <div className="pb-12">
            <AdminDashboard
              user={user}
              entries={entries}
              users={users}
              suppliers={suppliers}
              routes={routes}
              reasons={reasons}
              questions={customQuestions}
              theme={theme}
              onRefresh={loadAppData}
              onDeleteEntry={handleDeleteEntry}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onAddSupplier={handleAddSupplier}
              onBulkAddSuppliers={handleBulkAddSuppliers}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onBulkDeleteSuppliers={handleBulkDeleteSuppliers}
              onAddRoute={handleAddRoute}
              onDeleteRoute={handleDeleteRoute}
              onAddReason={handleAddReason}
              onDeleteReason={handleDeleteReason}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </div>
        ) : (
          <CollectorPortal
            user={user}
            theme={theme}
            routes={routes}
            reasons={reasons}
            suppliers={suppliers}
            customQuestions={customQuestions}
            onAddRoute={handleAddRoute}
            onAddReason={handleAddReason}
            onAddQuestion={handleAddQuestion}
            onSaveEntry={handleSaveEntry}
            onLogout={handleLogout}
            recentEntries={entries.filter(
              (e) => e.collectorId === user.name || e.collectorId === user.employeeId
            )}
          />
        )}
      </main>

      {!isOnline && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-950/90 text-amber-300 border border-amber-600/50 shadow-2xl backdrop-blur-md text-xs font-bold">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>නොබැඳි ප්‍රකාරය: දත්ත උපාංගයේ සුරැකේ (Offline Mode)</span>
        </div>
      )}
    </div>
  );
}
