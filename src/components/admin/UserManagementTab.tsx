"use client";

import React, { useState } from "react";
import { Users, UserPlus, Shield, Leaf, Trash2, MapPin, Factory, X, Edit3 } from "lucide-react";
import { User as UserType, RouteItem } from "@/types";

interface UserManagementTabProps {
  users: UserType[];
  routes: RouteItem[];
  onAddUser: (user: Partial<UserType> & { password?: string }) => Promise<void>;
  onUpdateUser: (id: string, patch: Partial<UserType> & { password?: string }) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  theme: "dark" | "light";
}

const FACTORIES = [
  "Galpadihenna Tea Factory",
  "Kalawana Leaf Center",
  "Kuttapitiya Tea Factory",
  "Madampe Tea Factory",
  "Matuwagala Tea Factory",
  "Peak view Tea Factory",
];

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  routes,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  theme,
}) => {
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form fields
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"collector" | "admin">("collector");
  const [factory, setFactory] = useState("");
  const [assignedRoute, setAssignedRoute] = useState("");
  const [password, setPassword] = useState("123");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";

  // routes cascade: filtered by selected factory (deduped by name)
  const dedupe = (list: RouteItem[]) => {
    const seen = new Set<string>();
    return list.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)));
  };
  const routeOptions = dedupe(
    factory ? routes.filter((r) => r.factory === factory) : routes
  );

  const openAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setEmployeeId("");
    setName("");
    setRole("collector");
    setFactory("");
    setAssignedRoute("");
    setPassword("123");
  };

  const openEdit = (u: UserType) => {
    setModalMode("edit");
    setEditingId(u.id);
    setEmployeeId(u.employeeId);
    setName(u.name);
    setRole(u.role === "admin" ? "admin" : "collector");
    setFactory(u.assignedFactory || "");
    setAssignedRoute(u.assignedRoute && u.assignedRoute !== "ALL" ? u.assignedRoute : "");
    setPassword(""); // blank = keep current password
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !name.trim()) return;

    setLoading(true);
    const payload = {
      employeeId: employeeId.trim(),
      name: name.trim(),
      role,
      assignedFactory: factory || null,
      assignedRoute: assignedRoute || null,
    };

    if (modalMode === "edit" && editingId) {
      const patch: Partial<UserType> & { password?: string } = { ...payload };
      if (password.trim()) patch.password = password.trim();
      await onUpdateUser(editingId, patch);
    } else {
      await onAddUser({ ...payload, password: password.trim() || "123" });
    }

    setLoading(false);
    setModalMode(null);
  };

  const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
  }`;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>පරිශීලක කළමනාකරණය (User Management)</span>
          </h3>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            ව්‍යාප්ති නිලධාරීන් සහ පද්ධති පරිපාලකයින් ({users.length} accounts) — එක් කරන්න, සංස්කරණය කරන්න, මකන්න
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>නව පරිශීලකයෙකු එක්කරන්න (Add User)</span>
        </button>
      </div>

      {/* Users table */}
      <div className={`rounded-3xl border overflow-hidden ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-md"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <tr>
                <th className="px-4 py-3.5 font-bold">සේවක අංකය (Employee ID)</th>
                <th className="px-4 py-3.5 font-bold">නම (Full Name)</th>
                <th className="px-4 py-3.5 font-bold">භූමිකාව (Role)</th>
                <th className="px-4 py-3.5 font-bold">කර්මාන්ත ශාලාව (Factory)</th>
                <th className="px-4 py-3.5 font-bold">මාර්ගය (Route)</th>
                <th className="px-4 py-3.5 font-bold text-right">ක්‍රියාමාර්ග (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-emerald-500/5 transition-colors ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">{u.employeeId}</td>
                  <td className="px-4 py-3 font-semibold">{u.name}</td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <Shield className="w-3 h-3" />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Leaf className="w-3 h-3" />
                        <span>Extension Officer</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.assignedFactory ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        <Factory className="w-3 h-3 text-emerald-400" />
                        {u.assignedFactory.replace(" Tea Factory", "").replace(" Leaf Center", " LC")}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">— සියල්ල (All)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.assignedRoute && u.assignedRoute !== "ALL" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        {u.assignedRoute}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">— සියල්ල (All)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        title="සංස්කරණය (Edit)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`'${u.name}' පරිශීලකයා මකා දැමීමට ඔබට විශ්වාසද?`)) onDeleteUser(u.id);
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                        title="මකන්න (Delete)"
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

      {/* ---------- Add / Edit modal ---------- */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border ${isDark ? "bg-slate-900 border-emerald-500/30 text-white" : "bg-white border-emerald-200 text-slate-900"}`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  {modalMode === "add" ? <UserPlus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {modalMode === "add" ? "නව පරිශීලකයෙකු ලියාපදිංචි කිරීම" : "පරිශීලකයා සංස්කරණය කිරීම"}
                  </h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {modalMode === "add" ? "Register Extension Officer or Admin" : "Edit account details"}
                  </p>
                </div>
              </div>
              <button onClick={() => setModalMode(null)} className={`p-1.5 rounded-xl transition-all ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-black hover:bg-slate-100"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">සේවක අංකය / Username *</label>
                <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. kamal_officer" required className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">සම්පූර්ණ නම (Full Name) *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kamal Gunaratne" required className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">භූමිකාව (Role)</label>
                <select value={role} onChange={(e) => setRole(e.target.value as any)} className={inputCls}>
                  <option value="collector">Extension Officer (Field Data)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Factory → Route cascade (both optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                    <Factory className="w-3 h-3 text-emerald-400" />
                    කර්මාන්ත ශාලාව (Factory)
                  </label>
                  <select
                    value={factory}
                    onChange={(e) => {
                      setFactory(e.target.value);
                      setAssignedRoute(""); // reset route when factory changes
                    }}
                    className={inputCls}
                  >
                    <option value="">නොමැත (None / All)</option>
                    {FACTORIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-400" />
                    මාර්ගය (Route)
                  </label>
                  <select value={assignedRoute} onChange={(e) => setAssignedRoute(e.target.value)} className={inputCls}>
                    <option value="">නොමැත (None / All)</option>
                    {routeOptions.map((r) => (
                      <option key={r.id || r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className={`text-[10px] -mt-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                කර්මාන්ත ශාලාවක් හෝ මාර්ගයක් තෝරා නොගත හැක — එවිට නිලධාරියාට සියල්ල ප්‍රවේශ වේ. (Factory & route are optional.)
              </p>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  මුරපදය (Password) {modalMode === "edit" && <span className="font-normal opacity-70">— හිස්ව තැබුවහොත් වත්මන් මුරපදයම රැඳේ (leave blank to keep)</span>}
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={modalMode === "edit" ? "(unchanged)" : "e.g. 123"}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalMode(null)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
                  අවලංගු කරන්න (Cancel)
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30">
                  {loading ? "සුරකිමින්..." : modalMode === "add" ? "පරිශීලකයා සුරකින්න (Save User)" : "යාවත්කාලීන කරන්න (Update)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
