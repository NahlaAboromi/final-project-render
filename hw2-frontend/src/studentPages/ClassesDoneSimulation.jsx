import React, { useState, useEffect, useContext } from 'react';
import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import Footer from "../layout/Footer";
import StudentAIChat from '../AI/StudentAIChat';
import { useI18n } from '../utils/i18n';

const ClassManagerContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const userId = user?.id;

  // ✅ i18n
  const { t, dir, lang } = useI18n('classManagerStudentView');

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classCodeFilter, setClassCodeFilter] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!userId) {
          setError(t('errors.noUserId', 'No user ID found.'));
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/classes/get-classes-done-simulation/${userId}`);
        const data = await response.json();

        if (response.ok) {
          const formattedData = data.map((item) => ({
            _id: item._id,
            classCode: item.code || '',
            className: item.name || '',
            subject: item.subject || '',
            createdAt: item.createdAt || item.createdDate || '',
            createdBy: item.createdBy || '',
            studentsTaken: item.students || [],
          }));

          setClasses(formattedData);
          setError('');
        } else {
          setError(data.message || t('errors.fetchFailed', 'Failed to fetch classes.'));
        }
      } catch (err) {
        console.error('❌ Error fetching classes:', err?.message);
        setError(t('errors.serverError', 'Server error.'));
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lang]); // ✅ re-render on language change

  const filteredClasses = classes.filter((classData) => {
    const matchesSearch =
      searchTerm === '' ||
      classData.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClassCode =
      classCodeFilter === '' || classData.classCode.includes(classCodeFilter);

    return matchesSearch && matchesClassCode;
  });

  return (
    <div
      dir={dir}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
    >
      <div className="px-4 mt-4">
        <StudentHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded mb-6`}>
          <div>
            <h3 className="text-3xl font-bold mb-6 text-center text-blue-600">
              {t('title', 'Simulations Completed')}
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-600 p-4 rounded shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder', 'Search classes by name...')}
                  className="w-full py-2 px-4 pr-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 absolute top-2.5 text-gray-400 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
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

              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <input
                  type="text"
                  placeholder={t('classCodePlaceholder', 'Class Code...')}
                  className="py-2 px-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={classCodeFilter}
                  onChange={(e) => setClassCodeFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="text-center py-10">{t('loading', 'Loading classes...')}</div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-500 p-5 rounded text-center">
                <p>{error}</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="bg-white dark:bg-slate-600 p-5 rounded text-center">
                <p>{t('empty', 'No classes found.')}</p>
              </div>
            ) : (
              filteredClasses
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((classData) => (
                  <div
                    key={classData._id}
                    className="bg-white dark:bg-slate-600 dark:text-white rounded-md shadow-sm p-4 flex justify-between items-center"
                  >
                    <div>
                      <h2 className="text-lg font-bold mb-1">{classData.className}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        <strong>{t('codeLabel', 'Code')}:</strong> {classData.classCode}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        <strong>{t('subjectLabel', 'Subject')}:</strong> {classData.subject}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate('/my-reports', { state: { classCode: classData.classCode } })}
                      className={`px-3 py-2 bg-slate-100 dark:bg-slate-800 dark:text-white hover:border-blue-700 border border-transparent transition ${
                        dir === 'rtl' ? 'mr-4' : 'ml-4'
                      }`}
                    >
                      {t('viewDetails', 'View Details')}
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </main>

      {user?.id && <StudentAIChat studentId={user.id} studentName={user.username} />}

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