import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

// StudentAnswerCard component displays a single student's answer and its SEL analysis.
const StudentAnswerCard = ({ answer, student = {}, isDark }) => {
  const { studentId, answerText, analysisResult, submittedAt } = answer;
  const [fullStudent, setFullStudent] = useState(student);
  const [imageError, setImageError] = useState(false);

  // i18n (אל תעשו return מוקדם בגלל ready)
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('studentAnswerCard');

  // Fetch full student data אם חסר username/תמונה
  useEffect(() => {
    const fetchFullStudentData = async () => {
      const missingUsername = !student.username || student.username === 'Unknown';
      const missingPic = !student.profilePic || student.profilePic === 'default_empty_profile_pic';

      if (missingUsername || missingPic) {
        try {
          const res = await fetch(`/api/students/${studentId}`);
          const data = await res.json();
          if (res.ok && data) {
            setFullStudent({ ...student, ...data });
          }
        } catch (err) {
          console.error('❌ Failed to fetch full student data:', err);
        }
      }
    };

    fetchFullStudentData();
  }, [studentId, student.username, student.profilePic]); // שומר על אותה לוגיקה, רק תלותים מדויקים

  // אם אין ניתוח – לא מציגים כרטיס
  if (!analysisResult) return null;

  const { username, profilePic } = fullStudent;

  // תמונת פרופיל עם fallback
  const getProfileImage = () => {
    const needsDefault = !profilePic || profilePic === 'default_empty_profile_pic' || imageError;

    if (needsDefault) {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    }

    if (profilePic.startsWith('data:image')) return profilePic;

    const separator = profilePic.includes('?') ? '&' : '?';
    return `${profilePic}${separator}t=${new Date().getTime()}`;
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return isDark ? 'text-green-300' : 'text-green-600';
    if (score >= 3.5) return isDark ? 'text-blue-300' : 'text-blue-600';
    if (score >= 2.5) return isDark ? 'text-yellow-300' : 'text-yellow-600';
    return isDark ? 'text-red-300' : 'text-red-600';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 4.5) return isDark ? 'bg-green-800' : 'bg-green-100';
    if (score >= 3.5) return isDark ? 'bg-blue-800' : 'bg-blue-100';
    if (score >= 2.5) return isDark ? 'bg-yellow-800' : 'bg-yellow-100';
    return isDark ? 'bg-red-800' : 'bg-red-100';
  };

  // תאריך לוקלי
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString(lang === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  // כותרות קטגוריות מה־i18n
  const displayNames = {
    selfAwareness: t('selfAwareness'),
    selfManagement: t('selfManagement'),
    socialAwareness: t('socialAwareness'),
    relationshipSkills: t('relationshipSkills'),
    responsibleDecisionMaking: t('responsibleDecisionMaking'),
  };

  const categoryIcons = {
    selfAwareness: '🧠',
    selfManagement: '⚙️',
    socialAwareness: '👥',
    relationshipSkills: '🤝',
    responsibleDecisionMaking: '⚖️',
  };

  // אחוז רוחב הבאר (עם הגנה)
  const pct = (score) => Math.max(0, Math.min(100, (Number(score) / 5) * 100));

  return (
    <div
      className={`mb-6 rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-white text-gray-800'}`}
      dir={dir}
      lang={lang}
    >
      {/* כותרת תלמיד */}
      <div className={`p-4 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-blue-50 border-blue-100'} border-b`}>
        <div className="flex items-center gap-4 mb-3">
          <img
            src={getProfileImage()}
            onError={() => setImageError(true)}
            alt="Profile"
            className="w-12 h-12 rounded-full border object-cover"
          />
          <div>
            <p className="text-base font-semibold">{username || t('unknown', 'Unknown Student')}</p>
            <p className="text-sm text-gray-400">{t('studentId', 'Student ID')}: {studentId}</p>
          </div>
          <div className={`ml-auto px-3 py-1.5 rounded-full ${getScoreBadgeColor(analysisResult.overallScore)} ${getScoreColor(analysisResult.overallScore)} font-bold text-sm`}>
            {t('overallScore')}: {analysisResult.overallScore}
          </div>
        </div>

        {submittedAt && (
          <p className="text-sm mt-1">
            <span role="img" aria-label="time">⏱️</span> {t('submitted')}: {formatDate(submittedAt)}
          </p>
        )}
      </div>

      <div className="p-4">
        {/* תשובה */}
        <div className="mb-5">
          <h4 className="font-bold mb-2 flex items-center gap-2">✍️ {t('answer')}</h4>
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} p-3 rounded-md`}>
            <p className="whitespace-pre-line">{answerText}</p>
          </div>
        </div>

        {/* ניתוח CASEL */}
        <div className="mb-5">
          <h4 className="font-bold mb-3 flex items-center gap-2">📊 {t('caselAnalysis')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(analysisResult)
              .filter(([key]) => Object.keys(displayNames).includes(key))
              .map(([key, val]) => (
                <div key={key} className={`p-3 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-50'} border-l-4 ${getScoreBadgeColor(val.score)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{categoryIcons[key]}</span>
                    <h5 className="font-bold">{displayNames[key]}</h5>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`text-lg font-bold ${getScoreColor(val.score)}`}>{val.score}</div>
                    <div className="w-full bg-gray-300 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          val.score >= 4.5 ? 'bg-green-600'
                          : val.score >= 3.5 ? 'bg-blue-600'
                          : val.score >= 2.5 ? 'bg-yellow-600'
                          : 'bg-red-600'
                        }`}
                        style={{ width: `${pct(val.score)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm">{val.feedback}</p>
                </div>
              ))}
          </div>
        </div>

        {/* חוזקות ושיפור */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-green-50'} p-3 rounded-md`}>
            <h4 className={`${isDark ? 'text-green-300' : 'text-green-800'} font-bold mb-2`}>💪 {t('strengths')}</h4>
            <ul className="list-disc list-inside space-y-1">
              {analysisResult.observedStrengths?.map((s, i) => <li key={i} className="text-sm">{s}</li>)}
            </ul>
          </div>

          <div className={`${isDark ? 'bg-slate-800' : 'bg-yellow-50'} p-3 rounded-md`}>
            <h4 className={`${isDark ? 'text-yellow-300' : 'text-yellow-800'} font-bold mb-2`}>🔍 {t('areasForImprovement')}</h4>
            <ul className="list-disc list-inside space-y-1">
              {analysisResult.areasForImprovement?.map((a, i) => <li key={i} className="text-sm">{a}</li>)}
            </ul>
          </div>
        </div>

        {/* התערבות מומלצת */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-blue-50'} p-3 rounded-md`}>
          <h4 className={`${isDark ? 'text-blue-300' : 'text-blue-800'} font-bold mb-2`}>💡 {t('suggestedIntervention')}</h4>
          <p className="text-sm">{analysisResult.suggestedIntervention}</p>
        </div>

        {/* רמת עומק (אופציונלי) */}
        {analysisResult.estimatedDepthLevel && (
          <p className="text-right text-sm mt-2 text-slate-400">
            {t('depthLevel')}: <strong>{analysisResult.estimatedDepthLevel}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentAnswerCard;
