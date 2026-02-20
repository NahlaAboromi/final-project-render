// components/dashboard/QuickActions.jsx
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

// This component displays a set of quick action cards for teachers on the dashboard.
const QuickActions = () => {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = lang === 'he';
  const { t } = useI18n('quickActions');

  // Array of action card data (טקסטים מתורגמים בלבד)
  const actions = useMemo(() => [
    {
      icon: (
        // Icon for creating a new class
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
             viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="text-blue-600">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      title: t('createTitle'),
      description: t('createDesc'),
      buttonText: t('createBtn'),
      buttonLink: '/teacher/Create_New_Class',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: (
        // Icon for managing classes
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
             viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="text-green-600">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      title: t('manageTitle'),
      description: t('manageDesc'),
      buttonText: t('manageBtn'),
      buttonLink: '/view-classes',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: (
        // Icon for student progress
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
             viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="text-purple-600">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/>
          <path d="M12 11h4"/>
          <path d="M12 16h4"/>
          <path d="M8 11h.01"/>
          <path d="M8 16h.01"/>
        </svg>
      ),
      title: t('progressTitle'),
      description: t('progressDesc'),
      buttonText: t('progressBtn'),
      buttonLink: '/all-reports',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    }
  ], [t]);

  return (
    // Grid for action cards, responsive for mobile and desktop
    <div dir={isRTL ? 'rtl' : 'ltr'} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        // Card for each quick action
        <div key={index} className="bg-white dark:bg-slate-600 dark:text-white p-5 rounded-md shadow-sm flex flex-col justify-between h-full">
          {/* Icon and title */}
          <div className="flex items-center gap-3 mb-3">
            <div>{action.icon}</div>
            <h3 className="font-bold">{action.title}</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
            {action.description}
          </p>

          {/* Action button */}
          <div className="mt-auto">
            <Link
              to={action.buttonLink}
              className={`${action.buttonColor} text-white py-2 px-4 rounded text-sm inline-block`}
            >
              {action.buttonText}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
