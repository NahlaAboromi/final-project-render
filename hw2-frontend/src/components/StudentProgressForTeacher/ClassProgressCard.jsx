import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useI18n } from '../../utils/i18n';

const ClassProgressCard = ({ classData, isDark }) => {
  const { t, dir, lang } = useI18n('classProgress');
  const mutedText = isDark ? 'text-gray-300' : 'text-gray-600';

  const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const toFixedSafe = (v, d = 1) => toNum(v).toFixed(d);

  const progressData = (classData?.attempts || []).map((attempt, index) => {
    const dt = attempt?.submittedAt ? new Date(attempt.submittedAt) : null;
    return {
      attempt: `${t('attempt')} ${index + 1}`,
      score: toNum(attempt?.analysisResult?.overallScore),
      date: dt
        ? `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : '—',
    };
  });

  const attempts = Array.isArray(classData?.attempts) ? classData.attempts : [];
  const latestAttempt = attempts.at(-1) || null;
  const firstAttempt  = attempts[0] || null;

  const latestScore = toNum(latestAttempt?.analysisResult?.overallScore);
  const firstScore  = toNum(firstAttempt?.analysisResult?.overallScore);
  const improvement = attempts.length > 1 ? (latestScore - firstScore) : 0;

  const subj = (classData?.subject || '').replace('-', ' ');

  const arrow = lang === 'he' ? '←' : '→';
  const LRM = '\u200E';
  const fmt = (n) => (lang === 'he' ? `${LRM}${toFixedSafe(n, 1)}${LRM}` : toFixedSafe(n, 1));
  const firstLastLine =
    lang === 'he'
      ? `${fmt(latestScore)} ${arrow} ${fmt(firstScore)}`
      : `${fmt(firstScore)} ${arrow} ${fmt(latestScore)}`;

  return (
    <div dir={dir} lang={lang} className={`${isDark ? 'bg-slate-700' : 'bg-white'} p-4 sm:p-6 rounded-lg shadow-md`}>
      {/* כותרת הקורס */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-0">
        <div className="flex items-center">
          <div className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} text-lg sm:text-xl`}>📘</div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold truncate">{classData?.className || '—'}</h2>
            <p className={`text-xs sm:text-sm capitalize ${mutedText}`}>
              {subj || '—'}
            </p>
          </div>
        </div>

        <div className={`${dir === 'rtl' ? 'text-right sm:text-left' : 'text-left sm:text-right'} text-xs sm:text-sm`}>
          <div className="text-xs sm:text-sm font-semibold text-blue-600 mb-1">
            {lang === 'he' ? 'ציון ראשון ← אחרון' : t('firstToLast')}
          </div>
          <div className="text-base sm:text-lg text-blue-700 font-bold">
            {firstLastLine}
          </div>
          {attempts.length > 1 && improvement !== 0 && (
            <div className={`text-xs sm:text-sm mt-1 ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement > 0 ? '+' : ''}{toFixedSafe(improvement, 1)} {t('improvement')}
            </div>
          )}
        </div>
      </div>

      {/* גרף התקדמות או טקסט אם יש רק ניסיון אחד */}
      {attempts.length > 1 ? (
        <div className="mb-3 sm:mb-4">
          <h3 className={`text-sm sm:text-md font-medium mb-2 flex items-center ${mutedText}`}>
            <span className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}>📈</span>
            {t('progressOverTime')}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mb-3 sm:mb-4 flex justify-center">
          <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800">
            📘 {t('noChart')}
          </span>
        </div>
      )}

      {/* תיאור מובהק */}
      <div className="mb-2 mt-1 text-center text-xs italic text-gray-400">
        {t('basedOnLatest')}
      </div>

      {/* תצוגת CASEL - גריד רספונסיבי */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-center text-xs sm:text-sm">
        {[
          { label: t('selfAwareness'),           color: 'blue-600',   key: 'selfAwareness' },
          { label: t('selfManagement'),          color: 'green-600',  key: 'selfManagement' },
          { label: t('socialAwareness'),         color: 'purple-600', key: 'socialAwareness' },
          { label: t('relationshipSkills'),      color: 'orange-600', key: 'relationshipSkills' },
          { label: t('decisionMakingShort'),     color: 'red-600',    key: 'responsibleDecisionMaking' },
        ].map(({ label, color, key }) => (
          <div key={key} className="last:col-span-2 sm:last:col-span-1">
            <div className={`text-base sm:text-lg font-semibold text-${color}`}>
              {toFixedSafe(latestAttempt?.analysisResult?.[key]?.score, 1)}
            </div>
            <div className={`${mutedText} leading-tight`}>{label}</div>
          </div>
        ))}
      </div>

      {/* רמת עומק ותאריך */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 gap-2 sm:gap-0">
        <div className={`flex items-center flex-wrap gap-2 sm:gap-4 ${dir === 'rtl' ? 'space-x-reverse' : ''}`}>
          {(() => {
            const level = latestAttempt?.analysisResult?.estimatedDepthLevel || t('unknown');
            const cls =
              String(level).includes('Advanced') ? 'bg-green-100 text-green-800' :
              String(level).includes('Intermediate') ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800';
            return <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${cls}`}>{level}</span>;
          })()}
          <span className={`text-xs sm:text-sm flex items-center ${mutedText}`}>
            <span className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'}`}>📅</span>
            <span className="whitespace-nowrap">
              {latestAttempt?.submittedAt
                ? new Date(latestAttempt.submittedAt).toLocaleString([], {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                : '—'}
            </span>
          </span>
        </div>

        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto sm:ml-4">
          {attempts.length} {attempts.length > 1 ? t('attemptsMany') : t('attemptsOne')}
        </span>
      </div>
    </div>
  );
};

export default ClassProgressCard;