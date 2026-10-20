"use client";

import React, { useState } from "react";

interface DonutSlice {
  label: string;
  count: number;
  color: string;
  percent: number;
}

interface DonutChartProps {
  data: DonutSlice[];
  total: number;
  theme: "dark" | "light";
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, total, theme }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const isDark = theme === "dark";

  if (total === 0 || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <p>දත්ත නොමැත (No data available for selected filter)</p>
      </div>
    );
  }

  // SVG parameters
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={isDark ? "rgba(55, 65, 81, 0.4)" : "rgba(229, 231, 235, 0.8)"}
            strokeWidth={strokeWidth}
          />

          {data.map((slice, i) => {
            const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercent / 100) * circumference);
            cumulativePercent += slice.percent;
            const isHovered = hoveredIdx === i;

            return (
              <circle
                key={slice.label + i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            {hoveredIdx !== null ? data[hoveredIdx].count : total}
          </span>
          <span className="text-[11px] font-medium text-emerald-400">
            {hoveredIdx !== null ? `${data[hoveredIdx].percent.toFixed(1)}%` : "මුළු වාර්තා"}
          </span>
        </div>
      </div>

      {/* Legend Column */}
      <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {data.map((slice, i) => (
          <div
            key={slice.label + i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
              hoveredIdx === i
                ? isDark ? "bg-slate-800 ring-1 ring-emerald-500/50" : "bg-emerald-50 ring-1 ring-emerald-500/30"
                : "hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: slice.color }}
              />
              <span className={`truncate font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {slice.label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold">{slice.count}</span>
              <span className="text-[10px] text-emerald-400 font-mono w-10 text-right">
                {slice.percent.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BarItem {
  label: string;
  count: number;
}

interface BarChartProps {
  data: BarItem[];
  theme: "dark" | "light";
}

export const BarChart: React.FC<BarChartProps> = ({ data, theme }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const isDark = theme === "dark";

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        <p>දත්ත නොමැත (No data available for selected filter)</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full">
      <div className="h-56 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2 overflow-x-auto">
        {data.slice(0, 10).map((item, i) => {
          const heightPercent = Math.max((item.count / maxVal) * 100, 8);
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={item.label + i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 min-w-[40px] flex flex-col items-center h-full justify-end group cursor-pointer"
            >
              {/* Tooltip count above bar */}
              <div className={`text-[10px] font-mono font-bold mb-1 transition-opacity ${
                isHovered ? "opacity-100 text-emerald-400" : "opacity-70 text-slate-400"
              }`}>
                {item.count}
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 relative ${
                  isHovered
                    ? "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/40"
                    : "bg-gradient-to-t from-emerald-800 to-teal-600 hover:from-emerald-700 hover:to-teal-500"
                }`}
              />

              {/* Label */}
              <span className={`text-[9px] sm:text-[10px] mt-2 font-medium truncate w-full text-center transition-colors ${
                isHovered ? "text-emerald-400 font-bold" : isDark ? "text-slate-400" : "text-slate-600"
              }`} title={item.label}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
