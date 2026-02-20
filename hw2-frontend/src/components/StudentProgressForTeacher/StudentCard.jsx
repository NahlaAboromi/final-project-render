import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const defaultAvatar = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const StudentCard = ({ student }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { t, dir, lang } = useI18n('studentCard');
  const { lang: currentLang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = currentLang === 'he';

  const {
    id,
    username = 'Unknown Student',
    profilePic,
    averageScore = 0,
    uniqueSimulations = 0,
    totalAttempts = 0,
    latestActivity,
    overallScore
  } = student;

  useEffect(() => {
    console.log('📌 StudentCard received student:', student);
  }, [student]);

  const studentState = {
    id,
    username,
    profilePic,
    averageScore,
    uniqueSimulations,
    totalAttempts,
    overallScore
  };

  return (
    <div
      dir={dir}
      lang={lang}
      className={`rounded-lg shadow-md p-4 sm:p-6 w-full sm:w-[300px] ${
        isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-800'
      }`}
    >
      {/* תמונת סטודנט וכותרת */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <img
            src={profilePic && profilePic !== 'default_empty_profile_pic' ? profilePic : defaultAvatar}
            alt={t('profileAlt')}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border flex-shrink-0 ${
              isDark ? 'border-gray-600' : 'border-gray-300'
            }`}
            onError={(e) => {
              e.target.src = defaultAvatar;
              e.target.onerror = null;
            }}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold truncate" title={username}>
              {username}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {t('studentId')}: {id}
            </p>
          </div>
        </div>
        <div className="text-base sm:text-lg font-bold text-yellow-600 whitespace-nowrap flex-shrink-0">
          {averageScore}/5
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div className={`text-xs sm:text-sm mb-3 sm:mb-4 space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        <p>
          {t('uniqueSimulations')}: <strong>{uniqueSimulations}</strong>
        </p>
        <p>
          {t('totalAttempts')}: <strong>{totalAttempts}</strong>
        </p>
        <p className="break-words">
          {t('latestActivity')}:{" "}
          <strong>
            {latestActivity ? new Date(latestActivity).toLocaleString() : t('noActivity')}
          </strong>
        </p>
      </div>

      {/* מעבר לפרטי הסטודנט */}
      <Link
        to={`/progress-of-chosen-student/${id}`}
        state={{ student: studentState }}
        onClick={() => {
          console.log('🚀 Navigating to student details with state:', studentState);
        }}
        className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-2 sm:py-2.5 rounded mt-3 sm:mt-4 font-semibold text-sm sm:text-base transition-colors"
      >
        {t('viewDetails')}
      </Link>
    </div>
  );
};

export default StudentCard;