// src/studentPages/StudentHeader.jsx  (or wherever your StudentHeader lives)
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import ThemeToggle from '../DarkLightMood/ThemeToggle';
import { UserContext } from '../context/UserContext';
import { StudentNotificationsContext } from '../context/StudentNotificationsContext';

import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../utils/i18n';

const StudentHeader = () => {
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

  const {
    notifications,
    notificationCount,
    isLoading,
    error,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useContext(StudentNotificationsContext);

  // ✅ i18n like TeacherHeader
const { t, dir, lang } = useI18n('studentHeaderNav');
  const isRTL = dir === 'rtl';

  const student = user;

  const getTypeStyle = (type) => {
    switch (type) {
      case 'submitted': return 'bg-green-500 text-white';
      case 'exam': return 'bg-yellow-400 text-black';
      case 'export': return 'bg-purple-500 hover:bg-purple-600 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'submitted': return '✔️';
      case 'exam': return '📝';
      case 'export': return '📄';
      default: return '🔔';
    }
  };

  const getProfileImage = () => {
    if (!student?.profilePic || student.profilePic === 'default_empty_profile_pic') {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      );
    }

    return (
      <img
        src={student.profilePic}
        alt={student?.username || t('user', 'User')}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/default-profile.png';
        }}
      />
    );
  };

  return (
    <header
      dir={dir}
      lang={lang}
      className={`p-3 sm:p-4 ${
        theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'
      } rounded shadow-md
        flex flex-col gap-3
        sm:flex-row sm:items-center sm:justify-between`}
    >
      {/* Navigation links */}
      <nav className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base justify-center sm:justify-start">
        {/* Home link */}
        <Link
          to="/StudentHome"
          className="font-bold hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-layout-dashboard"
          >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          <span>{t('home', 'Home')}</span>
        </Link>

        {/* My Simulations link */}
        <Link
          to="/classesDoneSimulation"
          className="font-bold hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-clipboard-list"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
          <span>{t('mySimulations', 'My Simulations')}</span>
        </Link>

        {/* My Progress link */}
        <Link
          to="/my_progress"
          className="font-bold hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-book-open"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span>{t('myProgress', 'My Progress')}</span>
        </Link>
      </nav>

      <div className="flex flex-wrap items-center gap-3 sm:gap-6 justify-center sm:justify-end">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* ✅ Language Switcher (same as Teacher) */}
        <LanguageSwitcher />

        {/* Notification Bell */}
        <div className="relative group">
          <style>{`
            @keyframes bellShake {
              0% { transform: rotate(0); }
              10% { transform: rotate(10deg); }
              20% { transform: rotate(-10deg); }
              30% { transform: rotate(8deg); }
              40% { transform: rotate(-8deg); }
              50% { transform: rotate(6deg); }
              60% { transform: rotate(-6deg); }
              70% { transform: rotate(4deg); }
              80% { transform: rotate(-4deg); }
              90% { transform: rotate(2deg); }
              100% { transform: rotate(0); }
            }
            .bell-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              position: relative;
              cursor: pointer;
              border-radius: 50%;
              transition: background-color 0.2s;
            }
            .bell-icon:hover { background-color: rgba(255, 255, 255, 0.1); }
            .bell-animation { animation: bellShake 1.5s ease-in-out infinite; transform-origin: 50% 0; }

            .notification-dropdown {
              position: absolute;
              top: 45px;
              width: 320px;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
              z-index: 50;
              opacity: 0;
              visibility: hidden;
              transform: scale(0.95) translateY(-10px);
              transform-origin: top right;
              transition: all 0.2s ease-in-out;
              right: 0;
            }

            /* RTL support for dropdown */
            [dir="rtl"] .notification-dropdown {
              right: auto;
              left: 0;
              transform-origin: top left;
            }

            .group:hover .notification-dropdown {
              opacity: 1;
              visibility: visible;
              transform: scale(1) translateY(0);
            }

            .notification-badge {
              position: absolute;
              top: 0;
              right: 0;
              background-color: #ef4444;
              color: white;
              border-radius: 50%;
              font-size: 12px;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              border: 2px solid #1e293b;
              animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }
          `}</style>

          <div className="bell-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-slate-600 dark:text-white ${notificationCount > 0 ? 'bell-animation' : ''}`}
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>

            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>

          <div
            className={
              'notification-dropdown dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white border-gray-200 text-gray-800'
            }
          >
            <div
              className={
                'px-4 py-3 dark:bg-slate-800 dark:border-slate-600 dark:text-white bg-slate-100 border-gray-200 text-gray-800 border-b flex justify-between items-center'
              }
            >
              <h3 className="font-bold text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                {t('notifications', 'Notifications')} <span dir="ltr">({notificationCount})</span>
              </h3>

              <button
                onClick={() => {
                  markAllNotificationsAsRead();
                }}
                className={
                  'text-xs dark:bg-slate-600 dark:text-slate-100 dark:hover:text-blue-300 text-blue-600 hover:text-blue-800 font-medium'
                }
              >
                {t('markAllAsRead', 'Mark all as read')}
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className={'p-4 text-center dark:text-gray-300 text-gray-500'}>
                  {t('loadingNotifications', 'Loading notifications...')}
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : notifications.length === 0 ? (
                <div className={'p-4 text-center  dark:text-gray-300 text-gray-500'}>
                  {t('noNotifications', 'No notifications')}
                </div>
              ) : (
                notifications
                  .slice()
                  .reverse()
                  .map((notification, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (!notification.read) markNotificationAsRead(notification._id);
                      }}
                      className={`px-4 py-3 border-b cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-gray-200'
                          : 'border-gray-100 hover:bg-gray-50 text-gray-800'
                      } transition-colors flex items-start gap-3 text-left ${
                        notification.read ? 'opacity-60' : ''
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 mt-1 w-8 h-8 ${getTypeStyle(
                          notification.type
                        )} rounded-full flex items-center justify-center`}
                      >
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          } mt-1`}
                        >
                          {notification.time}
                        </p>
                      </div>

                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Student profile */}
        <div
          className={`flex items-center gap-3 ${
            isRTL ? 'pl-4 border-l' : 'pr-4 border-r'
          } border-slate-500`}
        >
          <div className={`flex flex-col ${isRTL ? 'items-start text-start' : 'items-end text-end'}`}>
            <span className="font-medium dark:text-gray-200">{student?.username || t('user', 'User')}</span>
            <span className="text-xs dark:text-gray-300">{t('student', 'Student')}</span>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400 flex items-center justify-center bg-white">
            {getProfileImage()}
          </div>
        </div>

        {/* Logout */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-log-out"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span>{t('logout', 'Logout')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;