// src/Research/Thanks/LoadingScreen.jsx
import React from 'react';
import AnonymousHeader from '../AnonymousHeader';
import Footer from '../../layout/Footer';
export default function LoadingScreen({ isDark, dir, langAttr }) {
  return (
    <div
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'
      }`}
      dir={dir}
      lang={langAttr}
    >
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>
      <main className="flex-1 grid place-items-center p-8">
        <div className="flex flex-col items-center gap-4 opacity-80">
          <div className={`w-12 h-12 rounded-full border-4 animate-spin ${isDark ? 'border-slate-600 border-t-slate-300' : 'border-slate-200 border-t-slate-600'}`} />
        </div>
      </main>
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}