import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import SimulationBox from './SimulationBox';
import StudentAnswerCard from './StudentAnswerCard';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';

// ✅ i18n
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const ClassDetailsContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { classCode: encoded } = useParams();
  const classCode = decodeURIComponent(encoded || '');

  const [classInfo, setClassInfo] = useState(null);
  const [classInsight, setClassInsight] = useState('');
  const { user } = useContext(UserContext);

  // ---- language / rtl ----
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('classDetails');

  // ===== DEBUG: mount =====
  console.groupCollapsed('[ClassDetails] mount');
  console.log('theme:', theme, 'isDark:', isDark);
  console.log('useParams.classCode (raw):', classCode);
  console.groupEnd();

  useEffect(() => {
    const fetchClassInfo = async () => {
      const url = `/api/classes/get-class-by-code?classCode=${classCode}`;
      console.groupCollapsed('[ClassDetails] fetchClassInfo');
      console.log('request url:', url);

      try {
        const t0 = performance.now();
        const res = await fetch(url);
        const t1 = performance.now();
        console.log('response.ok:', res.ok, 'status:', res.status, 'statusText:', res.statusText, `(${(t1 - t0).toFixed(1)}ms)`);

        console.log('response headers:', Array.from(res.headers.entries()));

        const data = await res.json().catch(e => {
          console.warn('JSON parse failed:', e);
          return null;
        });

        console.log('data (raw):', data);
        if (data) {
          console.log('keys:', Object.keys(data || {}));
          console.log('students exists?', !!data?.students, 'length:', Array.isArray(data?.students) ? data.students.length : 'N/A');
        }
        setClassInfo(data);
      } catch (error) {
        console.error('❌ Failed to fetch class data (exception):', error);
      } finally {
        console.groupEnd();
      }
    };

    console.log('[ClassDetails] useEffect fired. classCode:', classCode);
    fetchClassInfo();
  }, [classCode]);

  const getClassInsightFromAI = async () => {
    console.groupCollapsed('[ClassDetails] getClassInsightFromAI');
    console.log('payload:', { classCode });

    try {
      const t0 = performance.now();
      const res = await fetch('/api/classes/ai-class-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode })
      });
      const t1 = performance.now();
      console.log('response.ok:', res.ok, 'status:', res.status, `(${(t1 - t0).toFixed(1)}ms)`);

      const data = await res.json().catch(e => {
        console.warn('JSON parse failed:', e);
        return null;
      });

      console.log('data (raw):', data);
      if (res.ok && data) {
        setClassInsight(data.insight);
        console.log('✅ insight set. length:', (data.insight || '').length);
      } else {
        const msg = `⚠️ ${data?.message || ''}`.trim() || t('aiServerError');
        setClassInsight(msg);
        console.warn('setClassInsight with warning:', msg);
      }
    } catch (error) {
      console.error('❌ Error getting AI class insight:', error);
      setClassInsight(t('aiServerError'));
    } finally {
      console.groupEnd();
    }
  };

  // ===== DEBUG: render summary =====
  console.groupCollapsed('[ClassDetails] render');
  console.log('classInfo is null?', classInfo === null);
  if (classInfo) {
    console.log('classInfo.classCode:', classInfo.classCode);
    console.log('students length:', Array.isArray(classInfo.students) ? classInfo.students.length : 'N/A');
  }
  console.log('classInsight length:', (classInsight || '').length);
  console.groupEnd();

  // ⛳️ כדי למנוע הבהוב — לא מרנדרים עד שהמילון מוכן
  if (!ready) return null;

  return (
    <div
      dir={dir}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
    >
      {/* Header - לא נוגעים */}
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        {/* Title Section - רספונסיבי */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-4 sm:p-6 rounded mb-4 sm:mb-6`}>
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span role="img" aria-label="book">📘</span> {t('title')}
          </h1>
          <p className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2">
            <span>{t('classCodeLabel')}</span>
            <span className="bg-gray-100 dark:bg-slate-600 px-3 py-1 rounded font-mono text-sm sm:text-base inline-block">
              {classCode}
            </span>
          </p>
        </div>

        {classInfo ? (
          <>
            {/* SimulationBox - יישאר כמו שהוא */}
            <SimulationBox
              simulationText={classInfo.question}
              situation={classInfo.situation}
              onGetClassInsight={getClassInsightFromAI}
            />

            {/* AI Insight Box - רספונסיבי */}
            {classInsight && (
              <div className="mt-3 sm:mt-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded bg-yellow-100 text-yellow-900 shadow">
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t('aiInsightTitle')}</h3>
                <p className="text-sm sm:text-base">{classInsight}</p>
              </div>
            )}

            {/* Student Cards - יישארו כמו שהם */}
            {Array.isArray(classInfo.students) ? (
              classInfo.students.map((student, idx) => {
                console.debug('[ClassDetails] render StudentAnswerCard idx:', idx, 'studentId:', student?.studentId, 'submittedAt:', student?.submittedAt);
                return (
                  <StudentAnswerCard key={student._id || `${student.studentId}-${idx}`} answer={student} isDark={isDark} />
                );
              })
            ) : (
              <p className="text-red-500 text-sm sm:text-base">{t('studentsNotArray')}</p>
            )}
          </>
        ) : (
          <p className="text-sm sm:text-base">{t('loading')}</p>
        )}
      </main>

      {/* AI Chat - לא נוגעים */}
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Footer - לא נוגעים */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const ViewClassDetails = () => {
  return (
    <ThemeProvider>
      <ClassDetailsContent />
    </ThemeProvider>
  );
};

export default ViewClassDetails;