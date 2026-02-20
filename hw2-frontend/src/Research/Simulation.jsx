// src/Research/Simulation.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';
import { useI18n } from '../utils/i18n';

// 🔹 פונקציה שמתחילה trial ושומרת זמן התחלה בלוקאל
async function startTrial(anonId) {
  try {
    const res = await fetch('/api/trial/start', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonId }),
    });
    const data = await res.json().catch(() => ({}));
    localStorage.setItem('simStartAtISO', (data?.startedAt) || new Date().toISOString());
  } catch (e) {
    console.warn('[startTrial] failed, fallback to now:', e);
    localStorage.setItem('simStartAtISO', new Date().toISOString());
  }
}

// 🧩 helpers
function readLS(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function getUILang(fallback = 'he') {
  try {
    const ls = localStorage.getItem('lang');
    return (ls === 'he' || ls === 'en') ? ls : fallback;
  } catch { return fallback; }
}

function pickScenarioFromAssignment(asg, lang) {
  if (!asg) return null;
  const code = (lang === 'he') ? 'he' : 'en';
  const v = asg?.scenarios?.[code];
  if (!v) return null;
  return {
    scenarioId: asg.scenarioId || v.scenarioId,
    assignedGroupType: v.assignedGroupType ?? asg.groupType,
    selTags: Array.isArray(v.selTags) ? v.selTags : (asg.selTags || []),
    title: v.title ?? asg.title,
    text: v.text ?? asg.text,
    reflection: Array.isArray(v.reflection) ? v.reflection : (asg.reflection || []),
    version: v.version || asg.version || 'v1',
    scenarios: asg.scenarios, 
  };
}

function pickScenarioByLang(scn, lang) {
  if (!scn) return scn;
  const code = (lang === 'he') ? 'he' : 'en';
  const variant = scn?.scenarios?.[code];
  if (variant) {
    return {
      scenarioId: scn.scenarioId || variant.scenarioId,
      assignedGroupType: variant.assignedGroupType ?? scn.assignedGroupType,
      selTags: variant.selTags ?? scn.selTags,
      title: variant.title ?? scn.title,
      text: variant.text ?? scn.text,
      reflection: Array.isArray(variant.reflection) ? variant.reflection : scn.reflection || [],
      version: scn.version || variant.version || 'v1',
      scenarios: scn.scenarios,
    };
  }
  return scn;
}

const DBG = (...args) => console.log('[Simulation]', ...args);

function dumpScenario(label, scn) {
  try {
    console.log(
      `[${label}]`,
      {
        _lang: scn?._lang,
        scenarioId: scn?.scenarioId,
        title: scn?.title,
        textSnippet: (scn?.text || '').slice(0, 60),
        reflectionCount: Array.isArray(scn?.reflection) ? scn.reflection.length : 0,
        hasMap: !!(scn?.scenarios && Object.keys(scn.scenarios || {}).length),
        mapKeys: scn?.scenarios ? Object.keys(scn.scenarios) : [],
      }
    );
  } catch (e) {
    console.warn('[dumpScenario] failed:', e);
  }
}

function SimulationContent() {
  const navigate = useNavigate();
  const { scenarioId: paramScenarioId } = useParams();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { student } = useStudent?.() || { student: null };
  const navState = useLocation().state;

  useEffect(() => {
    try {
      const lock = localStorage.getItem("langLock");
      if (lock === "1") {
        localStorage.removeItem("langLock");
        window.dispatchEvent(new Event("lang-lock-change"));
        console.log("Language lock removed on this page");
      }
    } catch (e) {
      console.warn("Failed to clear langLock:", e);
    }
  }, []);

  const { t, dir, lang } = useI18n('simulation');

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [trial, setTrial] = useState(null);
  const [freeAnswer, setFreeAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewStartAt, setViewStartAt] = useState(null);

  // 🔹 טיימר
// 🔹 טיימר – נעצר כשsubmitting=true
function useElapsedTimer(startedAt, isRunning = true) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    // אם אין זמן התחלה או שהטיימר לא אמור לרוץ – לא מפעילים interval
    if (!startedAt || !isRunning) return;

    const startTime = new Date(startedAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsed(diffSec);
    }, 1000);

    // ניקוי כשעוזבים דף / משנים isRunning / startedAt
    return () => clearInterval(interval);
  }, [startedAt, isRunning]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return { mm, ss };
}

// ⬅️ כאן שינוי הקריאה
const { mm, ss } = useElapsedTimer(viewStartAt, !submitting);


  useEffect(() => {
    if (!student?.anonId) return;
    const startedKey = `trialStartedFor:${student.anonId}`;
    if (localStorage.getItem(startedKey) === '1') return;
    localStorage.setItem(startedKey, '1');
    startTrial(student.anonId);
  }, [student?.anonId]);

  useEffect(() => {
    if (!trial) {
      DBG('[lang-effect] no trial yet → return');
      return;
    }

    const uiLang = (lang === 'he' || lang === 'en') ? lang : getUILang('he');
    const code = uiLang === 'he' ? 'he' : 'en';
    DBG('[lang-effect] triggered with', { langProp: lang, uiLang, code });

    const asg = readLS('assignment', null);
    DBG('[lang-effect] LS assignment present?', !!asg, { keys: asg ? Object.keys(asg || {}) : [] });

    let candidate = null;
    if (asg?.scenarios?.[code]) {
      const v = pickScenarioFromAssignment(asg, uiLang);
      if (v) {
        candidate = { ...v, scenarios: asg.scenarios };
        dumpScenario('CANDIDATE-from-LS', candidate);
      } else {
        DBG('[lang-effect] pickScenarioFromAssignment returned null for', uiLang);
      }
    } else {
      DBG('[lang-effect] LS has no scenarios for', code, { scenariosKeys: asg?.scenarios ? Object.keys(asg.scenarios) : [] });
    }

    if (!candidate) {
      candidate = pickScenarioByLang(trial.scenario, uiLang);
      dumpScenario('CANDIDATE-from-trialMap', candidate);
    }

    if (!candidate) {
      DBG('[lang-effect] no candidate → return');
      return;
    }

    const cur = trial.scenario || {};
    dumpScenario('CURRENT', cur);

    const sameTitle = cur.title === candidate.title;
    const sameText  = cur.text  === candidate.text;
    const sameRefl  =
      Array.isArray(cur.reflection) && Array.isArray(candidate.reflection) &&
      cur.reflection.join('||') === candidate.reflection.join('||');

    DBG('[lang-effect] compare', { sameTitle, sameText, sameRefl, curLang: cur._lang, uiLang });

    if (cur._lang === uiLang && sameTitle && sameText && sameRefl) {
      DBG('[lang-effect] _lang AND content identical → no update');
      return;
    }

    DBG('[lang-effect] setTrial → apply candidate with _lang', uiLang);
    setTrial(prev =>
      prev ? { ...prev, scenario: { ...candidate, _lang: uiLang } } : prev
    );
  }, [lang, trial?.scenario?.scenarios]);

  useEffect(() => {
    const isoNow = new Date().toISOString();
    setViewStartAt(isoNow);
    try { localStorage.setItem('simViewStartAtISO', isoNow); } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        setLoading(true);
        setErr('');

        if (navState?.group && navState?.scenario) {
          const tTrial = {
            group: navState.group,
            groupType: navState.groupType,
            scenarioId: navState.scenarioId || paramScenarioId,
            scenario: {
              ...pickScenarioByLang(navState.scenario, lang),
              scenarios: navState.scenario?.scenarios || navState?.scenarios || {},
              _lang: (lang === 'he' || lang === 'en') ? lang : 'he',
            },
            startedAt: navState.startedAt,
          };
          if (!cancelled) {
            setTrial(tTrial);
            setFreeAnswer('');
            setLoading(false);
          }
          return;
        }

        const lsAsg = readLS('assignment', null);
        if (lsAsg) {
          const variant = pickScenarioFromAssignment(lsAsg, lang);
          if (variant) {
            const tTrial = {
              group: lsAsg.group,
              groupType: lsAsg.groupType || lsAsg.assignedGroupType || 'control',
              scenarioId: lsAsg.scenarioId,
              scenario: {
                ...variant,
                scenarios: lsAsg.scenarios || {},
                _lang: (lang === 'he' || lang === 'en') ? lang : 'he',
              },
              startedAt: readLS('simStartAtISO', null) || null,
            };
            if (!cancelled) {
              setTrial(tTrial);
              setFreeAnswer('');
              setLoading(false);
            }
            return;
          }
        }

        if (!student?.anonId) {
          throw new Error('Missing anonId. Please restart the study flow.');
        }
        const res = await fetch(`/api/trial/${student.anonId}?lang=${encodeURIComponent(lang || 'en')}`);
        if (!res.ok) throw new Error('Failed to load trial');
        const data = await res.json();
        const picked = pickScenarioByLang(data.scenario, lang);
        if (!cancelled) {
          const tTrial = {
            group: data.group,
            groupType: data.groupType,
            scenarioId: data.scenarioId,
            scenario: {
              ...picked,
              scenarios: data.scenario?.scenarios || picked.scenarios,
              _lang: (lang === 'he' || lang === 'en') ? lang : 'he',
            },
            startedAt: data.startedAt,
          };
          setTrial(tTrial);
          setFreeAnswer('');
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || 'Init error');
          setLoading(false);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, [student?.anonId, paramScenarioId, navState, lang]);

  useEffect(() => {
    if (!trial) return;
    if (!trial.startedAt) {
      const lsStart = localStorage.getItem('simStartAtISO');
      const iso = lsStart || new Date().toISOString();
      setTrial(prev => prev ? { ...prev, startedAt: iso } : prev);
    }
  }, [trial]);

  const anonBadge = useMemo(() => (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs px-2 py-1 rounded
      ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
      <span className="hidden sm:inline">anonId:</span>
      <code className={`${isDark ? 'text-emerald-300' : 'text-emerald-700'} truncate max-w-[60px] sm:max-w-none`}>
        {student?.anonId || '—'}
      </code>
    </div>
  ), [student?.anonId, isDark]);

  if (loading) {
    return (
      <div className={`min-h-screen w-screen ${isDark?'bg-slate-800 text-white':'bg-slate-100 text-slate-800'}`} dir={dir}>
        <div className="px-3 sm:px-4 pt-3 sm:pt-4"><AnonymousHeader /></div>
        <div className="p-6 sm:p-8 text-center">{t('loading')}</div>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4"><Footer /></div>
      </div>
    );
  }

  if (err || !trial) {
    return (
      <div className={`min-h-screen w-screen ${isDark?'bg-slate-800 text-white':'bg-slate-100 text-slate-800'}`} dir={dir}>
        <div className="px-3 sm:px-4 pt-3 sm:pt-4"><AnonymousHeader /></div>
        <div className="p-4 sm:p-6 md:p-8">
          <div className={`max-w-3xl mx-auto rounded-lg p-4 sm:p-6 ${isDark?'bg-red-900/20':'bg-red-50'} border ${isDark?'border-red-800':'border-red-200'}`}>
            <div className="font-semibold mb-2 text-sm sm:text-base">{t('loadFailTitle')}</div>
            <div className="text-xs sm:text-sm opacity-80">{err || 'Unknown error'}</div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`mt-4 px-4 sm:px-5 py-2 rounded text-sm sm:text-base border transition-colors
                ${isDark
                  ? 'bg-slate-700 text-slate-100 border-slate-500 hover:bg-slate-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              {t('loadFailBack')}
            </button>
          </div>
        </div>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4"><Footer /></div>
      </div>
    );
  }

  const { group, groupType, scenario } = trial;
  const reflections = Array.isArray(scenario?.reflection) ? scenario.reflection : [];

  const onSubmit = async () => {
    try {
      if (!student?.anonId) {
        alert('Missing student ID.');
        return;
      }
      setSubmitting(true);

      const payload = { answers: [freeAnswer?.trim() || ''] };

      const response1 = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId: student.anonId,
          situation: scenario?.text || '',
          question: reflections.join(' ') || '',
          answerText: freeAnswer?.trim() || '',
        }),
      });

      const data1 = await response1.json();
      if (!response1.ok) {
        throw new Error(data1?.message || 'AI analysis failed');
      }
      console.log('✅ AI analysis result:', data1.analysisResult);

      await fetch('/api/trial/finish', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId: student.anonId,
          answers: payload.answers,
        }),
      });

      const g = String(trial?.group || '').toUpperCase();
      const showSocratic = ['A', 'B', 'C'].includes(g);

      navigate('/simulation/analysis', {
        state: { anonId: student.anonId, showSocratic },
      });
    } catch (err) {
      console.error('finish error', err);
      alert('Failed to submit simulation.');
    } finally {
      setSubmitting(false);
    }
  };

  const isContinueDisabled = submitting || freeAnswer.trim().length === 0;

 return (
  <div
    className={`flex flex-col min-h-screen w-screen ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}
    dir={dir}
    style={{ fontFamily: 'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
  >

      {/* Header */}
      <div className="px-3 sm:px-4 mt-3 sm:mt-4">
        <AnonymousHeader />
      </div>

      {/* Main */}
      <main className="flex-1 w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* כרטיס ראשי */}
          <div className={`rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden ${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white border border-blue-100'}`}>
            
            {/* כותרת עליונה */}
            <div className={`px-3 sm:px-6 md:px-8 py-2 sm:py-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} relative`}>
              {/* טיימר - תמיד בימין */}
              {viewStartAt && (
                <div className={`absolute top-2 ${dir === 'rtl' ? 'left-2 sm:left-4' : 'right-2 sm:right-4'} flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full shadow-md sm:shadow-lg text-xs sm:text-sm ${isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
                  <span className="text-sm sm:text-base">⏱</span>
                  <span className="font-bold tabular-nums">{mm}:{ss}</span>
                </div>
              )}
              
              {/* anonId - תמיד בשמאל */}
              <div className={`absolute top-2 ${dir === 'rtl' ? 'right-2 sm:right-4' : 'left-2 sm:left-4'}`}>
                {anonBadge}
              </div>
              
              {/* כותרת במרכז */}
              <div className="flex items-center justify-center gap-2 pt-8 sm:pt-6">
                <div className={`text-lg sm:text-xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  🎯
                </div>
                <h1 className={`text-base sm:text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {t('headerTitle')}
                </h1>
              </div>
            </div>

            {/* תוכן הסימולציה */}
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
              {/* הוראות */}
              <div className={`mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-center text-xs sm:text-sm md:text-base leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {t('instructionsText')}
                </p>
              </div>

              {/* כרטיס מצב */}
              <div className={`mb-4 sm:mb-5 md:mb-6 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl ${isDark ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'}`}>
                <h2 className={`text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  <span className="text-xl sm:text-2xl">📋</span>
                  {t('situationTitle')}
                </h2>
                <div className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {scenario?.text}
                </div>
              </div>

              {/* שאלות רפלקציה */}
              {reflections.length > 0 && (
                <div className={`mb-4 sm:mb-5 md:mb-6 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl ${isDark ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-800/30' : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'}`}>
                  <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    <span className="text-xl sm:text-2xl">❓</span>
                    {t('questionTitle')}
                  </h3>
                  <div className={`${dir === 'rtl' ? 'me-4 sm:me-6' : 'ms-4 sm:ms-6'} space-y-2 sm:space-y-3`}>
                    {reflections.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 sm:gap-3">
                        <span className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${isDark ? 'bg-purple-700 text-white' : 'bg-purple-200 text-purple-700'}`}>
                          {i + 1}
                        </span>
                        <p className={`text-xs sm:text-sm md:text-base leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* שדה תשובה */}
              <div className="mb-4 sm:mb-5 md:mb-6">
                <label className={`block text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <span className="text-base sm:text-xl">✍️</span>
                  {reflections.length > 0 ? t('writeCombined') : t('yourResponse')}
                </label>
                <textarea
                  className={`w-full min-h-[160px] sm:min-h-[200px] rounded-lg sm:rounded-xl border-2 p-3 sm:p-4 text-sm sm:text-base transition-all focus:ring-4 ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-slate-400' 
                      : 'bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800 placeholder-slate-400'
                  }`}
                  value={freeAnswer}
                  onChange={(e) => setFreeAnswer(e.target.value)}
                  placeholder={reflections.length > 0 ? t('placeholderCombined') : t('placeholderSingle')}
                />
              </div>

              {/* כפתורים */}
              <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all border-2 ${
                    isDark
                      ? 'bg-slate-700 text-slate-100 border-slate-600 hover:bg-slate-600 hover:shadow-lg disabled:opacity-50'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:shadow-lg disabled:opacity-50'
                  }`}
                  disabled={submitting}
                >
                  {t('back')}
                </button>

                <button
                  onClick={onSubmit}
                  className={`flex-1 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold text-white transition-all shadow-lg ${
                    isContinueDisabled
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform active:scale-[0.98] sm:hover:scale-[1.02]'
                  } flex items-center justify-center gap-2 sm:gap-3`}
                  disabled={isContinueDisabled}
                  aria-busy={submitting ? 'true' : 'false'}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        role="status"
                        aria-label="Loading"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <span>{t('continue')}</span>
                      <span className="text-lg sm:text-xl">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function Simulation() {
  const outer = useContext(ThemeContext);
  return (
    <ThemeContext.Provider value={outer}>
      <SimulationContent />
    </ThemeContext.Provider>
  );
}