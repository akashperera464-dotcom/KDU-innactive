"use client";

import React, { useState } from "react";
import { Users, UserPlus, Shield, User, Trash2, Key, MapPin, X } from "lucide-react";
import { User as UserType, RouteItem } from "@/types";

interface UserManagementTabProps {
  users: UserType[];
  routes: RouteItem[];
  onAddUser: (user: Partial<UserType> & { password?: string }) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  theme: "dark" | "light";
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  routes,
  onAddUser,
  onDeleteUser,
  theme,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"collector" | "admin">("collector");
  const [assignedRoute, setAssignedRoute] = useState("OLUGALA");
  const [password, setPassword] = useState("123");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !name.trim()) return;

    setLoading(true);
    await onAddUser({
      employeeId: employeeId.trim(),
      name: name.trim(),
      role,
      assignedRoute: role === "admin" ? "ALL" : assignedRoute,
      password: password.trim() || "123",
    });

    setLoading(false);
    setShowAddModal(false);
    setEmployeeId("");
    setName("");
    setPassword("123");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>පරිශීලක කළමනාකරණය (User Management)</span>
          </h3>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            ක්ෂේත්‍ර නිලධාරීන් සහ පද්ධති පරිපාලකයින් ({users.length} registered accounts)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>නව පරිශීලකයෙකු එක්කරන්න (Add User)</span>
        </button>
      </div>

      {/* Users Table / Grid */}
      <div className={`rounded-3xl border overflow-hidden ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-md"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <tr>
                <th className="px-5 py-3.5 font-bold">සේවක අංකය (Employee ID)</th>
                <th className="px-5 py-3.5 font-bold">නම (Full Name)</th>
                <th className="px-5 py-3.5 font-bold">භූමිකාව (Role)</th>
                <th className="px-5 py-3.5 font-bold">පවරා ඇති මාර්ගය (Assigned Route)</th>
                <th className="px-5 py-3.5 font-bold text-right">ක්‍රියාමාර්ග (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-emerald-500/5 transition-colors ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                    {u.employeeId}
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <Shield className="w-3 h-3" />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <User className="w-3 h-3" />
                        <span>Field Officer</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {u.assignedRoute || "ALL"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`'${u.name}' පරිශීලකයා මකා දැමීමට ඔබට විශ්වාසද?`)) {
                          onDeleteUser(u.id);
                        }
                      }}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all ${
            isDark ? "bg-slate-900 border-emerald-500/30 text-white" : "bg-white border-emerald-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">නව පරිශීලකයෙකු ලියාපදිංචි කිරීම</h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Register Officer or Admin</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-1.5 rounded-xl transition-all ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-black hover:bg-slate-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">සේවක අංකය / Username *</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. kamal_collector"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">සම්පූර්ණ නම (Full Name) *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kamal Gunaratne"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">භූමිකාව (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="collector">Collector (Field Officer)</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">මාර්ගය (Route)</label>
                  <select
                    value={assignedRoute}
                    onChange={(e) => setAssignedRoute(e.target.value)}
                    disabled={role === "admin"}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="ALL">ALL (All Routes)</option>
                    {routes.map((r) => (
                      <option key={r.id || r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">මුරපදය (Password)</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. 123"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <span>{loading ? "සුරකිමින්..." : "පරිශීලකයා සුරකින්න (Save User)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
