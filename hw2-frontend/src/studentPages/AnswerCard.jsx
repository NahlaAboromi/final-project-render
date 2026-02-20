// src/StudentAnswerCard.jsx
import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n';

const StudentAnswerCard = ({ answer, isDark }) => {
  const { answerText, analysisResult, submittedAt } = answer || {};
  const { lang: ctxLang } = useContext(LanguageContext);
  const { t, dir, lang, ready } = useI18n('studentAnswerCard');
  
  if (!analysisResult || !ready) return null;

  // ========= NORMALIZATION =========
  const AR = {
    overallScore: Number(analysisResult.overallScore ?? analysisResult['Overall score'] ?? 0),
    observedStrengths: analysisResult.observedStrengths ?? analysisResult['Observed strengths'] ?? [],
    areasForImprovement: analysisResult.areasForImprovement ?? analysisResult['Areas for improvement'] ?? [],
    suggestedIntervention: analysisResult.suggestedIntervention ?? analysisResult['Suggested intervention'] ?? '',
    estimatedDepthLevel: analysisResult.estimatedDepthLevel ?? analysisResult['Estimated depth level'] ?? ''
  };

  const CAT = {
    selfAwareness: analysisResult.selfAwareness ?? analysisResult.self_awareness,
    selfManagement: analysisResult.selfManagement ?? analysisResult.self_management,
    socialAwareness: analysisResult.socialAwareness ?? analysisResult.social_awareness,
    relationshipSkills: analysisResult.relationshipSkills ?? analysisResult.relationship_skills,
    responsibleDecisionMaking: analysisResult.responsibleDecisionMaking ?? analysisResult.responsible_decision_making
  };
  // =================================

  // ------- UI helpers -------
  const getScoreColor = (score = 0) => {
    if (score >= 4.5) return isDark ? 'text-green-300' : 'text-green-600';
    if (score >= 3.5) return isDark ? 'text-blue-300' : 'text-blue-600';
    if (score >= 2.5) return isDark ? 'text-yellow-300' : 'text-yellow-600';
    return isDark ? 'text-red-300' : 'text-red-600';
  };

  const getScoreBadgeColor = (score = 0) => {
    if (score >= 4.5) return isDark ? 'bg-green-800' : 'bg-green-100';
    if (score >= 3.5) return isDark ? 'bg-blue-800' : 'bg-blue-100';
    if (score >= 2.5) return isDark ? 'bg-yellow-800' : 'bg-yellow-100';
    return isDark ? 'bg-red-800' : 'bg-red-100';
  };

  const barColor = (score = 0) =>
    score >= 4.5 ? 'bg-green-600' : score >= 3.5 ? 'bg-blue-600' :
    score >= 2.5 ? 'bg-yellow-600' : 'bg-red-600';

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString(lang === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });

  const categoryIcons = {
    selfAwareness: '🌟',
    selfManagement: '🧘',
    socialAwareness: '👥',
    relationshipSkills: '🤝',
    responsibleDecisionMaking: '🧠'
  };

  return (
    <main className="flex-1 w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <div 
        dir={dir} 
        lang={lang} 
        className="bg-slate-100 text-black dark:bg-slate-800 dark:text-white p-3 sm:p-4 md:p-6 rounded-lg"
      >
        <div className="bg-white dark:bg-slate-600 p-3 sm:p-4 md:p-5 rounded-lg shadow-md mb-4 sm:mb-6">
          
          {/* Header: Score + Date */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-500">
            <div
              className={`px-3 py-1.5 rounded-full ${getScoreBadgeColor(AR.overallScore)} ${getScoreColor(AR.overallScore)} font-bold text-xs sm:text-sm w-fit`}
            >
              {t('overallScore')}: {AR.overallScore}
            </div>

            {submittedAt && (
              <p className="text-xs sm:text-sm">
                <span role="img" aria-label="time">⏱️</span>{' '}
                {t('submitted')}: {formatDate(submittedAt)}
              </p>
            )}
          </div>

          {/* Main content */}
          <div className="space-y-4 sm:space-y-5">
            
            {/* Answer Section */}
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-2 flex items-center gap-2">
                <span role="img" aria-label="pencil">✍️</span> {t('answer')}:
              </h4>
              <div className="p-3 sm:p-4 md:p-6 rounded-md bg-slate-100 text-black dark:bg-slate-800 dark:text-white">
                <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">{answerText}</p>
              </div>
            </div>

            {/* CASEL Categories */}
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2">
                <span role="img" aria-label="analysis">📊</span> {t('caselAnalysis')}:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {Object.entries(CAT)
                  .filter(([_, v]) => v)
                  .map(([key, val]) => {
                    const score = Number(val?.score ?? 0);
                    const feedback = val?.feedback ?? '';
                    return (
                      <div
                        key={key}
                        className={`p-3 sm:p-4 rounded-md bg-slate-100 text-black dark:bg-slate-800 dark:text-white ${dir === 'rtl' ? 'border-r-4' : 'border-l-4'} ${getScoreBadgeColor(score)}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span role="img" aria-label={key} className="text-base sm:text-lg">
                            {categoryIcons[key]}
                          </span>
                          <h5 className="font-bold text-xs sm:text-sm">{t(key)}</h5>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className={`text-base sm:text-lg font-bold ${getScoreColor(score)} min-w-[2rem]`}>
                            {score}
                          </div>
                          <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${barColor(score)} transition-all`}
                              style={{ width: `${Math.max(0, Math.min(100, (score / 5) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed">{feedback}</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Strengths & Areas for Improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-md bg-green-200 text-black dark:bg-green-800 dark:text-white">
                <h4 className="font-bold text-sm sm:text-base mb-2 flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span role="img" aria-label="strength">💪</span> {t('strengths')}:
                </h4>
                <ul className={`list-disc ${dir === 'rtl' ? 'list-inside text-right pr-2' : 'list-inside text-left pl-2'} space-y-1`}>
                  {AR.observedStrengths.map((s, i) => (
                    <li key={i} className="text-xs sm:text-sm leading-relaxed break-words">{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 sm:p-4 rounded-md bg-yellow-200 text-black dark:bg-yellow-800 dark:text-white">
                <h4 className="font-bold text-sm sm:text-base mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <span role="img" aria-label="improvement">🔍</span> {t('areasForImprovement')}:
                </h4>
                <ul className={`list-disc ${dir === 'rtl' ? 'list-inside text-right pr-2' : 'list-inside text-left pl-2'} space-y-1`}>
                  {AR.areasForImprovement.map((a, i) => (
                    <li key={i} className="text-xs sm:text-sm leading-relaxed break-words">{a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggested Intervention */}
            <div className="p-3 sm:p-4 rounded-md bg-blue-200 text-black dark:bg-blue-800 dark:text-white">
              <h4 className="font-bold text-sm sm:text-base mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <span role="img" aria-label="lightbulb">💡</span> {t('suggestedIntervention')}:
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed">{AR.suggestedIntervention}</p>
            </div>

            {/* Depth Level */}
            {AR.estimatedDepthLevel && (
              <div className={`${dir === 'rtl' ? 'text-left' : 'text-right'} text-xs sm:text-sm`}>
                <span className="opacity-75">{t('depthLevel')}:</span>{' '}
                <span className="font-semibold">{AR.estimatedDepthLevel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentAnswerCard;