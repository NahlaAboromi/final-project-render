// utils/i18n.js
const cache = {};

export async function loadDict(ns, lang) {
  const key = `${ns}:${lang}`;
  if (cache[key]) return cache[key];
  let mod;
  switch (ns) {
     case 'teacherHeader':
      mod = lang === 'he'
        ? await import('../i18n/teacherHeader.he.json')
        : await import('../i18n/teacherHeader.en.json');
      break;
    case 'anonymousHeader':
      mod = lang === 'he'
        ? await import('../i18n/anonymousHeader.he.json')
        : await import('../i18n/anonymousHeader.en.json');
      break;
    case 'homepage':
      mod = lang === 'he'
        ? await import('../i18n/homepage.he.json')
        : await import('../i18n/homepage.en.json');
      break;
      case 'teacherLogin':
  mod = lang === 'he'
    ? await import('../i18n/teacherLogin.he.json')
    : await import('../i18n/teacherLogin.en.json');
  break;
    case 'anonymousStart':
      mod = lang === 'he'
        ? await import('../i18n/anonymousStart.he.json')
        : await import('../i18n/anonymousStart.en.json');
      break;
    case 'questionnaireIntro':
  mod = lang === 'he'
    ? await import('../i18n/questionnaireIntro.he.json')
    : await import('../i18n/questionnaireIntro.en.json');
  break;
  case 'verifyCode':
  mod = lang === 'he'
    ? await import('../i18n/verifyCode.he.json')
    : await import('../i18n/verifyCode.en.json');
  break;
  case 'resetPassword':
  mod = lang === 'he'
    ? await import('../i18n/resetPassword.he.json')
    : await import('../i18n/resetPassword.en.json');
  break;
case 'register':
  mod = lang === 'he'
    ? await import('../i18n/register.he.json')
    : await import('../i18n/register.en.json');
  break;
  case 'forgotPassword':
  mod = lang === 'he'
    ? await import('../i18n/forgotPassword.he.json')
    : await import('../i18n/forgotPassword.en.json');
  break;
case 'ueqQuestionnaire':
  mod = lang === 'he'
    ? await import('../i18n/ueq.s.v1.he.json')
    : await import('../i18n/ueq.s.v1.en.json');
  break;

case 'resultsView':
  mod = lang === 'he'
    ? await import('../i18n/resultsView.he.json')
    : await import('../i18n/resultsView.en.json');
  break;
case 'assessment':
  mod = lang === 'he'
    ? await import('../i18n/assessment.he.json')
    : await import('../i18n/assessment.en.json');
  break;
case 'logoutThanksModal':
  mod = lang === 'he'
    ? await import('../i18n/logoutThanksModal.he.json')
    : await import('../i18n/logoutThanksModal.en.json');
  break;
case 'progressBar':
  mod = lang === 'he'
    ? await import('../i18n/progressBar.he.json')
    : await import('../i18n/progressBar.en.json');
  break;
  case 'studentAnswerCard':
  mod = lang === 'he'
    ? await import('../i18n/studentAnswerCard.he.json')
    : await import('../i18n/studentAnswerCard.en.json');
  break;
  case 'socraticReflectionFeedback':
  mod = lang === 'he'
    ? await import('../i18n/socraticReflectionFeedback.he.json')
    : await import('../i18n/socraticReflectionFeedback.en.json');
  break;
  case 'thanks':
  mod = lang === 'he'
    ? await import('../i18n/thanks.he.json')
    : await import('../i18n/thanks.en.json');
  break;
  case 'classDetails':
  mod = lang === 'he'
    ? await import('../i18n/classDetails.he.json')
    : await import('../i18n/classDetails.en.json');
  break;
case 'classManager':
  mod = lang === 'he'
    ? await import('../i18n/classManager.he.json')
    : await import('../i18n/classManager.en.json');
  break;

  // בתוך switch (ns)
case 'socraticCoach':
  mod = lang === 'he'
    ? await import('../i18n/socraticCoach.he.json')
    : await import('../i18n/socraticCoach.en.json');
  break;
case 'dashboardOverview':
  mod = lang === 'he'
    ? await import('../i18n/dashboardOverview.he.json')
    : await import('../i18n/dashboardOverview.en.json');
  break;
  // בתוך loadDict(...)
case 'simulation':
  mod = lang === 'he'
    ? await import('../i18n/simulation.he.json')
    : await import('../i18n/simulation.en.json');
  break;
case 'finalSummary':
  mod = lang === 'he'
    ? await import('../i18n/finalSummary.he.json')
    : await import('../i18n/finalSummary.en.json');
  break;
case 'anonymousSimulationResult':
  mod = lang === 'he'
    ? await import('../i18n/anonymousSimulationResult.he.json')
    : await import('../i18n/anonymousSimulationResult.en.json');
  break;
    case 'assignmentConfirm':   // ✅ הוספת שפה למסך AssignConfirm
      mod = lang === 'he'
        ? await import('../i18n/assignmentConfirm.he.json')
        : await import('../i18n/assignmentConfirm.en.json');
      break;
      case 'classForm':
  mod = lang === 'he'
    ? await import('../i18n/classForm.he.json')
    : await import('../i18n/classForm.en.json');
  break;

      case 'quickActions':
  mod = lang === 'he'
    ? await import('../i18n/quickActions.he.json')
    : await import('../i18n/quickActions.en.json');
  break;
case 'teacherDashboard':
  mod = lang === 'he'
    ? await import('../i18n/teacherDashboard.he.json')
    : await import('../i18n/teacherDashboard.en.json');
  break;
case 'createClass':
  mod = lang === 'he'
    ? await import('../i18n/createClass.he.json')
    : await import('../i18n/createClass.en.json');
  break;
  case 'classProgress':
  mod = lang === 'he'
    ? await import('../i18n/classProgress.he.json')
    : await import('../i18n/classProgress.en.json');
  break;
  case 'studentOverview':
  mod = lang === 'he'
    ? await import('../i18n/studentOverview.he.json')
    : await import('../i18n/studentOverview.en.json');
  break;
case 'aiChat':
  mod = lang === 'he'
    ? await import('../i18n/aiChat.he.json')
    : await import('../i18n/aiChat.en.json');
  break;
  case 'classCard':
  mod = lang === 'he'
    ? await import('../i18n/classCard.he.json')
    : await import('../i18n/classCard.en.json');
  break;
case 'studentReports':
  mod = lang === 'he'
    ? await import('../i18n/studentReports.he.json')
    : await import('../i18n/studentReports.en.json');
  break;
      case 'recentActivity':
        mod = lang === 'he'
          ? await import('../i18n/recentActivity.he.json')
          : await import('../i18n/recentActivity.en.json');
        break;
case 'confirmModal':
  mod = lang === 'he'
    ? await import('../i18n/confirmModal.he.json')
    : await import('../i18n/confirmModal.en.json');
  break;
  case 'exportButton':
  mod = lang === 'he'
    ? await import('../i18n/exportButton.he.json')
    : await import('../i18n/exportButton.en.json');
  break;
case 'studentReportCard':
  mod = lang === 'he'
    ? await import('../i18n/studentReportCard.he.json')
    : await import('../i18n/studentReportCard.en.json');
  break;
  case 'allReports':
  mod = lang === 'he'
    ? await import('../i18n/allReports.he.json')
    : await import('../i18n/allReports.en.json');
  break;
  case 'studentHeader':
  mod = lang === 'he'
    ? await import('../i18n/studentHeader.he.json')
    : await import('../i18n/studentHeader.en.json');
  break;
case 'simulationBox':
  mod = lang === 'he'
    ? await import('../i18n/simulationBox.he.json')
    : await import('../i18n/simulationBox.en.json');
  break;
case 'simulationChart':
  mod = lang === 'he'
    ? await import('../i18n/simulationChart.he.json')
    : await import('../i18n/simulationChart.en.json');
  break;
  case 'studentDetails':
  mod = lang === 'he'
    ? await import('../i18n/studentDetails.he.json')
    : await import('../i18n/studentDetails.en.json');
  break;

  case 'studentCard':
  mod = lang === 'he'
    ? await import('../i18n/studentCard.he.json')
    : await import('../i18n/studentCard.en.json');
  break;

    default:
      mod = { default: {} };
  }
  cache[key] = mod?.default ?? {};
  return cache[key];
}

import { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export function useI18n(ns) {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const key = `${ns}:${lang}`;
  const initial = cache[key] || null;

  const [dict, setDict] = useState(initial);
  const [ready, setReady] = useState(!!initial);

  useEffect(() => {
    let cancelled = false;

    // אם במטמון – נטען מייד
    if (cache[key]) {
      setDict(cache[key]);
      setReady(true);
      return;
    }

    loadDict(ns, lang)
      .then((d) => {
        if (!cancelled) {
          setDict(d);
          setReady(true);
        }
      })
      .catch((e) => {
        console.error('[i18n] failed loading dict', ns, lang, e);
        if (!cancelled) {
          setDict({});
          setReady(true); // שלא נתקע על null
        }
      });

    return () => { cancelled = true; };
  }, [ns, lang]);

const t = (k, fallback = '') => {
  if (!dict) return fallback || k;
  const parts = k.split('.');
  let cur = dict;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      return fallback || k;
    }
  }
  return (typeof cur === 'string' ? cur : (fallback || k));
};

  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const langAttr = lang === 'he' ? 'he' : 'en';
  return { t, dir, lang: langAttr, ready };
}
