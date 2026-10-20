"use client";

import React, { useMemo } from "react";
import { GitCompareArrows, UserCheck, UserX, HeartPulse, Shuffle, Download, MapPin } from "lucide-react";
import { Entry, Supplier, StatusReasonItem } from "@/types";

interface InactiveAnalysisProps {
  suppliers: Supplier[]; // admin-side master list
  fieldEntries: Entry[]; // field-submitted entries (respects analytics filters)
  reasons: StatusReasonItem[];
  theme: "dark" | "light";
}

interface AnalysisRow {
  supplier: Supplier;
  latestEntry?: Entry;
  visited: boolean;
  recovered: boolean;
  reasonMatch: boolean | null; // null = not visited
}

export const InactiveAnalysis: React.FC<InactiveAnalysisProps> = ({
  suppliers,
  fieldEntries,
  reasons,
  theme,
}) => {
  const isDark = theme === "dark";

  const reasonLabel = (id?: string | null) => {
    if (!id) return "—";
    const m = reasons.find((r) => r.id === id);
    return m ? m.labelEn : id;
  };

  const rows = useMemo<AnalysisRow[]>(() => {
    // Admin-side "inactive suppliers" list = imported / flagged inactive directory rows
    const inactiveList = suppliers.filter((s) => (s.status || "active") === "inactive");

    return inactiveList.map((s) => {
      const entriesFor = fieldEntries
        .filter((e) => e.supplierNo === s.supplierNo)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      const latestEntry = entriesFor[0];
      const visited = Boolean(latestEntry);
      const recovered = Boolean(
        latestEntry && (latestEntry.willGive === "ඔව් (Yes)" || latestEntry.promiseReason === "provides_leaves")
      );
      const reasonMatch = visited ? latestEntry!.promiseReason === (s.previousReason || null) : null;
      return { supplier: s, latestEntry, visited, recovered, reasonMatch };
    });
  }, [suppliers, fieldEntries]);

  const totals = useMemo(() => {
    const list = rows.length;
    const visited = rows.filter((r) => r.visited).length;
    const notVisited = list - visited;
    const recovered = rows.filter((r) => r.recovered).length;
    const mismatch = rows.filter((r) => r.visited && r.reasonMatch === false).length;
    const match = rows.filter((r) => r.visited && r.reasonMatch === true).length;
    return { list, visited, notVisited, recovered, mismatch, match };
  }, [rows]);

  const coveragePct = totals.list > 0 ? Math.round((totals.visited / totals.list) * 100) : 0;

  const exportAnalysisCsv = () => {
    if (rows.length === 0) {
      alert("විශ්ලේෂණය කිරීමට දත්ත නොමැත (No inactive suppliers to analyse)");
      return;
    }
    const headers = [
      "Supplier No",
      "Name",
      "Route",
      "Factory",
      "Admin Reason (Expected)",
      "Field Visited?",
      "Last Visit Date",
      "Collector",
      "Field Reason (Actual)",
      "Will Give Leaves?",
      "Reason Match?",
      "Recovered?",
      "GPS",
    ];
    const body = rows.map((r) => [
      r.supplier.supplierNo,
      `"${r.supplier.name.replace(/"/g, '""')}"`,
      r.supplier.route || "",
      r.supplier.factory || "",
      reasonLabel(r.supplier.previousReason),
      r.visited ? "Yes" : "No",
      r.latestEntry?.date || "",
      r.latestEntry?.collectorId || "",
      r.latestEntry ? reasonLabel(r.latestEntry.promiseReason) : "",
      r.latestEntry?.willGive || "",
      r.reasonMatch === null ? "N/A" : r.reasonMatch ? "Match" : "Mismatch",
      r.recovered ? "Yes" : "No",
      r.latestEntry?.gpsLocation || "",
    ]);
    const csv = "\uFEFF" + [headers.join(","), ...body.map((b) => b.join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KDU_Inactive_Supplier_Analysis_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 space-y-5 ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-md"}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <GitCompareArrows className="w-5 h-5 text-emerald-400" />
            <span>අක්‍රිය සැපයුම්කරු විග්‍රහය (Admin List VS Field Data)</span>
          </h4>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            පරිපාලක ලැයිස්තුවේ ඇති අක්‍රිය සැපයුම්කරුවන්, ක්ෂේත්‍ර නිලධාරීන් සත්‍ය වශයෙන්ම නිරීක්ෂණය කළේද යන්න සසඳා බලයි.
          </p>
        </div>
        <button
          onClick={exportAnalysisCsv}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-teal-700 shadow-md shadow-teal-700/30 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analysis</span>
        </button>
      </div>

      {/* Coverage bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
          <span className={isDark ? "text-slate-300" : "text-slate-600"}>
            නිරීක්ෂණ ආවරණය (Field Coverage): <span className="text-emerald-400">{coveragePct}%</span>
          </span>
          <span className={isDark ? "text-slate-400" : "text-slate-500"}>
            {totals.visited}/{totals.list} suppliers visited
          </span>
        </div>
        <div className={`h-3 rounded-full overflow-hidden flex ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" style={{ width: `${coveragePct}%` }} />
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700" style={{ width: `${100 - coveragePct}%` }} />
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-slate-800/70 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
          <UserCheck className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <p className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{totals.list}</p>
          <p className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Admin Inactive List</p>
        </div>
        <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-emerald-950/40 border-emerald-800/50" : "bg-emerald-50 border-emerald-200"}`}>
          <UserCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-black text-emerald-400">{totals.visited}</p>
          <p className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Visited by Officer</p>
        </div>
        <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-amber-950/40 border-amber-800/50" : "bg-amber-50 border-amber-200"}`}>
          <UserX className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-black text-amber-400">{totals.notVisited}</p>
          <p className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Not Visited Yet</p>
        </div>
        <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-teal-950/40 border-teal-800/50" : "bg-teal-50 border-teal-200"}`}>
          <HeartPulse className="w-4 h-4 text-teal-400 mx-auto mb-1" />
          <p className="text-xl font-black text-teal-400">{totals.recovered}</p>
          <p className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Recovered (Will Give)</p>
        </div>
        <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-red-950/40 border-red-800/50" : "bg-red-50 border-red-200"}`}>
          <Shuffle className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-xl font-black text-red-400">{totals.mismatch}</p>
          <p className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Reason Mismatch</p>
        </div>
      </div>

      {/* Comparison table */}
      {rows.length === 0 ? (
        <p className={`text-xs text-center py-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          පරිපාලක ලැයිස්තුවේ අක්‍රිය සැපයුම්කරුවන් නොමැත. (Import the office inactive-supplier list from the Suppliers tab to unlock this analysis.)
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <tr>
                <th className="px-3 py-2.5 font-bold">සැපයුම්කරු (Supplier)</th>
                <th className="px-3 py-2.5 font-bold">මාර්ගය (Route)</th>
                <th className="px-3 py-2.5 font-bold">පරිපාලක හේතුව (Admin Expected)</th>
                <th className="px-3 py-2.5 font-bold">ක්ෂේත්‍ර දත්ත (Field Actual)</th>
                <th className="px-3 py-2.5 font-bold">තත්ත්වය (Verdict)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {rows.map((r) => (
                <tr key={r.supplier.id} className={isDark ? "text-slate-200" : "text-slate-800"}>
                  <td className="px-3 py-2.5">
                    <span className="font-extrabold text-emerald-400">#{r.supplier.supplierNo}</span>
                    <span className="block text-[11px] font-semibold">{r.supplier.name}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      <MapPin className="w-3 h-3" />
                      {r.supplier.route || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] font-semibold">
                    {reasonLabel(r.supplier.previousReason)}
                  </td>
                  <td className="px-3 py-2.5 text-[11px]">
                    {r.visited ? (
                      <>
                        <span className="font-semibold">{reasonLabel(r.latestEntry!.promiseReason)}</span>
                        <span className={`block text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {r.latestEntry!.date} • {r.latestEntry!.collectorId} • {r.latestEntry!.willGive}
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-400 font-bold">තවම නිරීක්ෂණය නැත (No visit)</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {!r.visited ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        NOT VISITED
                      </span>
                    ) : r.recovered ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        RECOVERED ✓
                      </span>
                    ) : r.reasonMatch ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        MATCH ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/40">
                        MISMATCH ✕
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
