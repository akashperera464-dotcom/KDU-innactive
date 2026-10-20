"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Package, 
  Settings, 
  Sparkles, 
  Sprout 
} from "lucide-react";
import { 
  Entry, 
  User as UserType, 
  Supplier, 
  RouteItem, 
  StatusReasonItem, 
  CustomQuestionItem 
} from "@/types";
import { AnalyticsTab } from "./AnalyticsTab";
import { UserManagementTab } from "./UserManagementTab";
import { SupplierDirectoryTab } from "./SupplierDirectoryTab";
import { MasterSettingsTab } from "./MasterSettingsTab";
import { ReminderBell } from "./ReminderBell";

interface AdminDashboardProps {
  user: UserType;
  entries: Entry[];
  users: UserType[];
  suppliers: Supplier[];
  routes: RouteItem[];
  reasons: StatusReasonItem[];
  questions: CustomQuestionItem[];
  theme: "dark" | "light";
  onRefresh: () => void;
  onDeleteEntry: (id: string) => Promise<void>;
  onAddUser: (user: Partial<UserType> & { password?: string }) => Promise<void>;
  onUpdateUser: (id: string, patch: Partial<UserType> & { password?: string }) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onAddSupplier: (supplier: Partial<Supplier>) => Promise<void>;
  onBulkAddSuppliers: (items: Partial<Supplier>[], defaultStatus: string) => Promise<{ imported: number; skipped: number }>;
  onUpdateSupplier: (id: string, patch: Partial<Supplier>) => Promise<void>;
  onDeleteSupplier: (id: string) => Promise<void>;
  onAddRoute: (route: Partial<RouteItem>) => Promise<void>;
  onDeleteRoute: (id: string) => Promise<void>;
  onAddReason: (reason: Partial<StatusReasonItem>) => Promise<void>;
  onDeleteReason: (id: string) => Promise<void>;
  onAddQuestion: (q: Partial<CustomQuestionItem>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  entries,
  users,
  suppliers,
  routes,
  reasons,
  questions,
  theme,
  onRefresh,
  onDeleteEntry,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddSupplier,
  onBulkAddSuppliers,
  onUpdateSupplier,
  onDeleteSupplier,
  onAddRoute,
  onDeleteRoute,
  onAddReason,
  onDeleteReason,
  onAddQuestion,
  onDeleteQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "suppliers" | "settings">("analytics");
  const isDark = theme === "dark";

  const tabs = [
    { id: "analytics", labelSi: "ප්‍රස්ථාර සහ දත්ත විග්‍රහය", labelEn: "Analytics", icon: BarChart3 },
    { id: "users", labelSi: "පරිශීලකයින්", labelEn: "Users", icon: Users },
    { id: "suppliers", labelSi: "සැපයුම්කරුවන්", labelEn: "Suppliers", icon: Package },
    { id: "settings", labelSi: "ප්‍රධාන සැකසුම්", labelEn: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Welcome & Navigation Bar */}
      <div className={`p-2 rounded-3xl border shadow-lg flex flex-wrap items-center justify-between gap-3 ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]"
                    : isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-black hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.labelEn}</span>
                <span className="hidden md:inline text-[11px] opacity-75 font-normal">
                  ({tab.labelSi})
                </span>
              </button>
            );
          })}
        </div>

        {/* Right cluster: reminders bell + factory status */}
        <div className="flex items-center gap-2.5">
          <ReminderBell
            suppliers={suppliers}
            entries={entries}
            theme={theme}
            onResolve={onUpdateSupplier}
          />

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold tracking-[0.2em]">
            <Sprout className="w-4 h-4 animate-spin text-emerald-400" />
            <span>KDU GROUP</span>
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "analytics" && (
        <AnalyticsTab
          entries={entries}
          reasons={reasons}
          routes={routes}
          users={users}
          suppliers={suppliers}
          onRefresh={onRefresh}
          onDeleteEntry={onDeleteEntry}
          theme={theme}
        />
      )}

      {activeTab === "users" && (
        <UserManagementTab
          users={users}
          routes={routes}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          theme={theme}
        />
      )}

      {activeTab === "suppliers" && (
        <SupplierDirectoryTab
          suppliers={suppliers}
          routes={routes}
          onAddSupplier={onAddSupplier}
          onBulkAddSuppliers={onBulkAddSuppliers}
          onUpdateSupplier={onUpdateSupplier}
          onDeleteSupplier={onDeleteSupplier}
          theme={theme}
        />
      )}

      {activeTab === "settings" && (
        <MasterSettingsTab
          routes={routes}
          reasons={reasons}
          questions={questions}
          onAddRoute={onAddRoute}
          onDeleteRoute={onDeleteRoute}
          onAddReason={onAddReason}
          onDeleteReason={onDeleteReason}
          onAddQuestion={onAddQuestion}
          onDeleteQuestion={onDeleteQuestion}
          theme={theme}
        />
      )}
    </div>
  );
};
