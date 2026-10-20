"use client";

import React from "react";
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Trash2, 
  ExternalLink, 
  Sprout, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { Entry } from "@/types";

interface EntryDetailsModalProps {
  entry: Entry | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  theme: "dark" | "light";
}

export const EntryDetailsModal: React.FC<EntryDetailsModalProps> = ({
  entry,
  isOpen,
  onClose,
  onDelete,
  theme,
}) => {
  if (!isOpen || !entry) return null;
  const isDark = theme === "dark";

  let dynamicParsed: Record<string, any> = {};
  try {
    if (entry.customFieldsJson) {
      dynamicParsed = JSON.parse(entry.customFieldsJson);
    }
  } catch (err) {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border transition-all ${
        isDark ? "bg-slate-900 border-emerald-500/30 text-white" : "bg-white border-emerald-200 text-slate-900"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{entry.supplierName}</h3>
                {entry.supplierNo && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                    #{entry.supplierNo}
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {entry.type === "inactive" ? "Inactive Supplier Form" : "Extension Visit / RA Form"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-black hover:bg-slate-100"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-xs">
          {/* Top Info Grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl ${
            isDark ? "bg-slate-800/80 border border-slate-700" : "bg-slate-50 border border-slate-200"
          }`}>
            <div>
              <span className="text-[10px] text-slate-400 block">දිනය & වේලාව (Date & Time)</span>
              <span className="font-semibold">{entry.date} {entry.time}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">නිලධාරී (Collector)</span>
              <span className="font-semibold">{entry.collectorId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">මාර්ගය (Route)</span>
              <span className="font-semibold text-emerald-400">{entry.route || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">කර්මාන්ත ශාලාව (Factory)</span>
              <span className="font-semibold truncate block">{entry.factory || "Galpadihenna"}</span>
            </div>
          </div>

          {/* Contact & Status Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
            }`}>
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>සැපයුම්කරු විස්තර (Supplier Info)</span>
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">දුරකථන (Phone):</span>
                  <span className="font-medium">{entry.phoneNumber || "නැත (None)"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">හැඳුනුම්පත් (NIC):</span>
                  <span className="font-medium">{entry.nic || "නැත (None)"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">දළු ලබාදෙන්නේද:</span>
                  <span className="font-bold text-emerald-400">{entry.willGive || "ඔව්"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">හේතුව / තත්ත්වය:</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {entry.promiseReason || "None"}
                  </span>
                </div>
                {entry.salesVolumeKg && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">අලෙවි ප්‍රමාණය:</span>
                    <span className="font-bold font-mono">{entry.salesVolumeKg} Kg ({entry.salesVolumeDate || ""})</span>
                  </div>
                )}
                {entry.address && (
                  <div>
                    <span className="text-slate-400 block">ලිපිනය (Address):</span>
                    <p className="mt-0.5 font-medium">{entry.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* GPS & Observations */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
            }`}>
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>ස්ථානය සහ සටහන් (Location & Actions)</span>
              </h4>
              <div className="space-y-2">
                {entry.gpsLocation && (
                  <div>
                    <span className="text-slate-400 block">GPS ස්ථානය:</span>
                    <a
                      href={`https://maps.google.com/?q=${entry.gpsLocation}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-emerald-400 hover:underline flex items-center gap-1 font-bold mt-0.5"
                    >
                      <span>{entry.gpsLocation}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {entry.gpsAccuracy === "fallback" ? (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        <span>අනුමාන ස්ථානයක් (approximate — no GPS signal at submission)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>නිවැරදි GPS ස්ථානය (precise lock at submission)</span>
                      </span>
                    )}
                  </div>
                )}

                {entry.actionsTaken && (
                  <div>
                    <span className="text-slate-400 block">ගනු ලැබූ ක්‍රියාමාර්ග (Actions Taken):</span>
                    <p className="mt-1 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 italic">
                      "{entry.actionsTaken}"
                    </p>
                  </div>
                )}

                {entry.comments && (
                  <div>
                    <span className="text-slate-400 block">නිරීක්ෂණ (Field Observations):</span>
                    <p className="mt-1 p-2 rounded-xl bg-slate-800/40 italic">
                      "{entry.comments}"
                    </p>
                  </div>
                )}

                {entry.routeProblems && (
                  <div>
                    <span className="text-slate-400 block">මාර්ග ගැටළු (Route Issues):</span>
                    <p className="mt-0.5 text-amber-400 font-medium">{entry.routeProblems}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Worker Details (If present) */}
          {(entry.permWorkerName || entry.tempWorkersCount) && (
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
            }`}>
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>සේවක තොරතුරු (Worker Information)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block">ස්ථිර සේවක නම:</span>
                  <span className="font-semibold">{entry.permWorkerName || "නැත"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ස්ත්‍රී/පුරුෂභාවය:</span>
                  <span className="font-semibold">{entry.permWorkerGender || "නැත"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">උපන් වර්ෂය:</span>
                  <span className="font-semibold">{entry.permWorkerBirthYear || "නැත"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">දෛනික වැටුප:</span>
                  <span className="font-semibold font-mono">
                    {entry.permWorkerWages ? `LKR ${entry.permWorkerWages}` : "නැත"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rainforest Alliance 6-Point Audit Checklist (If extension form) */}
          {entry.type === "extension" && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
            }`}>
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Sprout className="w-4 h-4" />
                <span>Rainforest Alliance (RA) තිරසාර පරීක්ෂාව (6-Point Checklist)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-800/40 flex justify-between items-center">
                  <span>1. කැලෑ නොකැපීම (No Deforestation) [6.1.1]:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${entry.raNoDeforestation === "නැත (No)" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {entry.raNoDeforestation || "නැත (No)"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/40 flex justify-between items-center">
                  <span>2. ඇළ, දොළ ආරක්ෂාව (Riparian Buffer) [6.3.1]:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${entry.raRiparianBuffer === "ඔව් (Yes)" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {entry.raRiparianBuffer || "ඔව් (Yes)"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/40 flex justify-between items-center">
                  <span>3. අපද්‍රව්‍ය ගිනි නොතැබීම (No Waste Burning) [6.7.2]:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${entry.raNoWasteBurning === "නැත (No)" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {entry.raNoWasteBurning || "නැත (No)"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/40 flex justify-between items-center">
                  <span>4. වැසි ජලය එකතු කිරීම (Rainwater) [6.5.5]:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${entry.raRainwaterHarvesting === "ඔව් (Yes)" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-300"}`}>
                    {entry.raRainwaterHarvesting || "ඔව් (Yes)"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/40 flex justify-between items-center">
                  <span>5. පස සේදියාම පාලනය (Soil Erosion) [6.4.5]:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${entry.raSoilErosion === "ඔව් (Yes)" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {entry.raSoilErosion || "ඔව් (Yes)"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/40 flex justify-between items-center">
                  <span>6. වනසතුන් ආරක්ෂා කිරීම (Wildlife) [6.4.1]:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${entry.raWildlifeProtection === "ඔව් (Yes)" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {entry.raWildlifeProtection || "ඔව් (Yes)"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Fields (If any) */}
          {Object.keys(dynamicParsed).length > 0 && (
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
            }`}>
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>විශේෂ සමීක්ෂණ දත්ත (Custom Survey Answers)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(dynamicParsed).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-xl bg-slate-800/30 flex justify-between">
                    <span className="text-slate-400">{k}:</span>
                    <span className="font-semibold text-emerald-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-emerald-500/20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm("මෙම වාර්තාව මැකීමට ඔබට විශ්වාසද? (Are you sure to delete this entry?)")) {
                onDelete(entry.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>වාර්තාව මකන්න (Delete)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            වසන්න (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
