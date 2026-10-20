"use client";

import React, { useState } from "react";
import { X, Tag, Plus } from "lucide-react";
import { StatusReasonItem } from "@/types";

interface AddReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReasonAdded: (newReason: StatusReasonItem) => void;
  theme: "dark" | "light";
}

export const AddReasonModal: React.FC<AddReasonModalProps> = ({
  isOpen,
  onClose,
  onReasonAdded,
  theme,
}) => {
  const [labelSi, setLabelSi] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [badgeColor, setBadgeColor] = useState("#10B981");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;
  const isDark = theme === "dark";

  const colorPresets = [
    { label: "Emerald", value: "#10B981" },
    { label: "Amber", value: "#F59E0B" },
    { label: "Blue", value: "#3B82F6" },
    { label: "Purple", value: "#8B5CF6" },
    { label: "Rose", value: "#F43F5E" },
    { label: "Teal", value: "#14B8A6" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelSi.trim() || !labelEn.trim()) {
      setError("කරුණාකර සිංහල සහ ඉංග්‍රීසි නම් දෙකම ඇතුලත් කරන්න (Both labels required)");
      return;
    }

    setLoading(true);
    setError("");

    const id = labelEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/^_+|_+$/g, "");

    try {
      const res = await fetch("/api/reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, labelSi: labelSi.trim(), labelEn: labelEn.trim(), badgeColor }),
      });

      const data = await res.json();
      if (data.success && data.reason) {
        onReasonAdded(data.reason);
        onClose();
        setLabelSi("");
        setLabelEn("");
      } else {
        setError(data.message || "Failed to add reason");
      }
    } catch (err: any) {
      // Offline fallback
      const fallbackReason: StatusReasonItem = {
        id,
        labelSi: labelSi.trim(),
        labelEn: labelEn.trim(),
        badgeColor,
      };
      onReasonAdded(fallbackReason);
      onClose();
      setLabelSi("");
      setLabelEn("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all ${
        isDark ? "bg-slate-900 border-emerald-500/30 text-white" : "bg-white border-emerald-200 text-slate-900"
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">නව හේතුවක් / තත්ත්වයක් ඇතුලත් කරන්න</h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Add New Reason / Status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-black hover:bg-slate-100"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">සිංහල නම (Sinhala Label) *</label>
            <input
              type="text"
              value={labelSi}
              onChange={(e) => setLabelSi(e.target.value)}
              placeholder="e.g. වගාව අලුත්වැඩියා කරමින් පවතී"
              required
              autoFocus
              className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ඉංග්‍රීසි නම (English Label) *</label>
            <input
              type="text"
              value={labelEn}
              onChange={(e) => setLabelEn(e.target.value)}
              placeholder="e.g. Garden under renovation"
              required
              className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ලාංඡන වර්ණය (Badge Color)</label>
            <div className="flex gap-2 items-center">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setBadgeColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full transition-transform ${badgeColor === c.value ? "ring-2 ring-white scale-110 shadow-md" : "opacity-70 hover:opacity-100"}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              අවලංගු කරන්න (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? "සුරකිමින්..." : "සුරකින්න (Save Status)"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
