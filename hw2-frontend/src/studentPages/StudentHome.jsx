// Student.jsx (או StudentHome.jsx שלך)
import React, { useContext } from 'react';
import StudentHeader from "./StudentHeader";
import Footer from "../layout/Footer";
import ShowClasses from "./ShowClasses";
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import { UserContext } from '../context/UserContext';
import StudentRecentActivities from './StudentRecentActivities';
import StudentAIChat from '../AI/StudentAIChat';
import { useI18n } from '../utils/i18n';

const StudentContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);

  const { t, dir, lang } = useI18n('studentHome'); // ✅ namespace חדש

  return (
    <div
      dir={dir}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <div className="px-4 mt-4">
        <StudentHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>
            {t('welcomeBack', 'Welcome back')}, {user?.username} 👋
          </h1>

          <ShowClasses />

          <div className="mt-8" />

          <StudentRecentActivities />
        </div>
      </main>

      {user?.id && <StudentAIChat studentId={user.id} studentName={user.username} />}

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const Student = () => {
  return (
    <ThemeProvider>
      <StudentContent />
    </ThemeProvider>
  );
};

export default Student;