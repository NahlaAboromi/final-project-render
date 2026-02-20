// src/Research/Thanks/HeroSection.jsx
import React from 'react';

export default function HeroSection({ hasSocratic, isDark, isRTL, t }) {
  return (
    <div className={`text-center mb-12 ${isRTL ? 'text-right' : 'text-left'} md:text-center`}>
      <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}>
        {hasSocratic ? t('heroTitle_has') : t('heroTitle_no')}
      </h1>
      
      <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${
        isDark ? 'text-slate-300' : 'text-slate-700'
      }`}>
        {hasSocratic ? t('heroSubtitle_has') : t('heroSubtitle_no')}
      </p>

      {/* Status Badges */}
      <div className={`flex flex-wrap items-center justify-center gap-3 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className={`inline-flex items-center gap-2 text-sm font-bold rounded-full px-5 py-2.5 shadow-lg transition-all hover:scale-105 ${
          isDark 
            ? 'bg-slate-800 text-emerald-400 border-2 border-emerald-500/50' 
            : 'bg-white text-emerald-600 border-2 border-emerald-200'
        }`}>
          <span className="text-lg">✓</span>
          {t('ribbons_completed')}
        </span>

        <span className={`inline-flex items-center gap-2 text-sm font-bold rounded-full px-5 py-2.5 shadow-lg transition-all hover:scale-105 ${
          isDark 
            ? 'bg-slate-800 text-purple-400 border-2 border-purple-500/50' 
            : 'bg-white text-purple-600 border-2 border-purple-200'
        }`}>
          <span className="text-lg">🔒</span>
          {t('ribbons_anonymous')}
        </span>

        {hasSocratic && (
          <span className={`inline-flex items-center gap-2 text-sm font-bold rounded-full px-5 py-2.5 shadow-lg transition-all hover:scale-105 ${
            isDark 
              ? 'bg-slate-800 text-blue-400 border-2 border-blue-500/50' 
              : 'bg-white text-blue-600 border-2 border-blue-200'
          }`}>
            <span className="text-lg">💭</span>
            {t('ribbons_reflective')}
          </span>
        )}
      </div>
    </div>
  );
}