// src/admin/AdminResultsShared.jsx
import React from "react";

// Visual section label — separates logical groups of cards
export const SectionLabel = ({ label, isDark }) => (
  <div className="flex items-center gap-3 mt-8 mb-4">
    <div className={`h-px flex-1 ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
    <span
      className={`text-xs font-bold uppercase tracking-widest px-2 ${
        isDark ? "text-slate-400" : "text-slate-400"
      }`}
    >
      {label}
    </span>
    <div className={`h-px flex-1 ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
  </div>
);

export const Card = ({ title, isDark, children }) => (
  <section
    className={`rounded-2xl border shadow-sm mb-5 overflow-hidden ${
      isDark ? "bg-slate-800/70 border-slate-700" : "bg-white border-slate-200"
    }`}
  >
    <div
      className={`px-5 py-3.5 border-b ${
        isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-100 bg-slate-50"
      }`}
    >
      <h2
        className={`font-bold text-sm uppercase tracking-wide ${
          isDark ? "text-slate-200" : "text-slate-600"
        }`}
      >
        {title}
      </h2>
    </div>
    <div className="px-5 py-5">{children}</div>
  </section>
);

export const KV = ({ label, value, isRTL }) => (
  <div
    className={`flex ${
      isRTL ? "flex-row-reverse" : "flex-row"
    } items-start justify-between gap-4 py-2 border-b last:border-b-0 ${
      "border-slate-100 dark:border-slate-700/50"
    }`}
  >
    <div className="text-sm opacity-60 shrink-0">{label}</div>
    <div className="text-sm font-semibold break-words text-right max-w-[70%]">{value}</div>
  </div>
);