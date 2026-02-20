import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import StudentReportCard from './StudentReportCard';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';

// ✅ i18n
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

// StudentReportsContent displays all student analysis reports for a specific class.
const StudentReportsContent = () => {
  const { classCode } = useParams();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { user } = useContext(UserContext);

  const [classInfo, setClassInfo] = useState(null);

  // ---- language / rtl ----
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('studentReports');

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/classes/get-class-by-code?classCode=${classCode}`);
        const data = await res.json();
        setClassInfo(data);
      } catch (error) {
        console.error('❌ Error fetching class info:', error);
      }
    };
    fetchClass();
  }, [classCode]);

  const groupStudentsByStudentId = (students) => {
    const grouped = {};
    students
      .filter(student => student.analysisResult)
      .forEach(student => {
        const key = student.studentId || student._id;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(student);
      });
    return Object.values(grouped);
  };

  const studentGroups = classInfo ? groupStudentsByStudentId(classInfo.students || []) : [];

  // למניעת הבהוב לפני טעינת המילון
  if (!ready) return null;

  // בניית טקסט ספירה (בלי לשנות את t)
  const count = studentGroups.length;
  const countLabel = count === 1
    ? t('uniqueStudentsSingular')
    : (t('uniqueStudentsPlural') || '').replace('{n}', String(count));

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

      {/* Main content area */}
      <main className="flex-1 w-full px-4 py-6">
        {/* Class info and summary - רספונסיבי */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-4 sm:p-6 rounded mb-4 sm:mb-6`}>
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span role="img" aria-label="chart">📊</span> {t('title')}
          </h1>
          <p className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2">
            <span>{t('classCode')}</span>
            <span className="bg-gray-100 dark:bg-slate-600 px-3 py-1 rounded font-mono text-sm sm:text-base inline-block">
              {classCode}
            </span>
          </p>
          {classInfo && (
            <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {countLabel}
            </div>
          )}
        </div>

        {/* Main reports section - רספונסיבי */}
        {classInfo ? (
          studentGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {studentGroups.map((studentGroup, index) => (
                <StudentReportCard
                  key={`${studentGroup[0].studentId || studentGroup[0]._id}-${index}`}
                  studentGroup={studentGroup}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{t('emptyIcon')}</div>
              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-300 mb-2 px-4">
                {t('emptyTitle')}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 px-4">
                {t('emptyHint')}
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg">{t('loadingClass')}</p>
          </div>
        )}
      </main>

      {/* AIChat for teacher - לא נוגעים */}
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Footer - לא נוגעים */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

/** Wrapper */
const ClassStudentReports = () => (
  <ThemeProvider>
    <StudentReportsContent />
  </ThemeProvider>
);

export default ClassStudentReports;