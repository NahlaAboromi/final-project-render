// src/Research/AppreciationCard.jsx
import React from 'react';

export default function AppreciationCard({ aboutList, isDark, isRTL, t }) {
  return (
    <div className={`lg:col-span-2 rounded-3xl shadow-2xl overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' 
        : 'bg-white border border-slate-200'
    }`}>
      <div className={`h-2 ${
        isDark 
          ? 'bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500' 
          : 'bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400'
      }`} />
      
      <div className="p-8 md:p-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={`flex items-center justify-center gap-4 mb-8 ${isRTL ? '' : 'flex-row-reverse'}`}>
          <h2 className={`text-3xl md:text-4xl font-bold ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {t('aboutTitle')}
          </h2>
          <span className="text-5xl">🙏</span>
        </div>

        <div className="space-y-6">
          {aboutList.map((item, i) => (
            <div 
              key={i} 
              className={`flex gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02] ${
                isDark 
                  ? 'bg-slate-800/50 hover:bg-slate-800' 
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
              style={{ 
                flexDirection: isRTL ? 'row' : 'row',
                textAlign: isRTL ? 'right' : 'left'
              }}
            >
              {isRTL ? (
                <>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isDark 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                      : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                  }`}>
                    {i + 1}
                  </div>
                  <p className={`flex-1 text-base md:text-lg leading-relaxed ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {item}
                  </p>
                </>
              ) : (
                <>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isDark 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                      : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                  }`}>
                    {i + 1}
                  </div>
                  <p className={`flex-1 text-base md:text-lg leading-relaxed ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {item}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}