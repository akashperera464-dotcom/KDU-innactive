"use client";

import React from "react";
import { Leaf, ShieldHalf, Wifi, WifiOff, RefreshCw, LogOut } from "lucide-react";
import { User } from "@/types";
import { ThemePill, KDU_LOGO_URL } from "./auth/AuthFlow";

interface HeaderProps {
  user: User | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onLogout: () => void;
  isOnline: boolean;
  offlineQueueCount: number;
  onSync: () => void;
  isSyncing: boolean;
  activeView: "collector" | "admin";
}

export const Header: React.FC<HeaderProps> = ({
  user,
  theme,
  onToggleTheme,
  onLogout,
  isOnline,
  offlineQueueCount,
  onSync,
  isSyncing,
  activeView,
}) => {
  /* ---------------------------------------------------- */
  /* COLLECTOR / FIELD PORTAL HEADER (green gradient bar) */
  /* ---------------------------------------------------- */
  if (activeView === "collector") {
    return (
      <header className="sticky top-0 z-40">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 shadow-lg shadow-emerald-950/30">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-white ring-2 ring-emerald-300/70 shadow-md">
                <img src={KDU_LOGO_URL} alt="KDU GROUP" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight truncate">
                  Extension Officer Portal
                </h1>
                <p className="text-[11px] text-emerald-200 font-semibold truncate">
                  {user?.name || "Officer"}
                  {user?.assignedRoute ? ` • ${user.assignedRoute}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Connectivity pill */}
              {isOnline ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-600/40">
                  <Wifi className="w-3 h-3" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-200 border border-amber-400/40">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </span>
              )}

              {offlineQueueCount > 0 && (
                <button
                  onClick={onSync}
                  disabled={isSyncing || !isOnline}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400 text-emerald-950 shadow active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{offlineQueueCount} Sync</span>
                </button>
              )}

              <ThemePill theme={theme} onToggle={onToggleTheme} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  /* ---------------------------------------------------- */
  /* ADMIN DASHBOARD HEADER                               */
  /* ---------------------------------------------------- */
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark
          ? "bg-[#111827]/90 border-emerald-950/50"
          : "bg-white/90 border-emerald-100"
      }`}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-2xl overflow-hidden bg-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40">
            <img src={KDU_LOGO_URL} alt="KDU GROUP" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent truncate">
                KDU GROUP
              </span>
              <span
                className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDark
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                ADMIN
              </span>
            </div>
            <p className={`text-xs truncate ${isDark ? "text-emerald-400/80" : "text-emerald-700"}`}>
              පරිපාලක පුවරුව (Admin Dashboard) • {user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isOnline ? (
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                isDark
                  ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/60"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </span>
          )}

          {offlineQueueCount > 0 && (
            <button
              onClick={onSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 shadow active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{offlineQueueCount} Sync</span>
            </button>
          )}

          <ThemePill theme={theme} onToggle={onToggleTheme} />

          <button
            onClick={onLogout}
            title="නික්මීම (Logout)"
            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
