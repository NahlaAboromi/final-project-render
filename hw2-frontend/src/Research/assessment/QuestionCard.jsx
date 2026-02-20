// src/studentPages/assessment/QuestionCard.jsx
import React, { useContext } from 'react';             // ✅ צריך להוסיף useContext כאן
import { LanguageContext } from '../../context/LanguageContext';

export default function QuestionCard({ question, CATEGORIES }) {
  // הגנה: אם אין שאלה עדיין – מציגים שלד קל
  if (!question) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-xl" />
        <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  const catMeta = CATEGORIES[question.category] || {};
  const Icon = catMeta.icon || (() => null);
  const { lang } = useContext(LanguageContext);        // ✅ זה במקום הנכון עכשיו

  return (
    <>
      <div
        className={`inline-flex items-center ${
          lang === 'he' ? 'flex-row-reverse gap-3' : 'space-x-3'
        } px-5 py-3 rounded-xl ${catMeta.bgColor} border-2 ${
          catMeta.borderColor
        } mb-8 shadow-sm`}
      >
{lang === 'he' ? (
  <>
    <span className="font-bold text-slate-700">{question.category || '—'}</span>
    <div className={`w-10 h-10 bg-gradient-to-br ${catMeta.color} rounded-lg flex items-center justify-center`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </>
) : (
  <>
    <div className={`w-10 h-10 bg-gradient-to-br ${catMeta.color} rounded-lg flex items-center justify-center`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="font-bold text-slate-700">{question.category || '—'}</span>
  </>
)}

      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-12 leading-relaxed">
        {question.text || ''}
      </h2>
    </>
  );
}
