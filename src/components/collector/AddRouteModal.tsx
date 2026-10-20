"use client";

import React, { useState } from "react";
import { X, MapPin, Plus, Check } from "lucide-react";
import { RouteItem } from "@/types";

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteAdded: (newRoute: RouteItem) => void;
  theme: "dark" | "light";
  currentFactory?: string;
}

export const AddRouteModal: React.FC<AddRouteModalProps> = ({
  isOpen,
  onClose,
  onRouteAdded,
  theme,
  currentFactory = "Galpadihenna Tea Factory",
}) => {
  const [routeName, setRouteName] = useState("");
  const [factory, setFactory] = useState(currentFactory || "Galpadihenna Tea Factory");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;
  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim()) {
      setError("කරුණාකර මාර්ගයේ නම ඇතුලත් කරන්න (Route name required)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cleanName = routeName.trim().toUpperCase();
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, factory }),
      });

      const data = await res.json();
      if (data.success && data.route) {
        onRouteAdded(data.route);
        onClose();
        setRouteName("");
      } else {
        setError(data.message || "Failed to add route");
      }
    } catch (err: any) {
      // Offline fallback
      const cleanName = routeName.trim().toUpperCase();
      const fallbackRoute: RouteItem = {
        id: `route-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: cleanName,
        factory,
      };
      onRouteAdded(fallbackRoute);
      onClose();
      setRouteName("");
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
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">නව මාර්ගයක් ඇතුලත් කරන්න</h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Add New Tea Route</p>
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
            <label className="block text-xs font-semibold mb-1">මාර්ගයේ නම (Route Name in UPPERCASE) *</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value.toUpperCase())}
              placeholder="e.g. WELIGEPOLA UPPER"
              required
              autoFocus
              className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">කර්මාන්ත ශාලාව (Factory)</label>
            <select
              value={factory}
              onChange={(e) => setFactory(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
              <span>{loading ? "සුරකිමින්..." : "සුරකින්න (Save Route)"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
