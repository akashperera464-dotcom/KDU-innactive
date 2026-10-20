"use client";

import React, { useState, useMemo } from "react";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  Eye, 
  Trash2, 
  Share2, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";
import { Entry, StatusReasonItem, RouteItem, User as UserType, Supplier } from "@/types";
import { DonutChart, BarChart } from "./Charts";
import { exportToCsv, exportToExcel } from "@/lib/exportUtils";
import { EntryDetailsModal } from "./EntryDetailsModal";
import { InactiveAnalysis } from "./InactiveAnalysis";

interface AnalyticsTabProps {
  entries: Entry[];
  reasons: StatusReasonItem[];
  routes: RouteItem[];
  users: UserType[];
  suppliers: Supplier[];
  onRefresh: () => void;
  onDeleteEntry: (id: string) => Promise<void>;
  theme: "dark" | "light";
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  entries,
  reasons,
  routes,
  users,
  suppliers,
  onRefresh,
  onDeleteEntry,
  theme,
}) => {
  const isDark = theme === "dark";

  // Filter Toolbar States
  const [timeRange, setTimeRange] = useState<"all" | "today" | "7days" | "month">("all");
  const [selectedCollector, setSelectedCollector] = useState<string>("all");
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  // Export scope: which record type the CSV / Excel buttons should contain
  const [exportScope, setExportScope] = useState<"all" | "inactive" | "extension">("all");

  // Compute Filtered Entries
  const filteredEntries = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const sevenDaysAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const currentMonthPrefix = todayStr.substring(0, 7);

    return entries.filter((item) => {
      // Time Range
      if (timeRange === "today" && item.date !== todayStr) return false;
      if (timeRange === "7days" && item.date < sevenDaysAgoStr) return false;
      if (timeRange === "month" && !item.date.startsWith(currentMonthPrefix)) return false;

      // Collector
      if (selectedCollector !== "all" && item.collectorId !== selectedCollector) return false;

      // Route
      if (selectedRoute !== "all" && item.route !== selectedRoute) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          (item.supplierName && item.supplierName.toLowerCase().includes(q)) ||
          (item.supplierNo && item.supplierNo.toLowerCase().includes(q)) ||
          (item.route && item.route.toLowerCase().includes(q)) ||
          (item.nic && item.nic.toLowerCase().includes(q)) ||
          (item.phoneNumber && item.phoneNumber.toLowerCase().includes(q)) ||
          (item.collectorId && item.collectorId.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [entries, timeRange, selectedCollector, selectedRoute, searchQuery]);

  /* ---------- Export scope: rows that go into CSV / Excel ---------- */
  const exportData = useMemo(() => {
    if (exportScope === "all") return filteredEntries;
    return filteredEntries.filter((e) => e.type === exportScope);
  }, [filteredEntries, exportScope]);

  const inactiveCount = filteredEntries.filter((e) => e.type === "inactive").length;
  const extensionCountFiltered = filteredEntries.filter((e) => e.type === "extension").length;

  const scopeFileTag =
    exportScope === "inactive"
      ? "KDU_Inactive_Suppliers"
      : exportScope === "extension"
        ? "KDU_Extension_RA_Visits"
        : "KDU_All_Records";

  const scopeLabel =
    exportScope === "inactive"
      ? "Inactive"
      : exportScope === "extension"
        ? "Extension / RA"
        : "All";

  // KPI Calculations
  const totalEntries = filteredEntries.length;
  const inactiveSuppliersCount = filteredEntries.filter((e) => e.type === "inactive").length;
  const extensionCount = filteredEntries.filter((e) => e.type === "extension").length;
  
  const totalLeafKg = useMemo(() => {
    return filteredEntries.reduce((sum, item) => {
      const kg = parseFloat(item.salesVolumeKg || item.expectedLeafQty || "0");
      return isNaN(kg) ? sum : sum + kg;
    }, 0);
  }, [filteredEntries]);

  const uniqueCollectorsCount = useMemo(() => {
    return new Set(filteredEntries.map((e) => e.collectorId)).size;
  }, [filteredEntries]);

  // Donut Chart Data (Reason Distribution)
  const donutData = useMemo(() => {
    if (totalEntries === 0) return [];

    const reasonCounts: Record<string, number> = {};
    for (const e of filteredEntries) {
      const r = e.promiseReason || (e.type === "extension" ? "Extension Visit" : "Other");
      reasonCounts[r] = (reasonCounts[r] || 0) + 1;
    }

    const colorPalette = [
      "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", 
      "#14B8A6", "#6366F1", "#F97316", "#06B6D4", "#EAB308"
    ];

    let colorIdx = 0;
    return Object.entries(reasonCounts).map(([key, count]) => {
      const matched = reasons.find((r) => r.id === key);
      const label = matched ? `${matched.labelSi} (${matched.labelEn})` : key;
      const color = matched?.badgeColor || colorPalette[colorIdx++ % colorPalette.length];
      const percent = (count / totalEntries) * 100;

      return {
        label,
        count,
        color,
        percent,
      };
    }).sort((a, b) => b.count - a.count);
  }, [filteredEntries, reasons, totalEntries]);

  // Bar Chart Data (Entries by Route)
  const barData = useMemo(() => {
    const routeCounts: Record<string, number> = {};
    for (const e of filteredEntries) {
      const r = e.route || "UNKNOWN";
      routeCounts[r] = (routeCounts[r] || 0) + 1;
    }

    return Object.entries(routeCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredEntries]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ======================================================== */}
      {/* 1. FILTERS TOOLBAR */}
      {/* ======================================================== */}
      <div className={`p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-3 ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        {/* Time Range Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-emerald-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>කාල සීමාව:</span>
          </span>
          {(["all", "today", "7days", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === r
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r === "all" && "All"}
              {r === "today" && "Today"}
              {r === "7days" && "Last 7 Days"}
              {r === "month" && "This Month"}
            </button>
          ))}
        </div>

        {/* Collector & Route Dropdowns + Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Collector Dropdown */}
          <select
            value={selectedCollector}
            onChange={(e) => setSelectedCollector(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-100 border border-slate-300 text-slate-900"
            }`}
          >
            <option value="all">සියලු නිලධාරීන් (All Extension Officers)</option>
            {users.filter(u => u.role === "collector").map((u) => (
              <option key={u.id} value={u.name || u.employeeId}>
                {u.name} ({u.employeeId})
              </option>
            ))}
          </select>

          {/* Route Dropdown */}
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-100 border border-slate-300 text-slate-900"
            }`}
          >
            <option value="all">සියලු මාර්ග (All Routes)</option>
            {routes.map((r) => (
              <option key={r.id || r.name} value={r.name}>{r.name}</option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="නැවත පූරණය කරන්න (Refresh Data)"
            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. METRIC KPI CARDS (TOP ROW) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: Total Entries Card */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDark ? "bg-slate-900/90 border-emerald-500/40 glow-emerald" : "bg-white border-emerald-300 shadow-md"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400">Total Entries</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalEntries}</div>
          <p className="text-[11px] text-slate-400 mt-1">මුළු වාර්තා සංඛ්‍යාව</p>
        </div>

        {/* KPI 2: Inactive Suppliers Card */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDark ? "bg-slate-900/90 border-amber-500/40 glow-amber" : "bg-white border-amber-300 shadow-md"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400">Inactive Sup.</span>
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{inactiveSuppliersCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">අක්‍රිය / දළු පරීක්ෂණ</p>
        </div>

        {/* KPI 3: Extension Visit / RA Card */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDark ? "bg-slate-900/90 border-blue-500/40 glow-blue" : "bg-white border-blue-300 shadow-md"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400">Extension Visit / RA</span>
            <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{extensionCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">ව්‍යාප්ති හා RA විගණන</p>
        </div>

        {/* KPI 4: Total Leaf Volume (Kg) */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDark ? "bg-slate-900/90 border-teal-500/40" : "bg-white border-teal-300 shadow-md"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-400">Leaf Volume</span>
            <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalLeafKg.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="text-xs font-normal text-slate-400 ml-1">Kg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">අලෙවි / අපේක්ෂිත දළු</p>
        </div>

        {/* KPI 5: Active Field Officers */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all col-span-2 sm:col-span-1 ${
          isDark ? "bg-slate-900/90 border-purple-500/40" : "bg-white border-purple-300 shadow-md"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-400">Active Officers</span>
            <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{uniqueCollectorsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">ක්‍රියාකාරී නිලධාරීන්</p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE VISUAL CHARTS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Chart (Status / Reason Distribution) */}
        <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
          isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <span>STATUS / REASON DISTRIBUTION</span>
              </h4>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                දළු සැපයීම සහ අක්‍රිය හේතු ප්‍රතිශතය
              </p>
            </div>
          </div>

          <DonutChart data={donutData} total={totalEntries} theme={theme} />
        </div>

        {/* Chart 2: Bar Chart (Entries by Route) */}
        <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
          isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                <span>ENTRIES BY ROUTE</span>
              </h4>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                තේ මාර්ග අනුව වාර්තා ප්‍රමාණය (Top 10 Routes)
              </p>
            </div>
          </div>

          <BarChart data={barData} theme={theme} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3b. ADMIN INACTIVE LIST VS FIELD DATA ANALYSIS */}
      {/* ======================================================== */}
      <InactiveAnalysis
        suppliers={suppliers}
        fieldEntries={filteredEntries}
        reasons={reasons}
        theme={theme}
      />

      {/* ======================================================== */}
      {/* 4. EXPORT SUITE & SEARCH TOOLBAR */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="සැපයුම්කරු, අංකය, මාර්ගය, හෝ නිලධාරී අනුව සොයන්න..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDark ? "bg-slate-900 border border-slate-800 text-white" : "bg-white border border-slate-200 text-slate-900 shadow-sm"
            }`}
          />
        </div>

        {/* Export Suite: scope selector + type-aware buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Which record type to export */}
          <div className={`flex items-center p-1 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            {(
              [
                { id: "all", label: `All (${filteredEntries.length})` },
                { id: "inactive", label: `Inactive (${inactiveCount})` },
                { id: "extension", label: `Ext / RA (${extensionCountFiltered})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setExportScope(opt.id)}
                className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all ${
                  exportScope === opt.id
                    ? opt.id === "inactive"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : opt.id === "extension"
                        ? "bg-blue-500 text-white shadow"
                        : "bg-emerald-600 text-white shadow"
                    : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-black"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button (#10B981 vibrant green) */}
          <button
            onClick={() => exportToCsv(exportData, scopeFileTag)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-[#10B981] hover:bg-emerald-500 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
            title={`Download CSV — ${scopeLabel} records only`}
          >
            <Share2 className="w-4 h-4" />
            <span>Export CSV · {scopeLabel}</span>
          </button>

          {/* Export Excel Button (#0F766E dark teal) */}
          <button
            onClick={() => exportToExcel(exportData, scopeFileTag)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-[#0F766E] hover:bg-teal-700 shadow-lg shadow-teal-700/30 active:scale-95 transition-all"
            title={`Download Excel — ${scopeLabel} records only`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel · {scopeLabel}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. DATA COLLECTION RECORDS LIST / TABLE */}
      {/* ======================================================== */}
      <div className={`rounded-3xl border overflow-hidden ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-md"
      }`}>
        <div className="p-4 border-b border-emerald-500/10 flex items-center justify-between">
          <h4 className="font-bold text-sm text-emerald-400">
            ක්ෂේත්‍ර වාර්තා ලැයිස්තුව (Data Collection Records) - {filteredEntries.length} Records
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${
              isDark ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
            }`}>
              <tr>
                <th className="px-4 py-3 font-bold">සැපයුම්කරු (Supplier)</th>
                <th className="px-4 py-3 font-bold">මාර්ගය (Route)</th>
                <th className="px-4 py-3 font-bold">ව්‍යාප්ති නිලධාරී (Ext. Officer)</th>
                <th className="px-4 py-3 font-bold">දිනය & වේලාව (Timestamp)</th>
                <th className="px-4 py-3 font-bold">ස්ථානය (GPS Location)</th>
                <th className="px-4 py-3 font-bold">තත්ත්වය / හේතුව (Status)</th>
                <th className="px-4 py-3 font-bold">දළු ප්‍රමාණය (Leaf Kg)</th>
                <th className="px-4 py-3 font-bold text-right">ක්‍රියාමාර්ග</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {filteredEntries.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-emerald-500/5 transition-colors cursor-pointer ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                  onClick={() => setSelectedEntry(item)}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>{item.supplierName}</span>
                      {item.supplierNo && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          #{item.supplierNo}
                        </span>
                      )}
                    </div>
                    {item.couldNotMeet && (
                      <span className="text-[10px] text-amber-400 font-medium">⚠️ නොහමුවිය</span>
                    )}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {item.route || "FACTORY"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    {item.collectorId}
                  </td>

                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {item.date} {item.time}
                  </td>

                  {/* Submission location captured from the collector's device */}
                  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {item.gpsLocation ? (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(item.gpsLocation)}`}
                        target="_blank"
                        rel="noreferrer"
                        title={
                          item.gpsAccuracy === "fallback"
                            ? "අනුමාන ස්ථානයක් — ඉදිරිපත් කිරීමේදී GPS සංඥා නොමැති විය (approximate — no signal)"
                            : "නිවැරදි GPS ස්ථානය (precise lock at submission)"
                        }
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                      >
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{item.gpsLocation}</span>
                        {item.gpsAccuracy === "fallback" ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black not-italic">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            ≈
                          </span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Precise GPS" />
                        )}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-500 text-[10px]">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.type === "extension"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : item.willGive === "නැත (No)"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {item.promiseReason || (item.type === "extension" ? "Extension Visit" : "Active")}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-teal-400">
                    {item.salesVolumeKg || item.expectedLeafQty || "-"} {item.salesVolumeKg || item.expectedLeafQty ? "Kg" : ""}
                  </td>

                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedEntry(item)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("මෙම වාර්තාව මැකීමට ඔබට විශ්වාසද?")) {
                            onDeleteEntry(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Record Details Modal */}
      <EntryDetailsModal
        entry={selectedEntry}
        isOpen={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        onDelete={(id) => {
          onDeleteEntry(id);
          setSelectedEntry(null);
        }}
        theme={theme}
      />
    </div>
  );
};
