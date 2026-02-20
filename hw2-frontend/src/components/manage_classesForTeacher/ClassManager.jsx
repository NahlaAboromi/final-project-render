import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ClassCard from './ClassCard';
import TeacherHeader from "../../layout/TeacherHeader";
import Footer from "../../layout/Footer";
import { ThemeProvider, ThemeContext } from "../../DarkLightMood/ThemeContext";
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';

// ✅ i18n
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const ClassManagerContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { user } = useContext(UserContext);

  // ---- language / rtl ----
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('classManager');

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classCodeFilter, setClassCodeFilter] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!user?.id) {
          setError('No user ID found.'); // נשאיר הודעת דיבוג באנגלית כבעבר
          setLoading(false);
          return;
        }
        const response = await fetch(`/api/classes/teacher/${user.id}`);
        const data = await response.json();

        if (response.ok) {
          const formattedData = data.map((item) => ({
            _id: item._id || '',
            classCode: item.classCode || item.id || '',
            className: item.className || item.name || '',
            subject: item.subject || '',
            createdAt: item.createdAt || item.createdDate || '',
            studentsTaken: item.students || [],
          }));
          setClasses(formattedData);
          setError('');
        } else {
          setError(data.message || 'Failed to fetch classes.');
        }
      } catch (err) {
        console.error('❌ Error fetching classes:', err.message);
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  const filteredClasses = classes.filter(classData => {
    const matchesSearch =
      searchTerm === '' ||
      (classData.className || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassCode =
      classCodeFilter === '' ||
      (classData.classCode || '').includes(classCodeFilter);
    return matchesSearch && matchesClassCode;
  });

  // למניעת הבהוב לפני טעינת המילון
  if (!ready) return null;

  return (
    <div
      dir={dir}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
    >
      {/* Page Header - לא נוגעים */}
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-4 sm:p-6 rounded`}>
          {/* Title Section - רספונסיבי */}
          <h1 className="text-xl sm:text-2xl font-bold mb-1">{t('title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            {t('subtitle')}
          </p>

          {/* Search and Filter Section - רספונסיבי */}
          <div className="bg-white dark:bg-slate-600 p-3 sm:p-4 rounded shadow mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="w-full py-2 px-4 pr-10 text-sm sm:text-base rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Search Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 absolute right-3 top-2.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              
              {/* Class Code Filter Input */}
              <div>
                <input
                  type="text"
                  placeholder={t('codePlaceholder')}
                  className="w-full py-2 px-4 text-sm sm:text-base rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={classCodeFilter}
                  onChange={(e) => setClassCodeFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classes List - רספונסיבי */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {loading ? (
              <div className="text-center py-8 sm:py-10 text-sm sm:text-base">{t('loading')}</div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-500 p-4 sm:p-5 rounded text-center text-sm sm:text-base">
                <p>{t('errorBox')}<br />{error}</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="bg-white dark:bg-slate-600 p-4 sm:p-5 rounded text-center text-sm sm:text-base">
                <p>{t('empty')}</p>
              </div>
            ) : (
              filteredClasses
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((classData) => (
                  <ClassCard
                    key={classData._id || classData.classCode}
                    classData={classData}
                    onDeleteSuccess={(deletedClassCode) => {
                      setClasses(prev => prev.filter(c => c.classCode !== deletedClassCode));
                    }}
                  />
                ))
            )}
          </div>

          {/* Create New Class Button - רספונסיבי */}
          <div className="mt-4 sm:mt-6 flex justify-center">
            <Link
              to="/teacher/Create_New_Class"
              className="bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-2 px-5 sm:px-6 rounded-lg shadow-md flex items-center gap-2 text-base sm:text-lg w-full sm:w-auto justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                className="sm:w-5 sm:h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>{t('createBtn')}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* AI Chat for Teacher Assistance - לא נוגעים */}
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Page Footer - לא נוגעים */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const ClassManager = () => (
  <ThemeProvider>
    <ClassManagerContent />
  </ThemeProvider>
);

export default ClassManager;