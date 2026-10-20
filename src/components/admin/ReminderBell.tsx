"use client";

import React, { useMemo, useState } from "react";
import { Bell, Scissors, AlertTriangle, CheckCircle2, MapPin, X, Leaf } from "lucide-react";
import { Supplier, Entry } from "@/types";
import { computePruningReminders, RECOVERY_DAYS } from "@/lib/reminders";

interface ReminderBellProps {
  suppliers: Supplier[];
  entries: Entry[];
  theme: "dark" | "light";
  onResolve: (supplierId: string, patch: { resolvedAt?: string | null; status?: string }) => Promise<void>;
}

export const ReminderBell: React.FC<ReminderBellProps> = ({ suppliers, entries, theme, onResolve }) => {
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";
  const today = new Date().toISOString().split("T")[0];

  const reminders = useMemo(() => computePruningReminders(suppliers, entries, today), [suppliers, entries, today]);
  const overdueCount = reminders.filter((r) => r.stage === "overdue").length;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        title="කප්පාදු මතක් කිරීම් (Pruning & Inactive Reminders)"
        className={`relative p-2.5 rounded-2xl border transition-all active:scale-95 ${
          overdueCount > 0
            ? "bg-red-500/15 border-red-500/40 text-red-400 animate-pulse"
            : reminders.length > 0
              ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
              : isDark
                ? "bg-slate-800/70 border-slate-700 text-slate-300"
                : "bg-white border-slate-200 text-slate-600"
        }`}
      >
        <Bell className="w-5 h-5" />
        {reminders.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
            {reminders.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute right-0 top-12 z-50 w-[min(92vw,420px)] max-h-[70vh] overflow-y-auto rounded-3xl border shadow-2xl p-4 space-y-3 ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>මතක් කිරීම් (Reminders)</span>
                </h3>
                <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  කප්පාදු ප්‍රාප්ති කාලසීමාව = දින {RECOVERY_DAYS} • අක්‍රිය සැපයුම්කරු නිරීක්ෂණය
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <Leaf className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  මතක් කිරීම් නොමැත — සියලු සැපයුම්කරුවෝ සක්‍රියයි 🎉
                </p>
              </div>
            ) : (
              reminders.map((r) => (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-2xl border space-y-2 ${
                    r.stage === "overdue"
                      ? "bg-red-500/10 border-red-500/40"
                      : "bg-amber-500/10 border-amber-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`p-1.5 rounded-xl shrink-0 ${
                          r.stage === "overdue" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {r.stage === "overdue" ? <AlertTriangle className="w-4 h-4" /> : <Scissors className="w-4 h-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold truncate">
                          #{r.supplierNo} — {r.name}
                        </p>
                        <p className={`text-[10px] flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {r.route || "—"} • {r.factory || "—"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full ${
                        r.stage === "overdue"
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-slate-950"
                      }`}
                    >
                      {r.stage === "overdue" ? "සොයා බලන්න!" : `දින ${r.daysLeft}`}
                    </span>
                  </div>

                  <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {r.message}
                  </p>

                  <div className="flex gap-2 pt-0.5">
                    <button
                      onClick={async () => {
                        await onResolve(r.supplierId, { resolvedAt: today });
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-extrabold border transition-all active:scale-95 ${
                        isDark
                          ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>නිරාකරණය කළා (Resolved)</span>
                    </button>
                    <button
                      onClick={async () => {
                        await onResolve(r.supplierId, { resolvedAt: today, status: "active" });
                      }}
                      className="flex-1 py-2 rounded-xl text-[11px] font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 shadow-md shadow-emerald-600/30"
                    >
                      දළු ලබාදෙයි (Mark Active)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
