// File: src/pages/Create_New_Class.jsx
import React, { useContext, useState } from 'react';
import ClassForm from '../ClassForm';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';

import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/*
   Create_new_class component
   ✅ i18n + RTL only. No logic changes.
*/

const CreateClassContent = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const isDark = theme === 'dark';

  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = lang === 'he';
  const { t } = useI18n('createClass');

  const [showInfo, setShowInfo] = useState(false);

  return (
    // Main container with theme-based background and text color
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
    >
      {/* Header for teachers */}
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      {/* Main content area */}
      <main className="flex-1 w-full px-4 py-6">
        {/* Card for class creation instructions and form */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          {/* FIX: template string backticks for dynamic className */}
          <div className={`flex items-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>
              {t('title')}
            </h1>
            {/* כפתור אינפו קטן ליד הכותרת */}
            <button
              onClick={() => setShowInfo(true)}
              className="ml-2 p-1 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-blue-200 dark:hover:bg-slate-500 transition"
              aria-label={t('infoAria')}
              title={t('infoTitle')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
              </svg>
            </button>
          </div>

          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
            {t('lead')}
          </p>

          {/* The actual class creation form */}
          <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
            <ClassForm />
          </div>
        </div>
      </main>

      {/* הפופאפ של "How it works" */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-10/12 max-w-xl text-slate-800 dark:text-white">
            <h3 className="font-medium text-blue-800 dark:text-blue-300">{t('popup.title')}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {t('popup.p1')}
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li>{t('popup.li1')}</li>
              <li>{t('popup.li2')}</li>
              <li>{t('popup.li3')}</li>
              <li>{t('popup.li4')}</li>
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {t('popup.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chat button for teachers */}
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Footer at the bottom */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const Create_New_Class = () => {
  // Wrap the content with ThemeProvider to enable theme context
  return (
    <ThemeProvider>
      <CreateClassContent />
    </ThemeProvider>
  );
};

export default Create_New_Class;
