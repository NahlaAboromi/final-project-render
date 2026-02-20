import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { exportElementAsPDF } from './pdfExporter';

import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';

import StudentOverviewHeader from '../../components/StudentProgressForTeacher/StudentOverviewHeader';
import ClassProgressCard from '../../components/StudentProgressForTeacher/ClassProgressCard';

// i18n
import { useI18n } from '../../utils/i18n';

const ProgressOfChosenStudentContent = () => {
  const { studentId } = useParams();
  const location = useLocation();
  const passedStudent = location.state?.student || null;

  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const isDark = theme === 'dark';

  const { t, dir, lang } = useI18n('studentDetails');

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const exportRef = useRef();
  const handleExportPDF = () => {
    exportElementAsPDF(exportRef.current, `student-${studentId}-progress.pdf`);
  };

  useEffect(() => {
    async function fetchStudentData() {
      try {
        console.log(`🚀 Fetching data for student ID: ${studentId}, teacher ID: ${user?.id}`);
        const res = await fetch(`/api/teacher/${user.id}/student/${studentId}/progress`);
        if (!res.ok) throw new Error('Failed to fetch student progress data');
        const data = await res.json();
        console.log('📥 Fetched student data from API:', data);
        setStudentData(data);
      } catch (err) {
        console.error('❌ Error fetching student data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) {
      fetchStudentData();
    }
  }, [studentId, user?.id]);

  const baseClasses = `flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`;

  if (loading) {
    return (
      <div dir={dir} lang={lang} className={baseClasses}>
        <div className="px-3 sm:px-4 mt-4"><TeacherHeader /></div>
        <main className="flex-1 w-full px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm sm:text-base">{t('loading')}</span>
          </div>
        </main>
        <div className="px-3 sm:px-4 pb-4"><Footer /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div dir={dir} lang={lang} className={baseClasses}>
        <div className="px-3 sm:px-4 mt-4"><TeacherHeader /></div>
        <main className="flex-1 w-full px-3 sm:px-4 py-4 sm:py-6">
          <div className="p-4 sm:p-6 text-center text-red-600 text-sm sm:text-base">
            {t('errorPrefix')} {error}
          </div>
        </main>
        <div className="px-3 sm:px-4 pb-4"><Footer /></div>
      </div>
    );
  }

  if (!studentData) return null;

  console.log('📝 Rendering with studentData.classes:', studentData.classes);

  return (
    <div dir={dir} lang={lang} className={baseClasses}>
      <div className="px-3 sm:px-4 mt-4"><TeacherHeader /></div>

      <main className="flex-1 w-full px-3 sm:px-4 py-4 sm:py-6">
        <div className="w-full flex justify-end mb-3 sm:mb-4 pr-0 sm:pr-4">
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded shadow hover:bg-blue-700 transition-all text-sm sm:text-base"
            aria-label={t('exportPdf')}
            title={t('exportPdf')}
          >
            {t('exportPdf')}
          </button>
        </div>

        <div ref={exportRef} className="space-y-4 sm:space-y-6">
          <StudentOverviewHeader
            student={{
              id: studentId,
              username: passedStudent?.username || studentData.username,
              profilePic: passedStudent?.profilePic || studentData.profilePic,
              classes: studentData.classes,
              totalAttempts: passedStudent?.totalAttempts || studentData.totalAttempts,
              uniqueSimulations: passedStudent?.uniqueSimulations || studentData.uniqueSimulations,
              averageScore: passedStudent?.averageScore || studentData.averageScore
            }}
            isDark={isDark}
          />

          {[...studentData.classes]
            .sort((a, b) => {
              const latestA = a.attempts?.at(-1)?.submittedAt || 0;
              const latestB = b.attempts?.at(-1)?.submittedAt || 0;
              return new Date(latestB) - new Date(latestA);
            })
            .map((classData, index) => {

              console.log(`🔍 Class at index ${index}:`, classData);

              if (!classData || !Array.isArray(classData.attempts)) {
                console.warn(`⚠️ Invalid class or attempts at index ${index}, skipping.`);
                return null;
              }

              const safeAttempts = classData.attempts.filter((attempt, aIndex) => {
                if (!attempt || !attempt.analysisResult) {
                  console.warn(`  ⚠️ Skipping attempt ${aIndex} (missing or invalid analysisResult)`);
                  return false;
                }
                console.log(`  ✅ Attempt ${aIndex} overallScore:`, attempt.analysisResult.overallScore);
                return true;
              });

              return (
                <ClassProgressCard
                  key={index}
                  classData={{ ...classData, attempts: safeAttempts }}
                  isDark={isDark}
                />
              );
            })}
        </div>
      </main>

      {user?.id && <AIChat teacherId={user.id} />}
      <div className="px-3 sm:px-4 pb-4"><Footer /></div>
    </div>
  );
};

const ProgressOfChosenStudent = () => (
  <ThemeProvider>
    <ProgressOfChosenStudentContent />
  </ThemeProvider>
);

export default ProgressOfChosenStudent;