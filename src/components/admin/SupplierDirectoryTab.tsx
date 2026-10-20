"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Building2,
  Search,
  Plus,
  Trash2,
  Edit3,
  UserCheck,
  X,
  FileSpreadsheet,
  Upload,
  Scissors,
  ClipboardPaste,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Supplier, RouteItem } from "@/types";

interface SupplierDirectoryTabProps {
  suppliers: Supplier[];
  routes: RouteItem[];
  onAddSupplier: (supplier: Partial<Supplier>) => Promise<void>;
  onBulkAddSuppliers: (items: Partial<Supplier>[], defaultStatus: string) => Promise<{ imported: number; skipped: number }>;
  onUpdateSupplier: (id: string, patch: Partial<Supplier>) => Promise<void>;
  onDeleteSupplier: (id: string) => Promise<void>;
  theme: "dark" | "light";
}

/* ---------- flexible header mapping for Excel/CSV extraction ---------- */
const HEADER_MAP: { field: keyof Supplier | "prunedDate"; keys: string[] }[] = [
  { field: "supplierNo", keys: ["supplierno", "no", "number", "suppliernumber", "supplierid", "suppliercode", "id"] },
  { field: "name", keys: ["name", "suppliername", "fullname", "supplier"] },
  { field: "phone", keys: ["phone", "phonenumber", "telephone", "mobile", "contact", "tp", "phoneNo"] },
  { field: "nic", keys: ["nic", "nicno", "idno", "nationalid"] },
  { field: "route", keys: ["route", "tearoute", "routename"] },
  { field: "factory", keys: ["factory", "factoryname"] },
  { field: "previousReason", keys: ["reason", "status", "previousreason", "adminreason", "inactivereason"] },
  { field: "lastWeightKg", keys: ["weight", "lastweight", "lastweightkg", "kg", "lastsuppliedweight", "lastsupplied"] },
  { field: "prunedDate", keys: ["pruneddate", "prunedon", "කප්පාදුදිනය"] },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function mapRow(raw: Record<string, any>): Partial<Supplier> & { prunedDate?: string } {
  const out: Record<string, any> = {};
  const entries = Object.entries(raw);
  for (const { field, keys } of HEADER_MAP) {
    for (const [k, v] of entries) {
      if (keys.includes(norm(k)) && v !== undefined && String(v).trim() !== "") {
        out[field] = String(v).trim();
        break;
      }
    }
  }
  return out as Partial<Supplier> & { prunedDate?: string };
}

export const SupplierDirectoryTab: React.FC<SupplierDirectoryTabProps> = ({
  suppliers,
  routes,
  onAddSupplier,
  onBulkAddSuppliers,
  onUpdateSupplier,
  onDeleteSupplier,
  theme,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "inactive" | "active">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // single form
  const [supplierNo, setSupplierNo] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [route, setRoute] = useState("OLUGALA");
  const [factory, setFactory] = useState("Galpadihenna Tea Factory");
  const [previousReason, setPreviousReason] = useState("provides_leaves");
  const [lastWeightKg, setLastWeightKg] = useState("100.0");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [prunedDate, setPrunedDate] = useState("");
  const [loading, setLoading] = useState(false);

  // import modal
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<(Partial<Supplier> & { prunedDate?: string })[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importStatus, setImportStatus] = useState<"active" | "inactive">("inactive");
  const [pasteText, setPasteText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";

  const filteredSuppliers = suppliers.filter((s) => {
    if (statusFilter !== "all" && (s.status || "active") !== statusFilter) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      s.supplierNo.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.nic && s.nic.toLowerCase().includes(q)) ||
      (s.route && s.route.toLowerCase().includes(q))
    );
  });

  const inactiveCount = suppliers.filter((s) => (s.status || "active") === "inactive").length;

  /* ---------- Excel / CSV extraction ---------- */
  const handleFile = async (file: File) => {
    setImportResult("");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
      const mapped = json.map(mapRow).filter((r) => r.supplierNo || r.name);
      setImportRows(mapped);
      setImportFileName(file.name);
    } catch (err: any) {
      setImportResult(`ගොනුව කියවීම අසාර්ථකයි (Failed to read file): ${err?.message || err}`);
    }
  };

  const handlePaste = () => {
    setImportResult("");
    const lines = pasteText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const delim = lines[0].includes("\t") ? "\t" : lines[0].includes("|") ? "|" : ",";
    const first = lines[0].split(delim).map((c) => c.trim());
    const looksLikeHeader = first.some((c) => /no|name|phone|nic|route|factory|reason|weight/i.test(c));

    const rows: (Partial<Supplier> & { prunedDate?: string })[] = [];
    const start = looksLikeHeader ? 1 : 0;
    for (let i = start; i < lines.length; i++) {
      const cols = lines[i].split(delim).map((c) => c.trim());
      if (looksLikeHeader) {
        const obj: Record<string, any> = {};
        first.forEach((h, idx) => (obj[h] = cols[idx] || ""));
        rows.push(mapRow(obj));
      } else {
        rows.push({
          supplierNo: cols[0],
          name: cols[1],
          phone: cols[2],
          nic: cols[3],
          route: cols[4],
          factory: cols[5],
          previousReason: cols[6],
          lastWeightKg: cols[7],
        });
      }
    }
    const valid = rows.filter((r) => r.supplierNo && r.name);
    setImportRows(valid);
    setImportFileName(`Pasted ${valid.length} rows`);
  };

  const runImport = async () => {
    setImporting(true);
    setImportResult("");
    const res = await onBulkAddSuppliers(importRows, importStatus);
    setImporting(false);
    setImportResult(`✅ ආයාත කළා: ${res.imported}ක් • මග හැරුණා: ${res.skipped}ක් (Imported ${res.imported}, skipped ${res.skipped})`);
    setImportRows([]);
    setPasteText("");
    setTimeout(() => setShowImport(false), 1600);
  };

  /* ---------- single add/edit ---------- */
  const openAdd = () => {
    setEditingId(null);
    setSupplierNo("");
    setName("");
    setPhone("");
    setNic("");
    setRoute("OLUGALA");
    setFactory("Galpadihenna Tea Factory");
    setPreviousReason("provides_leaves");
    setLastWeightKg("100.0");
    setStatus("active");
    setPrunedDate("");
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingId(s.id);
    setSupplierNo(s.supplierNo);
    setName(s.name);
    setPhone(s.phone || "");
    setNic(s.nic || "");
    setRoute(s.route || "OLUGALA");
    setFactory(s.factory || "Galpadihenna Tea Factory");
    setPreviousReason(s.previousReason || "provides_leaves");
    setLastWeightKg(s.lastWeightKg || "0");
    setStatus((s.status as any) || "active");
    setPrunedDate(s.prunedDate || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierNo.trim() || !name.trim()) return;
    setLoading(true);
    await onAddSupplier({
      id: editingId || undefined,
      supplierNo: supplierNo.trim(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      nic: nic.trim() || undefined,
      route,
      factory,
      previousReason,
      lastWeightKg,
      status,
      prunedDate: prunedDate || undefined,
    });
    setLoading(false);
    setShowModal(false);
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
  }`;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>ලියාපදිංචි තේ සැපයුම්කරුවන් (Suppliers Directory)</span>
          </h3>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {suppliers.length} smallholders • <span className="text-amber-400 font-bold">{inactiveCount} අක්‍රිය (inactive)</span> — කාර්යාල ලැයිස්තුව Excel/CSV මගින් ආයාත කරන්න
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 shadow-lg shadow-teal-700/30 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel / CSV</span>
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="සැපයුම්කරු අංකය, නම, හැඳුනුම් අංකය, හෝ මාර්ගය අනුව සොයන්න..."
            className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDark ? "bg-slate-900 border border-slate-800 text-white" : "bg-white border border-slate-200 text-slate-900 shadow-sm"
            }`}
          />
        </div>
        <div className={`flex items-center p-1 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          {(["all", "inactive", "active"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all ${
                statusFilter === f
                  ? f === "inactive"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "bg-emerald-600 text-white shadow"
                  : isDark
                    ? "text-slate-400"
                    : "text-slate-600"
              }`}
            >
              {f === "all" ? `All (${suppliers.length})` : f === "inactive" ? `Inactive (${inactiveCount})` : `Active (${suppliers.length - inactiveCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-3xl border overflow-hidden ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-md"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <tr>
                <th className="px-4 py-3.5 font-bold">අංකය (No)</th>
                <th className="px-4 py-3.5 font-bold">නම (Name)</th>
                <th className="px-4 py-3.5 font-bold">දුරකථන (Phone)</th>
                <th className="px-4 py-3.5 font-bold">මාර්ගය (Route)</th>
                <th className="px-4 py-3.5 font-bold">තත්ත්වය (Status)</th>
                <th className="px-4 py-3.5 font-bold">අවසන් බර (Kg)</th>
                <th className="px-4 py-3.5 font-bold text-right">ක්‍රියාමාර්ග</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {filteredSuppliers.map((s) => {
                const st = (s.status || "active") as string;
                return (
                  <tr key={s.id} className={`hover:bg-emerald-500/5 transition-colors ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">#{s.supplierNo}</td>
                    <td className="px-4 py-3 font-semibold">
                      {s.name}
                      <span className={`block text-[10px] font-normal ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {s.previousReason || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">{s.route || "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {st === "inactive" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          INACTIVE
                          {s.prunedDate && (
                            <span title={`කප්පාදු කළ දිනය ${s.prunedDate}`} className="inline-flex items-center gap-0.5 text-amber-300">
                              <Scissors className="w-3 h-3" />
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-teal-400">{s.lastWeightKg || "0"} Kg</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`'${s.name}' සැපයුම්කරු මකා දැමීමට ඔබට විශ්වාසද?`)) onDeleteSupplier(s.id);
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= IMPORT MODAL ================= */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border ${isDark ? "bg-slate-900 border-teal-500/30 text-white" : "bg-white border-teal-200 text-slate-900"}`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-teal-500/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">කාර්යාල ලැයිස්තුව ආයාත කිරීම (Excel / CSV Import)</h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Columns auto-detected: Supplier No | Name | Phone | NIC | Route | Factory | Reason | Weight | Pruned Date
                  </p>
                </div>
              </div>
              <button onClick={() => setShowImport(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File picker */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all hover:border-teal-400 ${
                  isDark ? "border-slate-700 bg-slate-800/40" : "border-slate-300 bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <p className="text-sm font-extrabold">Excel / CSV ගොනුවක් තෝරන්න (Click to choose file)</p>
                <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>.xlsx, .xls, .csv — first sheet වලින් දත්ත ලබාගනී</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>

              {/* Paste fallback */}
              <div>
                <label className={`text-xs font-bold flex items-center gap-1.5 mb-1.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  <ClipboardPaste className="w-3.5 h-3.5 text-teal-400" />
                  ...නැත්නම් පේළි අලවන්න (or paste rows: No, Name, Phone, NIC, Route, Factory, Reason, Weight)
                </label>
                <textarea
                  rows={3}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={"635, O.K.C.P. KUMARA, 0771234567, 880430840V, OLUGALA, Galpadihenna Tea Factory, garden_pruned, 0\n1024, P.G. Sunil Shantha, 0714589632, , GONAKUMBURA, Galpadihenna Tea Factory, fertilizer_issue, 85"}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono ${isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300"}`}
                />
                <button onClick={handlePaste} className="mt-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold bg-teal-700 hover:bg-teal-600 text-white transition-all">
                  Extract Pasted Data
                </button>
              </div>

              {/* Import as status */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>ලැයිස්තුව සලකුණු කරන්න:</span>
                <button
                  onClick={() => setImportStatus("inactive")}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all ${
                    importStatus === "inactive" ? "bg-amber-500 text-slate-950 border-amber-500" : isDark ? "border-slate-700 text-slate-400" : "border-slate-300 text-slate-600"
                  }`}
                >
                  අක්‍රිය සැපයුම්කරුවන් (Inactive List)
                </button>
                <button
                  onClick={() => setImportStatus("active")}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all ${
                    importStatus === "active" ? "bg-emerald-600 text-white border-emerald-600" : isDark ? "border-slate-700 text-slate-400" : "border-slate-300 text-slate-600"
                  }`}
                >
                  සක්‍රිය (Active)
                </button>
              </div>

              {/* Preview */}
              {importRows.length > 0 && (
                <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <div className={`px-3.5 py-2 text-[11px] font-extrabold flex items-center gap-1.5 ${isDark ? "bg-slate-800 text-teal-300" : "bg-teal-50 text-teal-700"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {importFileName} — අස්ථානගත පේළි {importRows.length} ක් හමුවිය (extracted rows)
                  </div>
                  <div className="max-h-52 overflow-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className={isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}>
                        <tr>
                          <th className="px-3 py-2">No</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">Route</th>
                          <th className="px-3 py-2">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-500/10">
                        {importRows.slice(0, 50).map((r, i) => (
                          <tr key={i} className={isDark ? "text-slate-300" : "text-slate-700"}>
                            <td className="px-3 py-1.5 font-mono font-bold text-emerald-400">{r.supplierNo || "—"}</td>
                            <td className="px-3 py-1.5">{r.name || "—"}</td>
                            <td className="px-3 py-1.5">{r.phone || "—"}</td>
                            <td className="px-3 py-1.5">{r.route || "—"}</td>
                            <td className="px-3 py-1.5">{r.previousReason || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importResult && (
                <p className={`text-xs font-bold flex items-center gap-1.5 ${importResult.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>
                  <AlertCircle className="w-4 h-4" />
                  {importResult}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowImport(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                >
                  වසන්න (Close)
                </button>
                <button
                  onClick={runImport}
                  disabled={importRows.length === 0 || importing}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 shadow-lg shadow-teal-700/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{importing ? "ආයාත කරමින්..." : `ආයාත කරන්න (Import ${importRows.length || ""})`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border ${isDark ? "bg-slate-900 border-emerald-500/30 text-white" : "bg-white border-emerald-200 text-slate-900"}`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{editingId ? "සැපයුම්කරු සංස්කරණය (Edit)" : "නව සැපයුම්කරුවෙකු (Add)"}</h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Directory record — extension forms වලට ස්වයංක්‍රීයව පෙනේ</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">සැපයුම්කරු අංකය *</label>
                  <input type="text" value={supplierNo} onChange={(e) => setSupplierNo(e.target.value)} placeholder="e.g. 1024" required className={`${inputCls} font-mono font-bold`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">සම්පූර්ණ නම *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. P.G. Sunil Shantha" required className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">දුරකථන අංකය</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xxxxxxxx" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">හැඳුනුම්පත (NIC)</label>
                  <input type="text" value={nic} onChange={(e) => setNic(e.target.value)} placeholder="792140523V" className={`${inputCls} font-mono`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">මාර්ගය (Route)</label>
                  <select value={route} onChange={(e) => setRoute(e.target.value)} className={inputCls}>
                    {routes.map((r) => (
                      <option key={r.id || r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">කර්මාන්ත ශාලාව</label>
                  <select value={factory} onChange={(e) => setFactory(e.target.value)} className={inputCls}>
                    <option value="Galpadihenna Tea Factory">Galpadihenna Tea Factory</option>
                    <option value="Kalawana Leaf Center">Kalawana Leaf Center</option>
                    <option value="Kuttapitiya Tea Factory">Kuttapitiya Tea Factory</option>
                    <option value="Madampe Tea Factory">Madampe Tea Factory</option>
                    <option value="Matuwagala Tea Factory">Matuwagala Tea Factory</option>
                    <option value="Peak view Tea Factory">Peak view Tea Factory</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">හේතුව (Reason / Status)</label>
                  <input type="text" value={previousReason} onChange={(e) => setPreviousReason(e.target.value)} placeholder="e.g. garden_pruned" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">අවසන් බර (Kg)</label>
                  <input type="number" step="0.1" value={lastWeightKg} onChange={(e) => setLastWeightKg(e.target.value)} className={`${inputCls} font-mono font-bold`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">ලැයිස්තු තත්ත්වය (List Status)</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputCls}>
                    <option value="active">සක්‍රිය (Active)</option>
                    <option value="inactive">අක්‍රිය (Inactive)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-amber-400" />
                    කප්පාදු කළ දිනය (Pruned Date)
                  </label>
                  <input type="date" value={prunedDate} onChange={(e) => setPrunedDate(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
                  අවලංගු කරන්න
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30">
                  {loading ? "සුරකිමින්..." : "සුරකින්න (Save Supplier)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
