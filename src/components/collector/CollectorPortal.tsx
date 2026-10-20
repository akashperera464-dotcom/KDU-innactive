"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Leaf,
  Calendar,
  Clock,
  Compass,
  History,
  Check,
  Plus,
  X,
  LogOut,
  Users,
  Receipt,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Factory,
  Contact,
  ClipboardList,
  CheckCircle2,
  Pencil,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  Entry,
  Supplier,
  RouteItem,
  StatusReasonItem,
  CustomQuestionItem,
  User as UserType,
} from "@/types";
import { AddRouteModal } from "./AddRouteModal";
import { AddReasonModal } from "./AddReasonModal";

interface CollectorPortalProps {
  user: UserType;
  theme: "dark" | "light";
  routes: RouteItem[];
  reasons: StatusReasonItem[];
  suppliers: Supplier[];
  customQuestions: CustomQuestionItem[];
  onAddRoute: (route: Partial<RouteItem>) => void;
  onAddReason: (reason: Partial<StatusReasonItem>) => void;
  onAddQuestion: (q: Partial<CustomQuestionItem>) => void;
  onSaveEntry: (entry: Entry) => Promise<boolean>;
  onLogout: () => void;
  recentEntries: Entry[];
}

const Label: React.FC<{ children: React.ReactNode; dark: boolean }> = ({ children, dark }) => (
  <label className={`block text-[13px] font-extrabold mb-1.5 ${dark ? "text-emerald-300" : "text-emerald-900"}`}>
    {children}
  </label>
);

/* Approximate KDU tea-belt coordinates used when the device has no GPS signal */
const FALLBACK_GPS = "6.682800, 80.403200";

interface GpsResult {
  coords: string;
  accuracy: number | null; // metres, null when fallback
  ok: boolean; // true = real GPS lock
}

/** One-shot geolocation lookup; never throws, resolves with fallback on failure. */
const acquireGps = (): Promise<GpsResult> =>
  new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ coords: FALLBACK_GPS, accuracy: null, ok: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          coords: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,
          accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null,
          ok: true,
        }),
      () => resolve({ coords: FALLBACK_GPS, accuracy: null, ok: false }),
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 0 }
    );
  });

export const CollectorPortal: React.FC<CollectorPortalProps> = ({
  user,
  theme,
  routes,
  reasons,
  suppliers,
  customQuestions,
  onAddRoute,
  onAddReason,
  onAddQuestion,
  onSaveEntry,
  onLogout,
  recentEntries,
}) => {
  const isDark = theme === "dark";

  const [formType, setFormType] = useState<"inactive" | "extension">("inactive");
  const [showLogs, setShowLogs] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddReasonModal, setShowAddReasonModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);

  // Quiz / slides state (Inactive Suppliers form)
  const [slideIdx, setSlideIdx] = useState(0);
  const [passed, setPassed] = useState<number[]>([]);

  // Meta
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [timeStr, setTimeStr] = useState(new Date().toTimeString().split(" ")[0]);
  const [gpsLocation, setGpsLocation] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<"precise" | "fallback" | null>(null);

  // Option-B submission flow: acquiring → locked (auto submit) / failed (retry or fallback)
  const [gpsStage, setGpsStage] = useState<"idle" | "acquiring" | "locked" | "failed">("idle");
  const [pendingGps, setPendingGps] = useState<GpsResult | null>(null);

  // Form 1 — preselect the factory / route the Admin assigned to this officer
  const [factory, setFactory] = useState(
    user.assignedFactory ? user.assignedFactory : "සියල්ල (All Factories)"
  );
  const [route, setRoute] = useState(
    user.assignedRoute && user.assignedRoute !== "ALL" ? user.assignedRoute : ""
  );
  const [supplierNo, setSupplierNo] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [nic, setNic] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [willGive, setWillGive] = useState("ඔව් (Yes)");
  const [promiseReason, setPromiseReason] = useState("provides_leaves");
  const [couldNotMeet, setCouldNotMeet] = useState(false);
  const [actionsTaken, setActionsTaken] = useState("");
  const [autoReason, setAutoReason] = useState("");
  const [autoWeight, setAutoWeight] = useState("");

  // Workers
  const [permWorkerName, setPermWorkerName] = useState("");
  const [permWorkerGender, setPermWorkerGender] = useState("පුරුෂ (Male)");
  const [permWorkerBirthYear, setPermWorkerBirthYear] = useState("");
  const [permWorkerWages, setPermWorkerWages] = useState("");
  const [tempWorkersCount, setTempWorkersCount] = useState("");
  const [salesVolumeKg, setSalesVolumeKg] = useState("");
  const [salesVolumeDate, setSalesVolumeDate] = useState("");

  // Form 2
  const [supplierType, setSupplierType] = useState("පැරණි සැපයුම්කරු (Old Supplier)");
  const [address, setAddress] = useState("");
  const [expectedLeafQty, setExpectedLeafQty] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [routeProblems, setRouteProblems] = useState("");
  const [comments, setComments] = useState("");

  // RA checklist
  const [raNoDeforestation, setRaNoDeforestation] = useState("නැත (No)");
  const [raRiparianBuffer, setRaRiparianBuffer] = useState("ඔව් (Yes)");
  const [raNoWasteBurning, setRaNoWasteBurning] = useState("නැත (No)");
  const [raRainwaterHarvesting, setRaRainwaterHarvesting] = useState("ඔව් (Yes)");
  const [raSoilErosion, setRaSoilErosion] = useState("ඔව් (Yes)");
  const [raWildlifeProtection, setRaWildlifeProtection] = useState("ඔව් (Yes)");

  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({});

  // Quick field modal
  const [qTitle, setQTitle] = useState("");
  const [qType, setQType] = useState<"text" | "number" | "dropdown" | "boolean">("text");
  const [qOptions, setQOptions] = useState("");

  const [matchingSuppliers, setMatchingSuppliers] = useState<Supplier[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    captureGps();
    const timer = setInterval(() => setTimeStr(new Date().toTimeString().split(" ")[0]), 1000);
    return () => clearInterval(timer);
  }, []);

  const captureGps = async () => {
    setGpsLoading(true);
    const res = await acquireGps();
    setGpsLocation(res.coords);
    setGpsAccuracy(res.ok ? "precise" : "fallback");
    setGpsLoading(false);
  };

  // A route may belong to several factories — dedupe by name for dropdowns
  const dedupeByName = (list: RouteItem[]) => {
    const seen = new Set<string>();
    return list.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)));
  };

  const filteredRoutes = dedupeByName(
    routes.filter((r) => {
      if (factory === "සියල්ල (All Factories)" || !r.factory) return true;
      return r.factory === factory;
    })
  );

  const allRoutesUnique = dedupeByName(routes);

  // Admin-imported INACTIVE suppliers relevant to the selected Factory + Route
  const inactiveForSelection = suppliers.filter((s) => {
    if ((s.status || "active") !== "inactive") return false;
    const routeOk = !route || s.route === route;
    const factoryOk =
      factory === "සියල්ල (All Factories)"
        ? true
        : s.factory === factory || (!s.factory && filteredRoutes.some((r) => r.name === s.route));
    return routeOk && factoryOk;
  });

  const handleSupplierNoChange = (val: string) => {
    setSupplierNo(val);
    if (!val.trim()) {
      setMatchingSuppliers([]);
      setShowSuggestions(false);
      setAutoReason("");
      setAutoWeight("");
      return;
    }
    // Prefer the admin inactive list scoped to the selected factory & route
    const scope = inactiveForSelection.length > 0 ? inactiveForSelection : suppliers;
    const matches = scope.filter(
      (s) =>
        s.supplierNo.toLowerCase().includes(val.trim().toLowerCase()) ||
        s.name.toLowerCase().includes(val.trim().toLowerCase())
    );
    setMatchingSuppliers(matches);
    setShowSuggestions(matches.length > 0);
    const exact = suppliers.find((s) => s.supplierNo.toLowerCase() === val.trim().toLowerCase());
    if (exact) applySupplier(exact);
  };

  const applySupplier = (s: Supplier) => {
    setSupplierNo(s.supplierNo);
    setSupplierName(s.name);
    if (s.phone) setPhoneNumber(s.phone);
    if (s.nic) setNic(s.nic);
    if (s.route) setRoute(s.route);
    setAutoReason(s.previousReason || "—");
    setAutoWeight(s.lastWeightKg ? `${s.lastWeightKg} Kg` : "—");
    if (s.previousReason) setPromiseReason(s.previousReason);
    setShowSuggestions(false);
  };

  const activeQuestions = customQuestions.filter(
    (q) => q.targetForm === "both" || q.targetForm === formType
  );

  /* ---------- Quiz slides definition (Inactive Suppliers) ---------- */
  const slides = [
    {
      icon: Factory,
      titleSi: "කර්මාන්ත ශාලාව සහ මාර්ගය",
      titleEn: "Factory & Tea Route",
      desc: "මෙම පිවිසුම අයත් වන්නේ කුමන කර්මාන්ත ශාලාවට සහ තේ මාර්ගයටදැයි තෝරන්න.",
    },
    {
      icon: Contact,
      titleSi: "සැපයුම්කරු තොරතුරු",
      titleEn: "Supplier Details",
      desc: "සැපයුම්කරුගේ අංකය, නම, හැඳුනුම්පත සහ දුරකථන අංකය මෙම කොටසට අයත් වේ.",
    },
    {
      icon: ClipboardList,
      titleSi: "දළු ලබාදීමේ තත්ත්වය",
      titleEn: "Leaf Supply Status",
      desc: "දළු ලබාදෙන්නේද යන්න සහ ඊට හේතුව / වර්තමාන තත්ත්වය මෙහි සටහන් කරන්න.",
    },
    {
      icon: Users,
      titleSi: "සේවක සහ හැඳුනුම් තොරතුරු",
      titleEn: "Workers & Traceability Details",
      desc: "ස්ථිර සේවකයාගේ නම, ස්ත්‍රී/පුරුෂ ාවය, උපන් අවුරුද්ද, වැටුප සහ තාවකාලික සේවකයින් මෙම මාතෘකාවට අයත් වේ.",
    },
    {
      icon: Receipt,
      titleSi: "අලෙවි කිරීම්",
      titleEn: "Sales Receipt",
      desc: "ලබා දුන් දළු ප්‍රමාණය (Kg) සහ අලෙවි කළ දිනය මෙම කොටසෙන් ඇතුලත් කරන්න.",
    },
    {
      icon: Sparkles,
      titleSi: "අභිමත මිනුම් සහ ප්‍රශ්න",
      titleEn: "Dynamic Fields",
      desc: "පරිපාලකයා විසින් එක් කරන ලද අමතර ප්‍රශ්න මෙම පියවරේ දිස්වේ.",
    },
  ];

  const totalSlides = slides.length;
  const passedCount = passed.length;
  const remainingCount = totalSlides - passedCount;

  const goNext = () => {
    setPassed((p) => (p.includes(slideIdx) ? p : [...p, slideIdx]));
    setSlideIdx((i) => Math.min(i + 1, totalSlides - 1));
  };
  const goBack = () => setSlideIdx((i) => Math.max(i - 1, 0));
  const jumpTo = (i: number) => setSlideIdx(i);

  const resetForm = () => {
    setSupplierNo("");
    setSupplierName("");
    setNic("");
    setPhoneNumber("");
    setActionsTaken("");
    setAutoReason("");
    setAutoWeight("");
    setCouldNotMeet(false);
    setPermWorkerName("");
    setPermWorkerBirthYear("");
    setPermWorkerWages("");
    setTempWorkersCount("");
    setSalesVolumeKg("");
    setSalesVolumeDate("");
    setAddress("");
    setExpectedLeafQty("");
    setSuggestions("");
    setRouteProblems("");
    setComments("");
    setDynamicAnswers({});
    setSlideIdx(0);
    setPassed([]);
    setGpsStage("idle");
    setPendingGps(null);
    captureGps();
  };

  /* Final submit — uses the freshly acquired GPS result */
  const finalizeSubmit = async (gps: GpsResult) => {
    setGpsStage("idle");
    setPendingGps(null);
    setIsSubmitting(true);

    const newEntry: Entry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      collectorId: user.name || user.employeeId,
      date: dateStr,
      time: timeStr,
      gpsLocation: gps.coords,
      gpsAccuracy: gps.ok ? "precise" : "fallback",
      type: formType,
      factory: factory === "සියල්ල (All Factories)" ? "Galpadihenna Tea Factory" : factory,
      route,
      supplierNo: supplierNo.trim() || undefined,
      supplierName: supplierName.trim(),
      nic: nic.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      willGive: formType === "inactive" ? willGive : "ඔව් (Yes)",
      promiseReason: formType === "inactive" ? promiseReason : "provides_leaves",
      couldNotMeet: formType === "inactive" ? couldNotMeet : false,
      actionsTaken: actionsTaken.trim() || undefined,
      permWorkerName: permWorkerName.trim() || undefined,
      permWorkerGender: permWorkerName.trim() ? permWorkerGender : undefined,
      permWorkerBirthYear: permWorkerBirthYear.trim() || undefined,
      permWorkerWages: permWorkerWages.trim() || undefined,
      tempWorkersCount: tempWorkersCount.trim() || undefined,
      salesVolumeKg: salesVolumeKg.trim() || undefined,
      salesVolumeDate: salesVolumeDate || undefined,
      supplierType: formType === "extension" ? supplierType : undefined,
      address: formType === "extension" ? address.trim() || undefined : undefined,
      expectedLeafQty: formType === "extension" ? expectedLeafQty.trim() || undefined : undefined,
      suggestions: formType === "extension" ? suggestions.trim() || undefined : undefined,
      routeProblems: formType === "extension" ? routeProblems.trim() || undefined : undefined,
      comments: formType === "extension" ? comments.trim() || undefined : undefined,
      raNoDeforestation: formType === "extension" ? raNoDeforestation : undefined,
      raRiparianBuffer: formType === "extension" ? raRiparianBuffer : undefined,
      raNoWasteBurning: formType === "extension" ? raNoWasteBurning : undefined,
      raRainwaterHarvesting: formType === "extension" ? raRainwaterHarvesting : undefined,
      raSoilErosion: formType === "extension" ? raSoilErosion : undefined,
      raWildlifeProtection: formType === "extension" ? raWildlifeProtection : undefined,
      customFieldsJson: Object.keys(dynamicAnswers).length ? JSON.stringify(dynamicAnswers) : undefined,
    };

    const ok = await onSaveEntry(newEntry);
    setIsSubmitting(false);
    if (ok) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10B981", "#34D399", "#059669", "#F59E0B", "#FBBF24"],
        });
      } catch {}
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3500);
      resetForm();
    }
  };

  /* Option-B: refresh GPS at the exact moment of submission */
  const tryAcquire = async () => {
    setGpsStage("acquiring");
    const res = await acquireGps();
    setPendingGps(res);
    if (res.ok) {
      setGpsLocation(res.coords);
      setGpsAccuracy("precise");
      setGpsStage("locked");
      // brief confirmation so the officer sees the exact location, then auto-submit
      window.setTimeout(() => {
        finalizeSubmit(res);
      }, 1600);
    } else {
      setGpsLocation(res.coords);
      setGpsAccuracy("fallback");
      setGpsStage("failed");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert("කරුණාකර සැපයුම්කරුගේ නම ඇතුලත් කරන්න (Please enter Supplier Name — පියවර 2)");
      if (formType === "inactive") setSlideIdx(1);
      return;
    }
    tryAcquire();
  };

  const handleAddQuickField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim()) return;
    onAddQuestion({
      title: qTitle.trim(),
      targetForm: formType,
      inputType: qType,
      options: qOptions.trim() || undefined,
    });
    setQTitle("");
    setQOptions("");
    setShowAddFieldModal(false);
  };

  /* ---------- shared input classes ---------- */
  const inputCls = `w-full px-3.5 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
    isDark
      ? "bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
      : "bg-white border border-emerald-100 text-slate-800 placeholder-slate-400 shadow-sm"
  }`;
  const readonlyCls = `w-full px-3.5 py-3 rounded-xl text-sm italic ${
    isDark
      ? "bg-slate-800/50 border border-slate-700/60 text-emerald-300"
      : "bg-emerald-50/70 border border-emerald-100 text-emerald-700"
  }`;
  const cardCls = `rounded-2xl p-4 sm:p-5 border space-y-4 ${
    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-emerald-100/80 shadow-sm"
  }`;

  /* ---------- RA question card ---------- */
  const RaCard: React.FC<{
    index: number;
    titleSi: string;
    titleEn: string;
    req: string;
    question: string;
    policy: string;
    value: string;
    onChange: (v: string) => void;
    yesIsGood: boolean;
  }> = ({ index, titleSi, titleEn, req, question, policy, value, onChange, yesIsGood }) => (
    <div className={cardCls}>
      <p className={`text-[13px] font-extrabold leading-snug ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
        {index}. {titleSi} ({titleEn}) - <span className="font-mono text-[11px]">[Requirement {req}]</span>
      </p>
      <p className={`text-[13px] leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>{question}</p>
      <p className={`text-[11px] italic leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{policy}</p>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onChange("ඔව් (Yes)")}
          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all active:scale-95 ${
            value === "ඔව් (Yes)"
              ? yesIsGood
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30"
                : "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30"
              : isDark
                ? "bg-slate-800 border-slate-700 text-slate-300"
                : "bg-white border-emerald-100 text-slate-600"
          }`}
        >
          ඔව් (Yes)
        </button>
        <button
          type="button"
          onClick={() => onChange("නැත (No)")}
          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all active:scale-95 ${
            value === "නැත (No)"
              ? yesIsGood
                ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30"
                : "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30"
              : isDark
                ? "bg-slate-800 border-slate-700 text-slate-300"
                : "bg-white border-emerald-100 text-slate-600"
          }`}
        >
          නැත (No)
        </button>
      </div>
    </div>
  );

  const renderDynamic = (q: CustomQuestionItem) => (
    <div key={q.id}>
      <Label dark={isDark}>{q.title}</Label>
      {q.inputType === "dropdown" ? (
        <select
          value={dynamicAnswers[q.id] || ""}
          onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [q.id]: e.target.value })}
          className={inputCls}
        >
          <option value="">තෝරන්න (Select)</option>
          {q.options?.split(",").map((opt) => (
            <option key={opt.trim()} value={opt.trim()}>
              {opt.trim()}
            </option>
          ))}
        </select>
      ) : q.inputType === "boolean" ? (
        <div className="grid grid-cols-2 gap-2">
          {["ඔව් (Yes)", "නැත (No)"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setDynamicAnswers({ ...dynamicAnswers, [q.id]: v })}
              className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                dynamicAnswers[q.id] === v
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : isDark
                    ? "bg-slate-800 border-slate-700 text-slate-300"
                    : "bg-white border-emerald-100 text-slate-600"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      ) : (
        <input
          type={q.inputType === "number" ? "number" : "text"}
          value={dynamicAnswers[q.id] || ""}
          onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [q.id]: e.target.value })}
          placeholder="පිළිතුර ඇතුලත් කරන්න"
          className={inputCls}
        />
      )}
    </div>
  );

  const CurrentSlideIcon = slides[slideIdx].icon;

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-[#111827]" : "bg-[#EAF6EE]"}`}>
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-2xl shadow-emerald-600/50 text-sm animate-bounce">
          <Check className="w-5 h-5" />
          <span>දත්ත සාර්ථකව සුරැකිණි! (Saved)</span>
        </div>
      )}

      {/* ---------- GPS acquisition overlay (Option B) ---------- */}
      {gpsStage !== "idle" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-3xl border p-6 text-center space-y-4 shadow-2xl animate-fadeIn ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Stage: acquiring */}
            {gpsStage === "acquiring" && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Compass className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-extrabold">ස්ථානය ලබා ගනිමින්...</p>
                  <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Acquiring GPS location...
                  </p>
                </div>
              </>
            )}

            {/* Stage: locked → auto submit */}
            {gpsStage === "locked" && pendingGps && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/20 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-emerald-400">GPS සංඥා හොඳයි (GPS Locked)</p>
                  <p className="font-mono text-xs mt-1.5">{pendingGps.coords}</p>
                  <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    ±{pendingGps.accuracy ?? "—"} meters accuracy
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-2.5 font-extrabold animate-pulse">
                    ස්වයංක්‍රීයව ඉදිරිපත් වෙමින්... (Submitting...)
                  </p>
                </div>
              </>
            )}

            {/* Stage: failed → retry or continue with fallback */}
            {gpsStage === "failed" && pendingGps && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 ring-4 ring-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-amber-400">GPS සංඥා නොමැත (No GPS signal)</p>
                  <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    අනුමාන ස්ථානයක් භාවිතා වේ (An approximate location will be used):
                  </p>
                  <p className="font-mono text-xs mt-1.5">{pendingGps.coords}</p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={tryAcquire}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 active:scale-[0.97] transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>නැවත උත්සාහ කරන්න (Retry GPS)</span>
                  </button>
                  <button
                    onClick={() => finalizeSubmit(pendingGps)}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/30 active:scale-[0.97] transition-all"
                  >
                    අනුමාන ස්ථානය සමඟ ඉදිරියට යන්න (Continue with fallback)
                  </button>
                  <button
                    onClick={() => {
                      setGpsStage("idle");
                      setPendingGps(null);
                    }}
                    className={`text-[11px] font-bold hover:underline ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    අවලංගු කරන්න (Cancel)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-3 sm:px-5 pt-4 space-y-4">
        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-emerald-100 text-emerald-800 shadow-sm"}`}>
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            {dateStr}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-emerald-100 text-emerald-800 shadow-sm"}`}>
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            {timeStr}
          </span>
          <button
            type="button"
            onClick={captureGps}
            title={gpsAccuracy === "precise" ? "නිවැරදි GPS ස්ථානය (Precise GPS lock)" : gpsAccuracy === "fallback" ? "අනුමාන ස්ථානයක් — GPS සංඥා නොමැත (Approximate — no signal)" : "GPS සොයමින්..."}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border active:scale-95 transition-all ${
              gpsAccuracy === "fallback"
                ? isDark
                  ? "bg-amber-950/40 border-amber-700/50 text-amber-300"
                  : "bg-amber-50 border-amber-200 text-amber-700"
                : isDark
                  ? "bg-slate-900 border-slate-800 text-emerald-300"
                  : "bg-white border-emerald-100 text-emerald-700 shadow-sm"
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""} ${gpsAccuracy === "fallback" ? "text-amber-400" : "text-emerald-500"}`} />
            <span className="font-mono">{gpsLocation || "GPS..."}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                gpsAccuracy === "precise" ? "bg-emerald-400" : gpsAccuracy === "fallback" ? "bg-amber-400 animate-pulse" : "bg-slate-400"
              }`}
            />
          </button>
          <button type="button" onClick={() => setShowLogs(!showLogs)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border active:scale-95 transition-all ${showLogs ? "bg-emerald-600 border-emerald-600 text-white" : isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-emerald-100 text-emerald-800 shadow-sm"}`}>
            <History className="w-3.5 h-3.5" />
            <span>සටහන් ({recentEntries.length})</span>
          </button>
        </div>

        {/* Tab pill bar */}
        <div className={`p-1.5 rounded-full border flex ${isDark ? "bg-slate-900 border-slate-800" : "bg-white/80 border-emerald-100 shadow-sm backdrop-blur"}`}>
          <button
            type="button"
            onClick={() => {
              setFormType("inactive");
              setShowLogs(false);
              setSlideIdx(0);
              setPassed([]);
            }}
            style={{ width: "40%" }}
            className={`py-2.5 rounded-full text-[11px] sm:text-xs font-extrabold truncate transition-all ${
              formType === "inactive" && !showLogs
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                : isDark
                  ? "text-slate-400"
                  : "text-emerald-900/60"
            }`}
          >
            Inactive Suppliers
          </button>
          <button
            type="button"
            onClick={() => {
              setFormType("extension");
              setShowLogs(false);
            }}
            style={{ width: "60%" }}
            className={`py-2.5 rounded-full text-[11px] sm:text-xs font-extrabold truncate transition-all ${
              formType === "extension" && !showLogs
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                : isDark
                  ? "text-slate-400"
                  : "text-emerald-900/60"
            }`}
          >
            Extension Visit / RA Program
          </button>
        </div>

        {/* Logs drawer */}
        {showLogs && (
          <div className={cardCls}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-extrabold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>මෑත සටහන් (Recent Field Logs)</h3>
              <button onClick={() => setShowLogs(false)} className="text-xs font-bold text-emerald-500 hover:underline">← ආපසු (Back)</button>
            </div>
            {recentEntries.length === 0 ? (
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>තවම සටහන් නොමැත.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {recentEntries.map((en) => (
                  <div key={en.id} className={`p-3 rounded-xl border text-xs ${isDark ? "bg-slate-800/70 border-slate-700" : "bg-emerald-50/60 border-emerald-100"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-extrabold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>
                        {en.supplierName} {en.supplierNo ? `(#${en.supplierNo})` : ""}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${en.type === "inactive" ? "bg-amber-500/20 text-amber-600 border border-amber-500/30" : "bg-blue-500/20 text-blue-600 border border-blue-500/30"}`}>
                        {en.type === "inactive" ? "Inactive" : "RA Visit"}
                      </span>
                    </div>
                    <p className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {en.route} • {en.date} {en.time}
                      {en.salesVolumeKg ? ` • ${en.salesVolumeKg} Kg` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!showLogs && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 pb-44">
              {/* ================= INACTIVE SUPPLIERS — QUIZ / SLIDES ================= */}
              {formType === "inactive" && (
                <div key={slideIdx} className={`${cardCls} animate-fadeIn`}>
                  {/* Slide topic header */}
                  <div className={`flex items-center gap-3 pb-3 mb-4 border-b ${isDark ? "border-slate-800" : "border-emerald-100"}`}>
                    <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-600/10 text-emerald-700"}`}>
                      <CurrentSlideIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold tracking-wider text-emerald-500">
                        පියවර {slideIdx + 1} / {totalSlides} • STEP {slideIdx + 1} OF {totalSlides}
                      </p>
                      <h3 className={`text-sm font-extrabold leading-tight ${isDark ? "text-white" : "text-emerald-900"}`}>
                        {slides[slideIdx].titleSi} ({slides[slideIdx].titleEn})
                      </h3>
                      <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {slides[slideIdx].desc}
                      </p>
                    </div>
                  </div>

                  {/* ---------- SLIDE 1: Factory & Route ---------- */}
                  {slideIdx === 0 && (
                    <>
                      <div>
                        <Label dark={isDark}>දළු කර්මාන්ත ශාලාව තෝරන්න (Select Factory)</Label>
                        <select value={factory} onChange={(e) => setFactory(e.target.value)} className={inputCls}>
                          <option value="සියල්ල (All Factories)">සියල්ල (All Factories)</option>
                          <option value="Galpadihenna Tea Factory">Galpadihenna Tea Factory</option>
                          <option value="Kalawana Leaf Center">Kalawana Leaf Center</option>
                          <option value="Kuttapitiya Tea Factory">Kuttapitiya Tea Factory</option>
                          <option value="Madampe Tea Factory">Madampe Tea Factory</option>
                          <option value="Matuwagala Tea Factory">Matuwagala Tea Factory</option>
                          <option value="Peak view Tea Factory">Peak view Tea Factory</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[13px] font-extrabold ${isDark ? "text-emerald-300" : "text-emerald-900"}`}>මාර්ගය (Route) *</span>
                          <button type="button" onClick={() => setShowAddRouteModal(true)} className="text-[11px] font-extrabold text-emerald-500 hover:underline">
                            Add New +
                          </button>
                        </div>
                        <select value={route} onChange={(e) => setRoute(e.target.value)} className={inputCls}>
                          <option value="">තෝරන්න (Select)</option>
                          {filteredRoutes.map((r) => (
                            <option key={r.id || r.name} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* ---------- SLIDE 2: Supplier Details ---------- */}
                  {slideIdx === 1 && (
                    <>
                      {/* Inactive suppliers loaded from Admin directory for selected Factory + Route */}
                      <div
                        className={`p-3 rounded-xl border space-y-2 ${
                          isDark ? "bg-amber-950/30 border-amber-800/50" : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <Label dark={isDark}>
                          පරිපාලක අක්‍රිය ලැයිස්තුවෙන් තෝරන්න (Inactive Supplier — Admin list for {factory === "සියල්ල (All Factories)" ? "all factories" : factory} / {route || "route"})
                        </Label>
                        <select
                          value=""
                          onChange={(e) => {
                            const s = suppliers.find((x) => x.id === e.target.value);
                            if (s) applySupplier(s);
                          }}
                          className={inputCls}
                        >
                          <option value="">
                            {inactiveForSelection.length > 0
                              ? `තෝරන්න (Select) — අක්‍රිය සැපයුම්කරුවන් ${inactiveForSelection.length} ක් මෙම මාර්ගයේ ඇත`
                              : "මෙම මාර්ගය සඳහා අක්‍රිය ලැයිස්තුව හිස්ය (පරිපාලකයා එක් කරන තෙක්)"}
                          </option>
                          {inactiveForSelection.map((s) => (
                            <option key={s.id} value={s.id}>
                              #{s.supplierNo} — {s.name}
                              {s.prunedDate ? ` (කප්පාදු: ${s.prunedDate})` : ""}
                            </option>
                          ))}
                        </select>
                        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          තෝරාගත් විට අංකය, නම, දුරකථනය, හැඳුනුම්පත, පෙර හේතුව සහ අවසන් බර ස්වයංක්‍රීයව පිරවේ.
                        </p>
                      </div>

                      <div className="relative">
                        <Label dark={isDark}>සැපයුම්කරු අංකය (Supplier No) *</Label>
                        <input
                          type="text"
                          value={supplierNo}
                          onChange={(e) => handleSupplierNoChange(e.target.value)}
                          placeholder="E.g: 5100"
                          className={`${inputCls} font-mono font-bold`}
                        />
                        {showSuggestions && matchingSuppliers.length > 0 && (
                          <div className={`absolute left-0 right-0 z-30 mt-1 max-h-44 overflow-y-auto rounded-xl border shadow-xl ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-emerald-100"}`}>
                            {matchingSuppliers.map((s) => (
                              <button
                                type="button"
                                key={s.id || s.supplierNo}
                                onClick={() => applySupplier(s)}
                                className={`w-full text-left px-3.5 py-2.5 text-xs border-b last:border-none ${isDark ? "border-slate-700 text-slate-200 hover:bg-slate-700" : "border-emerald-50 text-slate-700 hover:bg-emerald-50"}`}
                              >
                                <span className="font-extrabold text-emerald-500">#{s.supplierNo}</span> — {s.name}
                                <span className={`block text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                  {s.route} • {s.lastWeightKg || 0} Kg
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label dark={isDark}>පෙර හේතුව (Admin Reason) - Read-only</Label>
                        <input type="text" value={autoReason} readOnly placeholder="Auto-filled" className={readonlyCls} />
                      </div>
                      <div>
                        <Label dark={isDark}>අවසන් බර (Last Weight - Kg) - Read-only</Label>
                        <input type="text" value={autoWeight} readOnly placeholder="Auto-filled" className={readonlyCls} />
                      </div>
                      <div>
                        <Label dark={isDark}>සැපයුම්කරුගේ නම (Supplier Name) *</Label>
                        <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="සම්පූර්ණ නම ඇතුලත් කරන්න" required className={inputCls} />
                      </div>
                      <div>
                        <Label dark={isDark}>ජා. හැඳුනුම (NIC)</Label>
                        <input type="text" value={nic} onChange={(e) => setNic(e.target.value)} placeholder="E.g: 880430840V" className={inputCls} />
                      </div>
                      <div>
                        <Label dark={isDark}>දුරකථන අංකය (Phone Number)</Label>
                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="E.g: 0771234567" className={inputCls} />
                      </div>
                    </>
                  )}

                  {/* ---------- SLIDE 3: Leaf Supply Status ---------- */}
                  {slideIdx === 2 && (
                    <>
                      <div>
                        <Label dark={isDark}>දළු ලබාදෙන්නේද? (Will give?) *</Label>
                        <select value={willGive} onChange={(e) => setWillGive(e.target.value)} className={inputCls}>
                          <option value="ඔව් (Yes)">ඔව් (Yes)</option>
                          <option value="නැත (No)">නැත (No)</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[13px] font-extrabold ${isDark ? "text-emerald-300" : "text-emerald-900"}`}>තත්ත්වය (Status) *</span>
                          <button type="button" onClick={() => setShowAddReasonModal(true)} className="text-[11px] font-extrabold text-emerald-500 hover:underline">
                            Add New +
                          </button>
                        </div>
                        <select value={promiseReason} onChange={(e) => setPromiseReason(e.target.value)} className={inputCls}>
                          {reasons.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.labelSi} ({r.labelEn})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${couldNotMeet ? "bg-amber-50 border-amber-300" : isDark ? "bg-slate-800/60 border-slate-700" : "bg-emerald-50/50 border-emerald-100"}`}>
                        <input id="cnm" type="checkbox" checked={couldNotMeet} onChange={(e) => setCouldNotMeet(e.target.checked)} className="w-5 h-5 accent-amber-500 rounded" />
                        <label htmlFor="cnm" className={`text-xs font-bold cursor-pointer ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                          සැපයුම්කරු හමුවීමට නොහැකි විය (Could not meet)
                        </label>
                      </div>
                      <div>
                        <Label dark={isDark}>ගත් ක්‍රියාමාර්ග (Actions Taken)</Label>
                        <textarea rows={3} value={actionsTaken} onChange={(e) => setActionsTaken(e.target.value)} placeholder="විස්තරය... (Description...)" className={inputCls} />
                      </div>
                    </>
                  )}

                  {/* ---------- SLIDE 4: Workers & Traceability ---------- */}
                  {slideIdx === 3 && (
                    <>
                      <div>
                        <Label dark={isDark}>ස්ථිර සේවකයාගේ නම (Permanent Worker Name)</Label>
                        <input type="text" value={permWorkerName} onChange={(e) => setPermWorkerName(e.target.value)} placeholder="E.g: Sunil Perera" className={inputCls} />
                      </div>
                      <div>
                        <Label dark={isDark}>ස්ත්‍රී/පුරුෂ භාවය (Gender)</Label>
                        <select value={permWorkerGender} onChange={(e) => setPermWorkerGender(e.target.value)} className={inputCls}>
                          <option value="පුරුෂ (Male)">පුරුෂ (Male)</option>
                          <option value="ස්ත්‍රී (Female)">ස්ත්‍රී (Female)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label dark={isDark}>උපන් අවුරුද්ද (Birth Year)</Label>
                          <input type="number" value={permWorkerBirthYear} onChange={(e) => setPermWorkerBirthYear(e.target.value)} placeholder="E.g: 1985" className={inputCls} />
                        </div>
                        <div>
                          <Label dark={isDark}>දෛනික වැටුප (Wages - Rs.)</Label>
                          <input type="number" value={permWorkerWages} onChange={(e) => setPermWorkerWages(e.target.value)} placeholder="E.g: 1500" className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <Label dark={isDark}>තාවකාලික සේවකයින් සංඛ්‍යාව (Temporary Workers) - [Req 1.2.5]</Label>
                        <input type="number" value={tempWorkersCount} onChange={(e) => setTempWorkersCount(e.target.value)} placeholder="E.g: 5" className={inputCls} />
                      </div>
                    </>
                  )}

                  {/* ---------- SLIDE 5: Sales Receipt ---------- */}
                  {slideIdx === 4 && (
                    <>
                      <div>
                        <Label dark={isDark}>ලබා දුන් දළු ප්‍රමාණය (Sales Volume - Kg)</Label>
                        <input type="number" step="0.1" value={salesVolumeKg} onChange={(e) => setSalesVolumeKg(e.target.value)} placeholder="E.g: 150" className={inputCls} />
                      </div>
                      <div>
                        <Label dark={isDark}>අලෙවි කළ දිනය (Sales Volume Date)</Label>
                        <input type="date" value={salesVolumeDate} onChange={(e) => setSalesVolumeDate(e.target.value)} className={inputCls} />
                      </div>
                    </>
                  )}

                  {/* ---------- SLIDE 6: Dynamic Fields ---------- */}
                  {slideIdx === 5 && (
                    <>
                      {activeQuestions.length > 0 ? (
                        activeQuestions.map(renderDynamic)
                      ) : (
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          මෙම පියවර සඳහා දැනට අභිමත ප්‍රශ්න නොමැත. (No dynamic questions configured for this form yet.)
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowAddFieldModal(true)}
                        className={`w-full py-2.5 rounded-xl text-xs font-extrabold border-2 border-dashed transition-all active:scale-95 ${isDark ? "border-indigo-700 text-indigo-300 hover:bg-indigo-900/40" : "border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-100"}`}
                      >
                        + නව මිනුමක්/ප්‍රශ්නයක් එක් කරන්න (Add New Field)
                      </button>
                    </>
                  )}

                  {/* Slide navigation */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={slideIdx === 0}
                      className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-extrabold border transition-all active:scale-95 disabled:opacity-40 ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-emerald-100 text-slate-600"}`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>ආපසු (Back)</span>
                    </button>

                    {slideIdx < totalSlides - 1 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all"
                      >
                        <span>ඊළඟ පියවර (Next)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || gpsStage !== "idle"}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>
                          {isSubmitting
                            ? "සුරකිමින්..."
                            : "ස්ථානය තහවුරු කර ඉදිරිපත් කරන්න (Refresh GPS & Submit)"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ================= EXTENSION / RA (unchanged scrolling form) ================= */}
              {formType === "extension" && (
              <>
                <div className={cardCls}>
                  <div>
                    <Label dark={isDark}>සැපයුම්කරු වර්ගය (Supplier Type) *</Label>
                    <select value={supplierType} onChange={(e) => setSupplierType(e.target.value)} className={inputCls}>
                      <option value="නව සැපයුම්කරු (New Supplier)">නව සැපයුම්කරු (New Supplier)</option>
                      <option value="පැරණි සැපයුම්කරු (Old Supplier)">පැරණි සැපයුම්කරු (Old Supplier)</option>
                    </select>
                  </div>
                  <div>
                    <Label dark={isDark}>මාර්ගය (Route)</Label>
                    <select value={route} onChange={(e) => setRoute(e.target.value)} className={inputCls}>
                      <option value="">තෝරන්න (Select)</option>
                      {allRoutesUnique.map((r) => (
                        <option key={r.id || r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label dark={isDark}>සැපයුම්කරු අංකය (Supplier No - optional for new)</Label>
                    <input type="text" value={supplierNo} onChange={(e) => handleSupplierNoChange(e.target.value)} placeholder="E.g: 5100 / NEW-084" className={`${inputCls} font-mono`} />
                  </div>
                  <div>
                    <Label dark={isDark}>නම (Name) *</Label>
                    <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="සම්පූර්ණ නම" required className={inputCls} />
                  </div>
                  <div>
                    <Label dark={isDark}>ලිපිනය (Address)</Label>
                    <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="වත්තේ ලිපිනය" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label dark={isDark}>බලාපොරොත්තු දළු (Kg)</Label>
                      <input type="number" value={expectedLeafQty} onChange={(e) => setExpectedLeafQty(e.target.value)} placeholder="E.g: 500" className={inputCls} />
                    </div>
                    <div>
                      <Label dark={isDark}>දුරකථනය (Phone)</Label>
                      <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="07xxxxxxxx" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <Label dark={isDark}>යෝජනා අදහස් (Suggestions / Feedback)</Label>
                    <textarea rows={2} value={suggestions} onChange={(e) => setSuggestions(e.target.value)} placeholder="සැපයුම්කරුගේ යෝජනා..." className={inputCls} />
                  </div>
                  <div>
                    <Label dark={isDark}>දළු මාර්ගයේ ගැටළු (Route & Transport Issues)</Label>
                    <textarea rows={2} value={routeProblems} onChange={(e) => setRouteProblems(e.target.value)} placeholder="ප්‍රවාහන ගැටළු..." className={inputCls} />
                  </div>
                  <div>
                    <Label dark={isDark}>සටහන් (Comments - Good/Bad observations)</Label>
                    <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="නිරීක්ෂණ..." className={inputCls} />
                  </div>
                </div>

                <div className={`rounded-2xl p-4 border text-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-emerald-50/70 border-emerald-100"}`}>
                  <h3 className={`text-sm font-extrabold ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                    rainforest alliance පිරික්සුම් ලැයිස්තුව (Environmental Checklist)
                  </h3>
                  <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    RA සහතිකකරණ නිර්ණායක 6ට අනුකූලදැයි පරීක්ෂා කර පිළිතුරු සටහන් කරන්න.
                  </p>
                </div>

                <RaCard index={1} titleSi="වන විනාශය නොකිරීම" titleEn="No Deforestation" req="6.1.1" question="2014 ජනවාරි 1 දිනෙන් පසුව ස්වභාවික කැලෑ/වනාන්තර කපා එළිපෙහෙළි කර තේ වගාවට ගෙන තිබේද?" policy="RA නීතිය: 2014න් පස්සේ කැලෑ කපලා තියෙනවා නම් RA certificate එක සිරාවටම ලැබෙන්නේ නැහැ. (පිළිතුර No විය යුතුය)" value={raNoDeforestation} onChange={setRaNoDeforestation} yesIsGood={false} />
                <RaCard index={2} titleSi="ඇළ, දොළ, ගංගා ආරක්ෂා කිරීම" titleEn="Riparian Buffer Protection" req="6.3.1 & 6.3.2" question="වත්ත ආසන්නයේ ඇති ජල මාර්ග (ඇළ/දොළ/ලිං) වටා මීටර් 5 - 10 අතර රසායනික ද්‍රව්‍ය නොගසන ආරක්ෂිත කලාපයක් (Buffer Zone) පවත්වා ගන්නේද?" policy="RA නීතිය: වගාවේ පාවිච්චි කරන පොහොර හෝ කෘමිනාශක ජල මාර්ග වලට එකතු වීම වැළැක්විය යුතුය." value={raRiparianBuffer} onChange={setRaRiparianBuffer} yesIsGood={true} />
                <RaCard index={3} titleSi="අපද්‍රව්‍ය ගිනි තැබීම තහනම" titleEn="No Waste Burning" req="6.7.2" question="වත්ත තුළ හෝ පරිශ්‍රයේ ප්ලාස්ටික්, පොලිතීන් හෝ නොදිරන කුණු වර්ග එළිමහනේ ගිනි තබනවාද?" policy="RA නීතිය: කිසිම පරිසරයක නොදිරන ද්‍රව්‍ය ගිනි තැබීම සපිරියෙන්ම තහනම්. (පිළිතුර No විය යුතුය)" value={raNoWasteBurning} onChange={setRaNoWasteBurning} yesIsGood={false} />
                <RaCard index={4} titleSi="වැසි ජලය එකතු කිරීම සහ භාවිතය" titleEn="Rainwater Harvesting" req="6.5.5" question="වගා කටයුතු හෝ වෙනත් අවශ්‍යතා සඳහා වැසි ජලය එකතු කර පාවිච්ි කිරීමට ක්‍රමවේදයක් තිබේද?" policy="RA නීතිය: භගත ජලය විතරක් පාවිච්ි නොකර වැසි ජලය කළමනාකරණය කිරීම ප්‍රවර්ධනය කරයි." value={raRainwaterHarvesting} onChange={setRaRainwaterHarvesting} yesIsGood={true} />
                <RaCard index={5} titleSi="පස සේදියාම පාලනය" titleEn="Soil Erosion Control" req="6.4.5 & 4.4.4" question="බෑවුම් සහිත ස්ථාන වල පස සේදියාම වැළැක්වීමට කානු (Terracing), ආවරණ බෝග (Mulching / Cover Crops) යොදා තිබේද?" policy="RA නීතිය: පස නිසරු වීම වැළැක්වීම අනිවාර්යය." value={raSoilErosion} onChange={setRaSoilErosion} yesIsGood={true} />
                <RaCard index={6} titleSi="වනසතුන් සහ ජෛව විවිධත්වය ආරක්ෂා කිරීම" titleEn="Wildlife Protection" req="6.4.1 & 6.4.2" question="වත්ත තුළ වනසතුන් දඩයම් කිරීම, මන්දගැසීම හෝ සතුන් සිරකර තබාගැනීම සිදු නොවන්නේද?" policy="RA නීතිය: දඩයම් කිරීම හෝ තර්ජනයට ලක්වූ සතුන් මැරීම නීතියෙන් සහ RA මගින් සම්පූර්ණයෙන්ම තහනම්." value={raWildlifeProtection} onChange={setRaWildlifeProtection} yesIsGood={true} />

                <button
                  type="submit"
                  disabled={isSubmitting || gpsStage !== "idle"}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-extrabold shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <MapPin className="w-5 h-5" />
                  <span>
                    {isSubmitting ? "සුරකිමින්..." : "ස්ථානය තහවුරු කර ඉදිරිපත් කරන්න (Refresh GPS & Submit)"}
                  </span>
                </button>
              </>
            )}
          </form>

          {/* ---------- Progress dock: fixed, OUTSIDE form so it doesn't overlap content ---------- */}
          {formType === "inactive" && (
            <div className="fixed bottom-16 inset-x-0 z-30 px-3 pb-2 pointer-events-none">
              <div className={`max-w-2xl mx-auto pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${isDark ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-emerald-100"}`}>
                <div className="flex items-center justify-between gap-3">
                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {slides.map((s, i) => {
                      const done = passed.includes(i);
                      const current = i === slideIdx;
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.titleEn}
                          type="button"
                          onClick={() => jumpTo(i)}
                          title={`${s.titleSi} (${s.titleEn})`}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold border transition-all active:scale-90 ${
                            done
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30"
                              : current
                                ? isDark
                                  ? "bg-slate-800 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40"
                                  : "bg-white border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/30"
                                : isDark
                                  ? "bg-slate-800/60 border-slate-700 text-slate-500"
                                  : "bg-white/70 border-emerald-100 text-slate-400"
                          }`}
                        >
                          {done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Counts */}
                  <div className="text-right shrink-0">
                    <p className={`text-[11px] font-extrabold ${isDark ? "text-white" : "text-emerald-900"}`}>
                      පියවර {slideIdx + 1} / {totalSlides}
                    </p>
                    <p className="text-[10px] font-bold flex items-center justify-end gap-2">
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="w-3 h-3" />
                        {passedCount}
                      </span>
                      <span className={`inline-flex items-center gap-1 ${isDark ? "text-amber-300" : "text-amber-600"}`}>
                        <Pencil className="w-3 h-3" />
                        {remainingCount}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-emerald-100/80"}`}>
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${Math.round((passedCount / totalSlides) * 100)}%` }}
                  />
                </div>
                <p className={`mt-1 text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  සම්පූර කළ පියවර {passedCount} ක් • තව පියවර {remainingCount} ක් පිරවිය යුතුය
                </p>
              </div>
            </div>
          )}
        </>
        )}
      </div>

      {/* Compact floating logout bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 px-4 pb-3 pt-1.5 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={onLogout}
            className="relative w-full group flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-rose-500 hover:from-red-500 hover:via-rose-500 hover:to-red-600 text-white text-xs font-extrabold shadow-xl shadow-red-600/40 active:scale-[0.97] transition-all"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25 ring-1 ring-white/40">
              <LogOut className="w-3 h-3 text-white" />
            </span>
            <span className="tracking-wide">නික්මීම • Logout</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddRouteModal isOpen={showAddRouteModal} onClose={() => setShowAddRouteModal(false)} onRouteAdded={(r) => setRoute(r.name)} theme={theme} currentFactory={factory} />
      <AddReasonModal isOpen={showAddReasonModal} onClose={() => setShowAddReasonModal(false)} onReasonAdded={(r) => setPromiseReason(r.id)} theme={theme} />

      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl border ${isDark ? "bg-slate-900 border-indigo-500/30 text-white" : "bg-white border-indigo-200 text-slate-900"}`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-indigo-500/20">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                නව අභිමත ප්‍රශ්නයක් (Add New Field)
              </h3>
              <button onClick={() => setShowAddFieldModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuickField} className="space-y-4">
              <div>
                <Label dark={isDark}>ප්‍රශ්නය / මිනුම (Title) *</Label>
                <input type="text" value={qTitle} onChange={(e) => setQTitle(e.target.value)} placeholder="E.g: වගා බිමේ ප්‍රමාණය (අක්කර)" required className={inputCls} />
              </div>
              <div>
                <Label dark={isDark}>ආදාන වර්ගය (Input Type)</Label>
                <select value={qType} onChange={(e) => setQType(e.target.value as any)} className={inputCls}>
                  <option value="text">පෙළ (Text)</option>
                  <option value="number">සංඛ්‍යා (Number)</option>
                  <option value="dropdown">ලැයිස්තුව (Dropdown)</option>
                  <option value="boolean">ඔව් / නැත (Boolean)</option>
                </select>
              </div>
              {qType === "dropdown" && (
                <div>
                  <Label dark={isDark}>විකල්ප (Comma separated)</Label>
                  <input type="text" value={qOptions} onChange={(e) => setQOptions(e.target.value)} placeholder="වරක්, දෙවරක්, තුන්වරක්" className={inputCls} />
                </div>
              )}
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-extrabold shadow-lg shadow-indigo-600/30">
                ප්‍රශ්නය එක් කරන්න (Add Field)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
