"use client";

import React, { useState } from "react";
import { Leaf, ShieldHalf, User, Lock, ArrowLeft } from "lucide-react";
import { User as UserType } from "@/types";

export const KDU_LOGO_URL =
  "https://res.cloudinary.com/dhd06wdov/image/upload/v1781669562/logokdu_xo5m6f.png";

export const KDU_VIDEO_URL =
  "https://res.cloudinary.com/dhd06wdov/video/upload/v1792468249/vecteezy_green-tea-leaf-with-wind-motion-when-spring-season-the_22174639_online-video-cutter.com_hcivkw.mp4";

/* ---------- Shared bits ---------- */

export const ThemePill: React.FC<{ theme: "dark" | "light"; onToggle: () => void }> = ({
  theme,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    className="px-5 py-3 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-sm font-extrabold tracking-wide border border-white/20 shadow-xl active:scale-95 transition-all"
  >
    {theme === "dark" ? "LIGHT ☀️" : "DARK 🌙"}
  </button>
);

const FloatingLeaves: React.FC = () => (
  <>
    <Leaf className="absolute top-[14%] left-[8%] w-14 h-14 text-emerald-400/50 animate-float pointer-events-none" />
    <Leaf className="absolute top-[46%] right-[6%] w-16 h-16 text-emerald-300/40 animate-float-slow pointer-events-none rotate-45" />
    <Leaf className="absolute bottom-[22%] left-[12%] w-12 h-12 text-teal-300/40 animate-float-slow pointer-events-none -rotate-12" />
    <Leaf className="absolute bottom-[8%] right-[14%] w-14 h-14 text-emerald-400/50 animate-float pointer-events-none rotate-90" />
    <span className="absolute top-[28%] right-[22%] w-3 h-3 rounded-full bg-sky-400/70 animate-float pointer-events-none" />
    <span className="absolute top-[60%] left-[20%] w-2 h-2 rounded-full bg-white/50 animate-float-slow pointer-events-none" />
  </>
);

/**
 * Video background used on all login screens.
 * Replaces the static plantation photo with an autoplaying loop.
 * Overlay keeps text readable on top.
 */
/**
 * Video-only animated backdrop for all login screens.
 * No poster image, no fallback photo — while the MP4 buffers, an on-brand
 * dark emerald gradient shows instead so the screen never flashes a still.
 */
const VideoBackdrop: React.FC<{ overlay?: string }> = ({ overlay }) => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-b from-emerald-950 via-[#06301f] to-slate-950">
    {/* Animated tea-leaf video layer */}
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover scale-105"
    >
      <source src={KDU_VIDEO_URL} type="video/mp4" />
    </video>

    {/* Dark overlay for text contrast */}
    <div
      className={`absolute inset-0 ${
        overlay || "bg-gradient-to-b from-slate-900/55 via-slate-900/35 to-emerald-950/70"
      }`}
    />
  </div>
);

/* ---------- 1. HOME / ROLE PICKER ---------- */

export const HomeScreen: React.FC<{
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onSelectCollector: () => void;
  onSelectAdmin: () => void;
}> = ({ theme, onToggleTheme, onSelectCollector, onSelectAdmin }) => (
  <div className="relative min-h-screen overflow-hidden">
    <VideoBackdrop />
    <FloatingLeaves />

    <div className="absolute top-0 inset-x-0 flex justify-end p-4 sm:p-6">
      <ThemePill theme={theme} onToggle={onToggleTheme} />
    </div>

    <div className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[36px] border border-white/40 bg-white/10 backdrop-blur-md shadow-2xl px-6 py-10 sm:px-10 text-center animate-fadeIn">
        {/* KDU GROUP Emblem — white circular base so the crest blends perfectly */}
        <div className="mx-auto w-28 h-28 rounded-full overflow-hidden bg-white ring-4 ring-emerald-300/80 shadow-2xl shadow-emerald-950/60 mb-6">
          <img
            src={KDU_LOGO_URL}
            alt="KDU GROUP"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg tracking-[0.08em]">
          KDU GROUP
        </h1>

        <div className="mt-9 space-y-4">
          {/* Extension Officer Log In */}
          <button
            onClick={onSelectCollector}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-left shadow-xl shadow-emerald-900/40 active:scale-[0.98] transition-all"
          >
            <Leaf className="w-7 h-7 text-white shrink-0" fill="currentColor" strokeWidth={1} />
            <span>
              <span className="block text-lg font-extrabold text-white leading-tight">
                ව්‍යාප්ති නිලධාරී
              </span>
              <span className="block text-sm text-emerald-100 font-medium">
                Extension Officer Log In
              </span>
            </span>
          </button>

          {/* Admin Portal */}
          <button
            onClick={onSelectAdmin}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-white/50 bg-white/10 backdrop-blur-md hover:bg-white/20 text-left shadow-xl active:scale-[0.98] transition-all"
          >
            <ShieldHalf className="w-7 h-7 text-emerald-300 shrink-0" />
            <span>
              <span className="block text-lg font-extrabold text-white leading-tight">
                පරිපාලන ද්වාරය
              </span>
              <span className="block text-sm text-slate-200 font-medium">Admin Portal</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ---------- 2. COLLECTOR LOGIN ---------- */

export const CollectorLoginScreen: React.FC<{
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onBack: () => void;
  collectors: UserType[];
  onLogin: (name: string, employeeId: string) => Promise<string | null>;
}> = ({ theme, onToggleTheme, onBack, collectors, onLogin }) => {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePickName = (picked: string) => {
    setName(picked);
    const match = collectors.find((c) => c.name === picked);
    if (match) setEmployeeId(match.employeeId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await onLogin(name, employeeId);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <VideoBackdrop />
      <FloatingLeaves />

      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 sm:p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 border border-white/30 backdrop-blur-md text-white text-sm font-extrabold shadow-xl active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ආපසු (Back)</span>
        </button>
        <ThemePill theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="min-h-screen flex items-center justify-center px-5 py-24">
        <div className="w-full max-w-md rounded-[36px] border border-white/40 bg-white/10 backdrop-blur-md shadow-2xl px-6 py-10 sm:px-9 animate-fadeIn">
          {/* KDU GROUP logo (tilted squircle frame, white base) */}
          <div className="mx-auto w-24 h-24 rounded-[28px] overflow-hidden bg-white rotate-6 shadow-[10px_10px_0_rgba(4,80,58,0.45)] ring-4 ring-emerald-400/70 mb-6">
            <img
              src={KDU_LOGO_URL}
              alt="KDU GROUP"
              className="w-full h-full object-cover -rotate-6 scale-[1.35]"
              draggable={false}
            />
          </div>

          <h1 className="text-center text-4xl font-extrabold text-white drop-shadow-lg">පිවිසුම</h1>
          <p className="mt-2 mb-8 text-center text-emerald-300 font-bold text-sm flex items-center justify-center gap-1.5 drop-shadow">
            <Leaf className="w-4 h-4" fill="currentColor" strokeWidth={1} />
            <span>දළු එකතු කරන්නා (Leaf Collector)</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">
                නම (Name)
              </label>
              {collectors.length > 0 ? (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 pointer-events-none" />
                  <select
                    value={name}
                    onChange={(e) => handlePickName(e.target.value)}
                    required
                    className="w-full appearance-none pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/30 backdrop-blur-md text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="" className="text-slate-900">
                      ඔබගේ නම තෝරන්න (Select Name)
                    </option>
                    {collectors.map((c) => (
                      <option key={c.id} value={c.name} className="text-slate-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ඔබගේ නම ඇතුලත් කරන්න (Enter Name)"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/30 backdrop-blur-md text-white placeholder-white/50 text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">
                සේවක අංකය (Employee ID)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 pointer-events-none" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP001"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/30 backdrop-blur-md text-white placeholder-white/50 text-base font-medium tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-200 bg-red-500/25 border border-red-400/40 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-extrabold shadow-xl shadow-emerald-900/40 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? "පරීක්ෂා කරමින්..." : "ඇතුල් වන්න (Login)"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ---------- 3. ADMIN LOGIN ---------- */

export const AdminLoginScreen: React.FC<{
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onBack: () => void;
  onLogin: (employeeId: string, password: string) => Promise<string | null>;
}> = ({ theme, onToggleTheme, onBack, onLogin }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await onLogin(employeeId, password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <VideoBackdrop overlay="bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950/80" />

      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 sm:p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-white text-sm font-extrabold shadow-xl active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <ThemePill theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="min-h-screen flex items-center justify-center px-5 py-24">
        <div className="w-full max-w-md rounded-[36px] border border-white/25 bg-slate-900/35 backdrop-blur-md shadow-2xl px-6 py-10 sm:px-9 animate-fadeIn">
          {/* KDU GROUP logo (dark-mode squircle frame, white base) */}
          <div className="mx-auto w-24 h-24 rounded-[28px] overflow-hidden bg-white rotate-6 shadow-[10px_10px_0_rgba(0,0,0,0.35)] ring-2 ring-white/40 mb-6">
            <img
              src={KDU_LOGO_URL}
              alt="KDU GROUP"
              className="w-full h-full object-cover -rotate-6 scale-[1.35]"
              draggable={false}
            />
          </div>

          <h1 className="text-center text-4xl font-extrabold text-white drop-shadow-lg">
            Admin Portal
          </h1>
          <p className="mt-2 mb-8 text-center text-slate-300 font-semibold text-sm flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Access</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-extrabold text-white mb-2">
                Email / Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 pointer-events-none" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="akashperera@kdu.com"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/25 backdrop-blur-md text-white placeholder-white/40 text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-white mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/25 backdrop-blur-md text-white placeholder-white/40 text-base font-medium tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-200 bg-red-500/25 border border-red-400/40 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-slate-700/90 hover:bg-slate-600 border border-white/10 text-white text-lg font-extrabold shadow-xl active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? "Checking..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
