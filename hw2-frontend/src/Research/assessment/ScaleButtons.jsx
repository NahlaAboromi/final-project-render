// src/Research/assessment/ScaleButtons.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';

// צבעים לפי value (לכפתור העגול עם הגרדיאנט)
const paletteByValue = {
  1: { color: 'from-red-600 to-rose-600',     bg: 'bg-red-50',     border: 'border-red-400',     hover: 'hover:border-red-500' },
  2: { color: 'from-orange-600 to-amber-600', bg: 'bg-orange-50',  border: 'border-orange-400',  hover: 'hover:border-orange-500' },
  3: { color: 'from-blue-600 to-cyan-600',    bg: 'bg-blue-50',    border: 'border-blue-400',    hover: 'hover:border-blue-500' },
  4: { color: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-50', border: 'border-emerald-400', hover: 'hover:border-emerald-500' },
};

export default function ScaleButtons({ options, selected, onSelect }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3">
      {options.map((opt) => {
        const pal = paletteByValue[opt.value] || paletteByValue[4];
        const isSelected = selected === opt.value;

        // כרטיס – קטן יותר ורספונסיבי
        const cardBase =
          'group relative rounded-xl border-2 transition-all duration-200 focus:outline-none px-3 py-3 sm:px-4 sm:py-4 ' +
          (isDark
            ? 'focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
            : 'focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white');

        const cardCls = isSelected
          ? (
              isDark
                ? 'bg-slate-800/80 border-slate-500 shadow-lg scale-[1.02]'
                : `${pal.bg} ${pal.border} shadow-lg scale-[1.02]`
            )
          : (
              isDark
                ? 'border-slate-700 bg-slate-900/70 hover:bg-slate-800/80 hover:border-slate-500 shadow-sm'
                : `border-slate-200 bg-white ${pal.hover} hover:shadow-md`
            );

        const labelCls = isDark ? 'text-slate-100' : 'text-slate-700';
        const kbdCls = isDark
          ? 'text-[10px] sm:text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded-lg border border-slate-600'
          : 'text-[10px] sm:text-xs bg-slate-100 px-2 py-1 rounded-lg border border-slate-300';

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={isSelected}
            title={`${opt.label} (${opt.value})`}
            className={`${cardBase} ${cardCls} hover:scale-[1.02] active:scale-95`}
          >
            {/* עיגול הצבע – קטן יותר במובייל */}
            <div
              className={`
                w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3
                rounded-xl bg-gradient-to-br ${pal.color}
                flex items-center justify-center
                text-white font-bold text-lg sm:text-2xl shadow-md
              `}
            >
              {opt.value}
            </div>

            {/* תווית */}
            <div className={`text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-center ${labelCls}`}>
              {opt.label}
            </div>

            {/* hotkey */}
            <div className="flex justify-center">
              <kbd className={kbdCls}>{opt.value}</kbd>
            </div>
          </button>
        );
      })}
    </div>
  );
}
