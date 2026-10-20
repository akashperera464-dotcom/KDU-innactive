"use client";

import React, { useState } from "react";
import { 
  Settings, 
  MapPin, 
  Tag, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  Layers 
} from "lucide-react";
import { RouteItem, StatusReasonItem, CustomQuestionItem } from "@/types";

const FACTORY_SHORT: Record<string, string> = {
  "Galpadihenna Tea Factory": "GALPADIHENNA",
  "Kalawana Leaf Center": "KALAWANA LC",
  "Kuttapitiya Tea Factory": "KUTTAPITIYA",
  "Madampe Tea Factory": "MADAMPE",
  "Matuwagala Tea Factory": "MATUWAGALA",
  "Peak view Tea Factory": "PEAK VIEW",
};

interface MasterSettingsTabProps {
  routes: RouteItem[];
  reasons: StatusReasonItem[];
  questions: CustomQuestionItem[];
  onAddRoute: (route: Partial<RouteItem>) => Promise<void>;
  onDeleteRoute: (id: string) => Promise<void>;
  onAddReason: (reason: Partial<StatusReasonItem>) => Promise<void>;
  onDeleteReason: (id: string) => Promise<void>;
  onAddQuestion: (q: Partial<CustomQuestionItem>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  theme: "dark" | "light";
}

export const MasterSettingsTab: React.FC<MasterSettingsTabProps> = ({
  routes,
  reasons,
  questions,
  onAddRoute,
  onDeleteRoute,
  onAddReason,
  onDeleteReason,
  onAddQuestion,
  onDeleteQuestion,
  theme,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"routes" | "reasons" | "questions">("routes");
  const isDark = theme === "dark";

  // Routes state
  const [routeSearch, setRouteSearch] = useState("");
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteFactory, setNewRouteFactory] = useState("Galpadihenna Tea Factory");

  // Reasons state
  const [newReasonSi, setNewReasonSi] = useState("");
  const [newReasonEn, setNewReasonEn] = useState("");
  const [newReasonColor, setNewReasonColor] = useState("#10B981");

  // Questions state
  const [newQTitle, setNewQTitle] = useState("");
  const [newQTarget, setNewQTarget] = useState<"inactive" | "extension" | "both">("both");
  const [newQType, setNewQType] = useState<"text" | "number" | "dropdown" | "boolean">("text");
  const [newQOptions, setNewQOptions] = useState("");

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(routeSearch.toLowerCase().trim())
  );

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim()) return;
    await onAddRoute({
      name: newRouteName.trim().toUpperCase(),
      factory: newRouteFactory,
    });
    setNewRouteName("");
  };

  const handleCreateReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReasonSi.trim() || !newReasonEn.trim()) return;
    const id = newReasonEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/^_+|_+$/g, "");

    await onAddReason({
      id,
      labelSi: newReasonSi.trim(),
      labelEn: newReasonEn.trim(),
      badgeColor: newReasonColor,
    });
    setNewReasonSi("");
    setNewReasonEn("");
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) return;
    await onAddQuestion({
      title: newQTitle.trim(),
      targetForm: newQTarget,
      inputType: newQType,
      options: newQOptions.trim() || undefined,
    });
    setNewQTitle("");
    setNewQOptions("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub Tabs Pill Navigation */}
      <div className={`flex flex-wrap gap-2 p-1.5 rounded-2xl border ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
      }`}>
        <button
          onClick={() => setActiveSubTab("routes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === "routes"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>තේ මාර්ග කළමනාකරණය (Routes - {routes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("reasons")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === "reasons"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>තත්ත්ව / හේතු සැකසුම් (Reasons / Status - {reasons.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("questions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === "questions"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>විශේෂ සමීක්ෂණ ප්‍රශ්න (Dynamic Survey Questions - {questions.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: ROUTES MANAGEMENT */}
      {/* ======================================================== */}
      {activeSubTab === "routes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Route Form */}
          <div className={`p-5 rounded-3xl border ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
          }`}>
            <h4 className="font-bold text-sm mb-1 text-emerald-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>නව මාර්ගයක් එක්කරන්න</span>
            </h4>
            <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Add a new collection route to factory network
            </p>

            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">මාර්ගයේ නම (Route Name) *</label>
                <input
                  type="text"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value.toUpperCase())}
                  placeholder="e.g. WELIGEPOLA UPPER"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">කර්මාන්ත ශාලාව (Factory)</label>
                <select
                  value={newRouteFactory}
                  onChange={(e) => setNewRouteFactory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="Galpadihenna Tea Factory">Galpadihenna Tea Factory</option>
                  <option value="Kalawana Leaf Center">Kalawana Leaf Center</option>
                  <option value="Kuttapitiya Tea Factory">Kuttapitiya Tea Factory</option>
                  <option value="Madampe Tea Factory">Madampe Tea Factory</option>
                  <option value="Matuwagala Tea Factory">Matuwagala Tea Factory</option>
                  <option value="Peak view Tea Factory">Peak view Tea Factory</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>මාර්ගය සුරකින්න (Add Route)</span>
              </button>
            </form>
          </div>

          {/* Routes List */}
          <div className={`lg:col-span-2 p-5 rounded-3xl border flex flex-col ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
          }`}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h4 className="font-bold text-sm text-emerald-400">
                පවතින මාර්ග ලැයිස්තුව ({filteredRoutes.length})
              </h4>

              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  placeholder="සොයන්න..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-100 border border-slate-200"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[450px] overflow-y-auto pr-1">
              {filteredRoutes.map((r) => (
                <div
                  key={r.id || r.name}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs group transition-all ${
                    isDark ? "bg-slate-800/70 border-slate-700 hover:border-emerald-500/40" : "bg-slate-50 border-slate-200 hover:border-emerald-500/40"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="font-semibold truncate block">{r.name}</span>
                    <span className={`text-[9px] font-bold tracking-wide ${isDark ? "text-emerald-400/80" : "text-emerald-600"}`}>
                      {FACTORY_SHORT[r.factory || ""] || r.factory || "—"}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`'${r.name}' මාර්ගය මකා දැමීමට ඔබට විශ්වාසද?`)) {
                        onDeleteRoute(r.id);
                      }
                    }}
                    className="text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 p-1"
                    title="Delete route"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: REASONS MANAGEMENT */}
      {/* ======================================================== */}
      {activeSubTab === "reasons" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Reason Form */}
          <div className={`p-5 rounded-3xl border ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
          }`}>
            <h4 className="font-bold text-sm mb-1 text-emerald-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>නව තත්ත්වයක් / හේතුවක්</span>
            </h4>
            <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Add new status option for supplier inspection
            </p>

            <form onSubmit={handleCreateReason} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">සිංහල නම (Sinhala Label) *</label>
                <input
                  type="text"
                  value={newReasonSi}
                  onChange={(e) => setNewReasonSi(e.target.value)}
                  placeholder="e.g. වගාව අලුත්වැඩියා කරමින් පවතී"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ඉංග්‍රීසි නම (English Label) *</label>
                <input
                  type="text"
                  value={newReasonEn}
                  onChange={(e) => setNewReasonEn(e.target.value)}
                  placeholder="e.g. Garden under renovation"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ලාංඡන වර්ණය (Badge Color)</label>
                <div className="flex gap-2">
                  {["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6"].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewReasonColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-7 h-7 rounded-full ${newReasonColor === col ? "ring-2 ring-white scale-110" : "opacity-70"}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>හේතුව සුරකින්න (Add Reason)</span>
              </button>
            </form>
          </div>

          {/* Reasons List */}
          <div className={`lg:col-span-2 p-5 rounded-3xl border flex flex-col ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
          }`}>
            <h4 className="font-bold text-sm text-emerald-400 mb-4">
              පවතින හේතු / තත්ත්ව ලැයිස්තුව ({reasons.length})
            </h4>

            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {reasons.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    isDark ? "bg-slate-800/70 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: r.badgeColor || "#10B981" }}
                    />
                    <div>
                      <span className="font-bold block">{r.labelSi}</span>
                      <span className="text-[11px] text-slate-400">{r.labelEn} ({r.id})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`'${r.labelSi}' හේතුව මකා දැමීමට ඔබට විශ්වාසද?`)) {
                        onDeleteReason(r.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: DYNAMIC SURVEY QUESTIONS */}
      {/* ======================================================== */}
      {activeSubTab === "questions" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Question Form */}
          <div className={`p-5 rounded-3xl border ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
          }`}>
            <h4 className="font-bold text-sm mb-1 text-emerald-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>නව සමීක්ෂණ ප්‍රශ්නයක්</span>
            </h4>
            <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Custom field automatically injected into forms & reports
            </p>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">ප්‍රශ්නය හෝ මාතෘකාව (Question Title) *</label>
                <input
                  type="text"
                  value={newQTitle}
                  onChange={(e) => setNewQTitle(e.target.value)}
                  placeholder="e.g. වගා බිමේ මුළු ප්‍රමාණය (අක්කර)"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ඉලක්ක පෝරමය (Target Form)</label>
                <select
                  value={newQTarget}
                  onChange={(e) => setNewQTarget(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="both">පෝරම දෙකටම (Both Forms)</option>
                  <option value="inactive">Active / Inactive Form පමණක්</option>
                  <option value="extension">Extension / RA Form පමණක්</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ආදාන වර්ගය (Input Type)</label>
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="text">පෙළ (Text)</option>
                  <option value="number">සංඛ්‍යා (Number)</option>
                  <option value="dropdown">තෝරාගැනීම් ලැයිස්තුව (Dropdown)</option>
                  <option value="boolean">ඔව් / නැත (Yes / No Boolean)</option>
                </select>
              </div>

              {newQType === "dropdown" && (
                <div>
                  <label className="block text-xs font-semibold mb-1">විකල්ප ලැයිස්තුව (Comma separated)</label>
                  <input
                    type="text"
                    value={newQOptions}
                    onChange={(e) => setNewQOptions(e.target.value)}
                    placeholder="වරක්, දෙවරක්, තුන්වරක්"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                      isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>ප්‍රශ්නය සුරකින්න (Add Question)</span>
              </button>
            </form>
          </div>

          {/* Questions List */}
          <div className={`lg:col-span-2 p-5 rounded-3xl border flex flex-col ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
          }`}>
            <h4 className="font-bold text-sm text-emerald-400 mb-4">
              ක්‍රියාත්මක සමීක්ෂණ ප්‍රශ්න ({questions.length})
            </h4>

            {questions.length === 0 ? (
              <p className="text-xs text-slate-400">කිසිදු සමීක්ෂණ ප්‍රශ්නයක් තවම ඇතුලත් කර නැත.</p>
            ) : (
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      isDark ? "bg-slate-800/70 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <span className="font-bold block text-sm">{q.title}</span>
                      <div className="flex gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                          Type: {q.inputType}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          Target: {q.targetForm}
                        </span>
                        {q.options && <span className="truncate max-w-[200px]">Opts: {q.options}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`'${q.title}' ප්‍රශ්නය මකා දැමීමට ඔබට විශ්වාසද?`)) {
                          onDeleteQuestion(q.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
