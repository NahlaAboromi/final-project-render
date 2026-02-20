// File: src/studentPages/SessionTimer.jsx
import React, { useEffect, useState } from 'react';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';

function formatHMS(totalSecs) {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const hh = h > 0 ? String(h).padStart(2, '0') + ':' : '';
  return `${hh}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function SessionTimer() {
  const { sessionStart } = useStudent();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!sessionStart) return;
    const tick = () => setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionStart]);

  if (!sessionStart) return null;

  return (
    <div
      className="px-3 py-1 rounded-full border border-slate-300 bg-slate-100 text-slate-800 text-sm font-medium flex items-center gap-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      title="Time since login"
      aria-label="Session timer"
    >
      <svg
        className="shrink-0"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {formatHMS(elapsed)}
    </div>
  );
}
