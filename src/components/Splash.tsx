"use client";

import React from "react";

/**
 * KDU GROUP boot splash.
 * - No text at all.
 * - The KDU crest sits on a soft pulsing glow.
 * - Two animated steam wisps rise above it, built purely with CSS
 *   (conic-gradient ribbons + @property conic-angle animation + SVG masks
 *    + layered blur), so they look like real tea vapour.
 */

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <img
    src="/kdu-logo.png"
    alt=""
    draggable={false}
    style={{ width: size, height: size, objectFit: "contain" }}
  />
);

/** One steam wisp: a tapered conic-gradient ribbon revealed by an SVG mask. */
const SteamWisp: React.FC<{
  delay: number;
  duration: number;
  x: number;      // horizontal offset in %
  height: number; // wisp height in px
  width: number;  // wisp width in px
  opacity: number;
  hue: string;
}> = ({ delay, duration, x, height, width, opacity, hue }) => (
  <div
    className="steam-wisp"
    style={{
      left: `${x}%`,
      bottom: 0,
      width,
      height,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      ["--steam-opacity" as any]: opacity,
    }}
  >
    {/* the ribbon: conic gradient whose angle animates via @property */}
    <div className="steam-ribbon" style={{ background: hue }} />
    {/* soft halo copy, blurred, slightly larger */}
    <div className="steam-halo" style={{ background: hue }} />
  </div>
);

export const Splash: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-gradient-to-b from-emerald-950 via-[#062e21] to-slate-950">
      {/* ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl splash-glow-a pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-teal-400/15 blur-3xl splash-glow-b pointer-events-none" />
      <div className="absolute top-1/4 right-1/5 w-52 h-52 rounded-full bg-emerald-300/10 blur-2xl splash-glow-c pointer-events-none" />

      {/* drifting leaves (decorative) */}
      <svg className="absolute top-[14%] left-[12%] w-12 h-12 splash-leaf-a pointer-events-none" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C7 6 4 10 4 14a8 8 0 0 0 16 0c0-4-3-8-8-12Z" fill="url(#lg1)" />
        <defs>
          <linearGradient id="lg1" x1="4" y1="2" x2="20" y2="22">
            <stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <svg className="absolute bottom-[18%] right-[10%] w-14 h-14 splash-leaf-b pointer-events-none" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C7 6 4 10 4 14a8 8 0 0 0 16 0c0-4-3-8-8-12Z" fill="url(#lg2)" />
        <defs>
          <linearGradient id="lg2" x1="4" y1="2" x2="20" y2="22">
            <stop stopColor="#a7f3d0" /><stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <svg className="absolute top-[58%] left-[8%] w-9 h-9 splash-leaf-c pointer-events-none" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C7 6 4 10 4 14a8 8 0 0 0 16 0c0-4-3-8-8-12Z" fill="url(#lg3)" />
        <defs>
          <linearGradient id="lg3" x1="4" y1="2" x2="20" y2="22">
            <stop stopColor="#d1fae5" /><stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>
      </svg>

      {/* centred logo + steam column */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative flex flex-col items-center" style={{ width: 260, height: 320 }}>
          {/* steam rising from the cup of the crest */}
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ bottom: 172, width: 180, height: 190 }}>
            <SteamWisp delay={0} duration={4.6} x={34} height={170} width={46} opacity={0.75} hue="conic-gradient(from var(--steam-angle) at 50% 100%, transparent 0deg, #6ee7b7 60deg, #a7f3d0 130deg, transparent 200deg)" />
            <SteamWisp delay={1.3} duration={5.4} x={50} height={150} width={40} opacity={0.6} hue="conic-gradient(from var(--steam-angle) at 50% 100%, transparent 0deg, #34d399 70deg, #d1fae5 140deg, transparent 210deg)" />
            <SteamWisp delay={2.4} duration={6.2} x={20} height={130} width={38} opacity={0.45} hue="conic-gradient(from var(--steam-angle) at 50% 100%, transparent 0deg, #2dd4bf 60deg, #6ee7b7 120deg, transparent 190deg)" />
          </div>

          {/* glow disc behind the crest */}
          <div className="absolute splash-glow-disc" style={{ bottom: 8, width: 210, height: 210 }} />

          {/* the crest itself, gently breathing */}
          <div className="relative splash-logo-breathe" style={{ bottom: 0 }}>
            <Logo size={170} />
          </div>

          {/* saucer ring light that sweeps around the crest */}
          <div className="absolute splash-ring" style={{ bottom: -14, width: 200, height: 200 }} />
        </div>
      </div>

      {/* local styles for the splash animations */}
      <style jsx global>{`
        /* animatable custom property for the conic angle */
        @property --steam-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .steam-wisp {
          position: absolute;
          pointer-events: none;
          opacity: 0;
          animation-name: steam-rise;
          animation-timing-function: cubic-bezier(0.33, 0, 0.2, 1);
          animation-iteration-count: infinite;
          will-change: transform, opacity, filter;
        }
        .steam-ribbon,
        .steam-halo {
          position: absolute;
          inset: 0;
          background-repeat: no-repeat;
          -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 200'><path d='M50 198 C18 168 30 140 44 116 C58 92 62 70 52 44 C44 24 48 12 58 2 C54 20 62 34 60 58 C58 82 44 104 40 128 C36 152 46 176 62 198 Z' fill='black'/></svg>");
          mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 200'><path d='M50 198 C18 168 30 140 44 116 C58 92 62 70 52 44 C44 24 48 12 58 2 C54 20 62 34 60 58 C58 82 44 104 40 128 C36 152 46 176 62 198 Z' fill='black'/></svg>");
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }
        .steam-ribbon { filter: blur(1.5px); }
        .steam-halo {
          filter: blur(14px);
          transform: scale(1.28);
          transform-origin: 50% 100%;
          opacity: 0.7;
        }

        /* the wisp climbs, sways, and dissolves */
        @keyframes steam-rise {
          0% {
            opacity: 0;
            transform: translateY(6%) scaleX(0.82) rotate(0deg);
            --steam-angle: 0deg;
            filter: blur(6px);
          }
          18% { opacity: var(--steam-opacity, 0.7); filter: blur(2px); }
          45% {
            transform: translateY(-32%) scaleX(1.02) rotate(3.5deg);
            --steam-angle: 95deg;
          }
          70% {
            transform: translateY(-62%) scaleX(1.12) rotate(-4deg);
            --steam-angle: 170deg;
            filter: blur(3px);
          }
          92% { opacity: 0.06; }
          100% {
            opacity: 0;
            transform: translateY(-88%) scaleX(1.28) rotate(-7deg);
            --steam-angle: 240deg;
            filter: blur(10px);
          }
        }

        /* soft radial glow behind the crest */
        .splash-glow-disc {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(16, 185, 129, 0.35) 0%,
            rgba(16, 185, 129, 0.14) 40%,
            rgba(16, 185, 129, 0) 72%
          );
          animation: splash-disc 4.2s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes splash-disc {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.14); opacity: 1; }
        }

        /* the crest breathes gently */
        .splash-logo-breathe {
          position: absolute;
          animation: splash-breathe 4.2s ease-in-out infinite;
        }
        @keyframes splash-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.045) translateY(-3px); }
        }

        /* light ring sweeping around the crest */
        .splash-ring {
          position: absolute;
          border-radius: 9999px;
          border: 1.5px solid transparent;
          background:
            linear-gradient(transparent, transparent) padding-box,
            conic-gradient(
              from var(--ring-angle, 0deg),
              rgba(16, 185, 129, 0) 0deg,
              rgba(16, 185, 129, 0.75) 55deg,
              rgba(45, 212, 191, 0.85) 80deg,
              rgba(16, 185, 129, 0) 150deg,
              rgba(16, 185, 129, 0) 360deg
            ) border-box;
          -webkit-mask: linear-gradient(#000 0 0) padding-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) padding-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          animation: splash-spin 5.5s linear infinite;
          pointer-events: none;
        }
        @property --ring-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes splash-spin {
          to { --ring-angle: 360deg; }
        }

        /* ambient glow pulses */
        .splash-glow-a { animation: splash-ambient 7s ease-in-out infinite; }
        .splash-glow-b { animation: splash-ambient 9s ease-in-out infinite reverse; }
        .splash-glow-c { animation: splash-ambient 11s ease-in-out infinite; }
        @keyframes splash-ambient {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        /* drifting leaves */
        .splash-leaf-a { animation: splash-leaf 9s ease-in-out infinite; }
        .splash-leaf-b { animation: splash-leaf 13s ease-in-out infinite 1.4s; }
        .splash-leaf-c { animation: splash-leaf 16s ease-in-out infinite 3s; }
        @keyframes splash-leaf {
          0%, 100% { transform: translateY(0) rotate(-8deg); opacity: 0.5; }
          50% { transform: translateY(-26px) rotate(10deg); opacity: 0.85; }
        }

        /* respect reduced-motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .steam-wisp,
          .splash-glow-disc,
          .splash-logo-breathe,
          .splash-ring,
          .splash-glow-a,
          .splash-glow-b,
          .splash-glow-c,
          .splash-leaf-a,
          .splash-leaf-b,
          .splash-leaf-c {
            animation: none !important;
          }
          .steam-wisp { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
};
