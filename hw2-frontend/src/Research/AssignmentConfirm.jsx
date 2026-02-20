import React, { useContext, useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';

// 🔹 i18n חדש (מקומי)
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n';

function AssignmentConfirmContent() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  useEffect(() => {
    try {
      const lock = localStorage.getItem("langLock");
      if (lock === "1") {
        localStorage.removeItem("langLock");
        window.dispatchEvent(new Event("lang-lock-change"));
      }
    } catch {}
  }, []);
  const { lang } = useContext(LanguageContext);
  const isRTL = lang === 'he';
  const { t } = useI18n('assignmentConfirm');

  const locationAsg = useLocation().state?.assignment;
  const { student, setStudent } =
    (typeof useStudent === 'function' ? useStudent() : { student: null, setStudent: () => {} });

  const lsAsg = (() => {
    try { return JSON.parse(localStorage.getItem('assignment') || 'null'); } catch { return null; }
  })();
  const assignment = locationAsg || student?.assignment || lsAsg || null;

  // בוחרים את גרסת הסנריו לפי השפה (he/en)
  const selectedScenario = useMemo(() => {
    const sc = assignment?.scenarios;
    if (!sc) return null;
    return lang === 'he' ? (sc.he || sc.en) : (sc.en || sc.he);
  }, [assignment, lang]);

  useEffect(() => {
    if (assignment) {
      const enriched = { ...assignment, scenario: selectedScenario };
      try { localStorage.setItem('assignment', JSON.stringify(enriched)); } catch {}
      const prev = student?.assignment;
      const changed =
        !prev ||
        prev.scenarioId !== enriched.scenarioId ||
        (prev.scenario?.version !== enriched.scenario?.version) ||
        (prev.scenario?.title !== enriched.scenario?.title);
      if (changed) {
        setStudent?.((s) => ({ ...(s || {}), assignment: enriched }));
      }
    }
  }, [assignment, setStudent, student, selectedScenario]);

  // ✅ שומרים על אותו מבנה עיצובי ולוגי
  const anonBadge = useMemo(
    () => (
      <div
        className={`mt-2 inline-flex items-center gap-2 text-xs px-2 py-1 rounded
        ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}
      >
        <span>anonId:</span>
        <code className={`${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
          {student?.anonId || '—'}
        </code>
      </div>
    ),
    [student?.anonId, isDark]
  );

  const Num = ({ n, accent = 'emerald' }) => (
    <div
      className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base
      ${isDark ? `bg-${accent}-700 text-white` : `bg-${accent}-600 text-white`}`}
    >
      {n}
    </div>
  );

return (
  <div
      key={lang}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      style={{ fontFamily: lang === 'he' ? 'Heebo, Rubik, Arial, sans-serif' : 'inherit' }}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
      }`}
  >


      {/* HEADER */}
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      {/* BODY */}
      <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
        <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-4 sm:p-6 md:p-7 rounded`}>
          {/* card */}
          <div
            className={`rounded-lg shadow-md p-4 sm:p-6 md:p-8 ${
              isDark ? 'bg-slate-600 border border-slate-500 text-white' : 'bg-white border border-slate-200 text-slate-800'
            } max-w-7xl mx-auto`}
          >
            {anonBadge}

            {!assignment ? (
              <>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3 mb-2">{t('noAssignmentTitle')}</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6 text-sm sm:text-base`}>
                  {t('noAssignmentBody')}
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold border text-sm
                    ${isDark
                      ? 'border-slate-400 text-white bg-slate-700 hover:shadow'
                      : 'border-slate-300 text-slate-700 bg-white hover:shadow'}`}
                >
                  {t('back')}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold mt-3 mb-3">{t('summaryTitle')}</h2>

                <div
                  className={`rounded-xl border p-4 sm:p-6 mb-6 sm:mb-8 text-sm sm:text-base
                    ${
                      assignment.groupType === 'control'
                        ? (isDark ? 'bg-slate-900/20 border-slate-600' : 'bg-slate-50 border-slate-200')
                        : (isDark ? 'bg-emerald-900/20 border-emerald-600' : 'bg-emerald-50 border-emerald-200')
                    }`}
                >
                  <div className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t('journeyTitle')}</div>

{assignment.groupType !== 'control' ? (
  <div className="space-y-3 sm:space-y-4">
    {[1, 2, 3, 4, 5, 6, 7].map((n) => (

                        <div className="flex gap-2 sm:gap-3" key={n}>
                          <Num n={n} accent="emerald" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold mb-1 text-sm sm:text-base">{t(`step${n}_title_exp`)}</div>
                            <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              {t(`step${n}_body_exp`)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
) : (
  <div className="space-y-3 sm:space-y-4">
    {[1, 2, 3, 4, 5].map((n) => (

                        <div className="flex gap-2 sm:gap-3" key={n}>
                          <Num n={n} accent="slate" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold mb-1 text-sm sm:text-base">{t(`step${n}_title_ctrl`)}</div>
                            <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              {t(`step${n}_body_ctrl`)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={`mt-4 sm:mt-5 pt-3 sm:pt-4 border-t text-xs sm:text-sm ${isDark ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-600'}`}>
                    <b>{t('importantLead')}</b> {t('importantBody')}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className={`w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold border text-sm
                      ${isDark ? 'border-slate-400 text-white bg-slate-700 hover:shadow'
                               : 'border-slate-300 text-slate-700 bg-white hover:shadow'}`}
                  >
                    {t('back')}
                  </button>

                  <button
                    onClick={() => {
                      const enriched = { ...assignment, scenario: selectedScenario };
                      setStudent?.((s) => ({ ...(s || {}), assignment: enriched }));
                      try { localStorage.setItem('assignment', JSON.stringify(enriched)); } catch {}
                      navigate('/validated-questionnaire', { state: { phase: 'pre', fromAssignment: true } });
                    }}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:shadow text-sm"
                  >
                    {t('confirmContinue')}
                  </button>
                </div>
              </>
            )}
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

export default function AssignmentConfirm() {
  return <AssignmentConfirmContent />;
}