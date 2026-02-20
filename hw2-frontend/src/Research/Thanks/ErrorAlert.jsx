// src/Research/ErrorAlert.jsx
import React from 'react';

export default function ErrorAlert({ error, isDark }) {
  if (!error) return null;

  return (
    <div className={`mb-8 rounded-2xl border-2 p-6 text-center ${
      isDark ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-red-50 border-red-300 text-red-800'
    }`}>
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">⚠️</span>
        <span className="font-medium">{error}</span>
      </div>
    </div>
  );
}