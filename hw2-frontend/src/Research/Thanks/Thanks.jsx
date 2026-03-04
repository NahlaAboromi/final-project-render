// src/Research/Thanks.jsx
// src/Research/Thanks/index.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnonymousHeader from '../AnonymousHeader';
import Footer from '../../layout/Footer';
import { ThemeContext, ThemeProvider } from '../../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../../context/AnonymousStudentContext';
import { useI18n } from '../../utils/i18n';
import HeroSection from './HeroSection';
import AppreciationCard from './AppreciationCard';
import MetaInfoCard from './MetaInfoCard';
import LoadingScreen from './LoadingScreen';
import ErrorAlert from './ErrorAlert';
function ThanksInner() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudent?.() || { student: null };

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

  const { t, dir, lang: langAttr, ready } = useI18n('thanks');


  const isRTL = dir === 'rtl';

  const anonId = location.state?.anonId || student?.anonId || '—';
      const supportEmail = "n0502898789@gmail.com"; // 😎 לשים את המייל שלכם

  const emailSubject =
    langAttr === 'he'
      ? "בקשה לניתוח מעמיק של תוצאות השאלונים – CASELy"
      : "Request for detailed analysis of questionnaire results – CASELy";

  const emailBody =
    langAttr === 'he'
      ? `שלום,\n\nאני משתתפ/ת במחקר CASELy ומבקשת לקבל ניתוח מעמיק יותר של התוצאות שלי.\n\nמזהה אנונימי: ${anonId}\n\nאשמח לקבל העמקה והבהרות לגבי החוזקות והתחומים שבהם ניתן להשתפר לפי הממצאים.\n\nתודה מראש,\n`
      : `Hello,\n\nI am participating in the CASELy study and would like to receive a more detailed analysis of my results.\n\nAnonymous ID: ${anonId}\n\nI would appreciate a deeper explanation of my strengths and the areas where I can improve, based on the findings.\n\nThank you in advance,\n`;

  const mailtoHref = `mailto:${supportEmail}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  const initialGroup = (location.state?.group || '').toString().toUpperCase();
  const initialType = location.state?.groupType || (initialGroup === 'D' ? 'control' : initialGroup ? 'experimental' : '');

  const [group, setGroup] = useState(initialGroup);
  const [groupType, setGroupType] = useState(initialType);
  const [fetchErr, setFetchErr] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (group || !anonId || anonId === '—') return;
      try {
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/trial/${anonId}`);
        if (!r.ok) throw new Error('Failed to load trial meta.');
        const tMeta = await r.json();
        if (ignore) return;
        const g = String(tMeta.group || '').toUpperCase();
        setGroup(g);
        setGroupType(tMeta.groupType || (g === 'D' ? 'control' : g ? 'experimental' : ''));
      } catch (e) {
        if (!ignore) setFetchErr(e.message || 'Load error');
      }
    })();
    return () => { ignore = true; };
  }, [anonId, group]);

  const hasSocratic = useMemo(() => !!group && group !== 'D', [group]);
  const aboutList = [t('about_1'), t('about_2'), t('about_3'), t('about_4')];

  const groupBadge = useMemo(() => {
    if (!group) return null;
    const isCtrl = group === 'D' || groupType === 'control';
    return {
      text: isCtrl ? t('ribbons_control') : t('ribbons_experimental'),
      tone: isCtrl
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    };
  }, [group, groupType, t]);

  if (!ready) {
    return <LoadingScreen isDark={isDark} dir={dir} langAttr={langAttr} />;
  }

  return (
    <div
      className={`flex flex-col min-h-screen w-screen ${
        isDark
          ? 'bg-slate-950'
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}
      dir={dir}
      lang={langAttr}
style={{
  fontFamily:
    'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}}
    >
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      <main className="flex-1 w-full px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <HeroSection 
            hasSocratic={hasSocratic}
            groupBadge={groupBadge}
            isDark={isDark}
            isRTL={isRTL}
            t={t}
          />

          <ErrorAlert error={fetchErr} isDark={isDark} />

          {/* Main Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <AppreciationCard 
              aboutList={aboutList}
              isDark={isDark}
              isRTL={isRTL}
              t={t}
            />

            <MetaInfoCard 
              anonId={anonId}
              hasSocratic={hasSocratic}
              isDark={isDark}
              isRTL={isRTL}
              navigate={navigate}
              t={t}
            />
          </div>
{anonId && anonId !== '—' && (
  <div
    className={`mt-6 rounded-3xl shadow-2xl overflow-hidden ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700'
        : 'bg-white/90 border border-slate-200'
    }`}
  >
    {/* פס עליון */}
    <div
      className={`h-2 ${
        isDark
          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
          : 'bg-gradient-to-r from-emerald-400 to-teal-500'
      }`}
    />

    <div className="p-5 sm:p-6 md:p-7 text-sm md:text-base">
      <p className="mb-4 leading-relaxed">
        {langAttr === 'he'
          ? 'במידה ותרצה/י לקבל ניתוח מעמיק יותר של התוצאות וההשוואה של התפקוד שלך, ניתן לפנות אלינו במייל:'
          : 'If you would like a deeper analysis of your results and a comparison of your functioning, you may contact us by email:'}
      </p>

      <button
        onClick={() => window.location.href = mailtoHref}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 ${
          isDark
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
        }`}
      >
        <span>📧</span>
        <span>{supportEmail}</span>
      </button>
    </div>
  </div>
)}



        </div>
      </main>

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function Thanks() {
  return (
    <ThemeProvider>
      <ThanksInner />
    </ThemeProvider>
  );
}