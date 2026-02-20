import React, { useEffect, useContext } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import { useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n'; // ✅ מילון לוקאלי

const RecentActivity = () => {
  const { notifications, fetchNotifications } = useNotifications();
  const location = useLocation();

  const { t, dir, lang } = useI18n('recentActivity'); // ⬅️ מילון מהיר
  const { lang: ctxLang } = useContext(LanguageContext) || { lang: 'he' };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const recentNotifications = sortedNotifications.slice(0, 3);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'exam': return 'bg-yellow-400 text-black';
      case 'message': return 'bg-blue-400 text-white';
      case 'schedule': return 'bg-purple-500 text-white';
      case 'warning': return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✔️';
      case 'exam': return '📝';
      case 'message': return '💬';
      case 'schedule': return '📅';
      case 'warning': return '⚠️';
      default: return '🔔';
    }
  };

  if (!notifications.length) {
    return (
      <div dir={dir} lang={lang} className="text-center text-gray-500 dark:text-gray-300">
        {t('noActivities')}
      </div>
    );
  }

  return (
    <div dir={dir} lang={lang} className="bg-white dark:bg-slate-600 dark:text-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">{t('title')}</h2>
      <ul className="space-y-4">
        {recentNotifications.map((activity, index) => (
          <li
            key={activity._id || activity.createdAt || index}
            className="border-b pb-2 border-gray-200 dark:border-gray-500 flex items-start gap-3"
          >
            <div
              className={`flex-shrink-0 mt-1 w-8 h-8 ${getTypeStyle(activity.type)} rounded-full flex items-center justify-center`}
            >
              <span>{getTypeIcon(activity.type)}</span>
            </div>
            <div>
              <div className="font-medium">{activity.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {activity.createdAt
                  ? new Date(activity.createdAt).toLocaleString(ctxLang === 'he' ? 'he-IL' : 'en-US')
                  : t('noDate')}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
