import React, { useContext, useEffect, useState } from 'react';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';
import StudentCard from '../../components/StudentProgressForTeacher/StudentCard';

// i18n
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const AllReportsContent = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const isDark = theme === 'dark';

  const { t, dir, lang } = useI18n('allReports');
  const { lang: currentLang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = currentLang === 'he';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student-progress/${user.id}`);
        const data = await response.json();
        console.log('Fetched students data:', data);
        setStudents(data);
      } catch (error) {
        console.error('Failed to fetch student progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  const filteredStudents = students.filter((student) =>
    (student?.id || '').includes(searchId.trim())
  );

  return (
    <div
      dir={dir}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
      }`}
    >
      <div className="px-3 sm:px-4 mt-4">
        <TeacherHeader />
      </div>

      <main className="flex-1 w-full px-3 sm:px-4 py-4 sm:py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-4 sm:p-6 rounded`}>
          <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>
            {t('title')}
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-600'} mb-3 sm:mb-4`}>
            {t('subtitle')}
          </p>

          {/* שדה חיפוש */}
          <div className={`mb-4 sm:mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchAria')}
              className={`p-2.5 sm:p-3 border rounded shadow-sm w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-600 text-white placeholder-gray-300 border-slate-500'
                  : 'bg-white text-slate-800 placeholder-slate-400 border-slate-300'
              }`}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm sm:text-base">{t('loading')}</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div
              className={`rounded-lg shadow-md p-4 sm:p-6 text-center text-sm sm:text-base ${
                isDark ? 'bg-slate-600 text-gray-300' : 'bg-white text-slate-600'
              }`}
            >
              {searchId ? t('noMatch') : t('empty')}
            </div>
          ) : (
            <div
              className={`rounded-lg shadow-md p-3 sm:p-6 ${
                isDark ? 'bg-slate-600' : 'bg-white'
              } grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`}
            >
              {filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>
      </main>

      {user?.id && <AIChat teacherId={user.id} />}

      <div className="px-3 sm:px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const AllReports = () => {
  return (
    <ThemeProvider>
      <AllReportsContent />
    </ThemeProvider>
  );
};

export default AllReports;