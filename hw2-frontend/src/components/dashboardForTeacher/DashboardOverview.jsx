// src/dashboardForTeacher/DashboardOverview.jsx
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/*
  DashboardOverview Component
  Summary of teacher's dashboard: #active classes, total students, most frequent topic.
  ✅ i18n + RTL only. Logic unchanged.
*/

const DashboardOverview = () => {
  const { user } = useContext(UserContext);                  // current teacher
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = lang === 'he';
  const { t } = useI18n('dashboardOverview');                // ⬅️ מילון מהיר

  // summary state
  const [summary, setSummary] = useState({
    activeClasses: 0,
    totalStudents: 0,
    mostCommonTopic: 'N/A',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/teacher/${user?.id}/summary`);
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchSummary();
  }, [user?.id]);

  // stats array (labels מתורגמים)
  const stats = [
    {
      label: t('activeClasses'),
      value: summary.activeClasses,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="text-indigo-600 dark:text-indigo-400">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
    },
    {
      label: t('totalStudents'),
      value: summary.totalStudents,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="text-teal-600 dark:text-teal-400">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      label: t('mostFrequentTopic'),
      value: summary.mostCommonTopic || 'N/A',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="text-yellow-600 dark:text-yellow-400">
          <path d="M4 4h16v2H4zM4 10h16v2H4zM4 16h16v2H4z"></path>
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="text-center text-gray-500 dark:text-gray-300">
        {t('loading')}
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-600 dark:text-white rounded-md shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="text-lg">{stat.icon}</div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardOverview;
