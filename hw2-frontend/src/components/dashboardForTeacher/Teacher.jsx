// src/dashboardForTeacher/Teacher.jsx
import React, { useContext } from 'react';
import TeacherHeader from "../../layout/TeacherHeader";
import Footer from "../../layout/Footer";
import DashboardOverview from "./DashboardOverview";
import QuickActions from "./QuickActions";
import RecentActivity from "../RecentActivity";
import { ThemeProvider } from '../../DarkLightMood/ThemeContext';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';

import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/*
  Teacher Dashboard Page
  ✅ i18n + RTL only. No logic changes.
*/

const TeacherContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);

  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = lang === 'he';
  const { t } = useI18n('teacherDashboard');

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

      {/* Main dashboard content */}
      <main className="flex-1 w-full px-4 py-6">
        {/* Card for overview and dashboard sections */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          {/* Personalized greeting */}
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>
            {t('welcomeBackPrefix')} {user?.username} 👋
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
            {t('overviewLead')}
          </p>

          {/* Dashboard summary stats */}
          <DashboardOverview />

          {/* Quick actions section */}
          <div className="mt-8">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {t('quickActionsTitle')}
            </h2>
            <QuickActions />
          </div>

          {/* Recent activity section */}
          <div className="mt-8">
            <RecentActivity />
          </div>
        </div>
      </main>

      {/* Floating AI chat button for teachers (only if logged in) */}
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Footer at the bottom */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const Teacher = () => {
  // Wrap the dashboard with ThemeProvider to enable theme context
  return (
    <ThemeProvider>
      <TeacherContent />
    </ThemeProvider>
  );
};

export default Teacher;
