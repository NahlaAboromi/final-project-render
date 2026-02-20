// src/Research/SimulationChat.jsx
import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { ThemeContext } from '../DarkLightMood/ThemeContext';

export default function SimulationChat() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const trial = state?.trial || {};
  const group = trial?.group;
  const groupType = trial?.groupType;

  return (
<div
  className={`flex flex-col min-h-screen w-screen ${
    isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
  }`}
  style={{ fontFamily: 'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
>
      {/* HEADER */}
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      {/* MAIN */}
      <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
        <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 md:p-7 rounded`}>
          <div className={`rounded-lg shadow-md p-6 md:p-8 max-w-5xl mx-auto ${isDark ? 'bg-slate-600 border border-slate-500 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
            <h2 className="text-2xl font-bold mb-2">Socratic Chat (Placeholder)</h2>
            <div className="text-sm opacity-80 mb-6">
              Group <b>{group || '—'}</b> · {groupType === 'control' ? 'Control' : 'Experimental'}
            </div>

            <p className={`${isDark ? 'text-slate-200' : 'text-slate-700'} mb-6`}>
              This is a basic placeholder screen for the chat. We’ll plug in the real chat later.
            </p>

            <div className="flex gap-3">
<button
  onClick={() => navigate(-1)}
  className={`px-5 py-2 rounded transition-colors shadow-sm focus:outline-none
              border ${isDark ? 'border-slate-400' : 'border-slate-300'}
              ${isDark
                ? '!bg-slate-700/40 !text-slate-100 hover:!bg-slate-600/40 focus:ring-2 focus:ring-slate-200/30'
                : '!bg-transparent !text-slate-700 hover:bg-slate-100 focus:ring-2 focus:ring-slate-400/40'
              }`}
  style={isDark ? { backgroundColor: 'rgba(51,65,85,0.40)' } : undefined}
>
  Back
</button>


              <button onClick={() => navigate('/simulation/analysis', { state })} className="px-6 py-2 rounded text-white bg-emerald-600 hover:shadow">
                Go to Analysis (temp)
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}
