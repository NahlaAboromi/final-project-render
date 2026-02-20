import React, { useContext } from 'react';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { useI18n } from '../../utils/i18n';

const defaultAvatar =
  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const StudentOverviewHeader = ({ student, isDark }) => {
  const { theme } = useContext(ThemeContext);
  const themeIsDark = isDark || theme === 'dark';
  const mutedText = themeIsDark ? 'text-gray-300' : 'text-gray-600';

  const { t, dir, lang } = useI18n('studentOverview');

  if (!student) return null;

  const {
    id,
    username = 'Unknown Student',
    profilePic,
    classes = [],
    totalAttempts = 0,
    uniqueSimulations = 0,
    averageScore = 0
  } = student;

  const classWord = classes.length === 1 ? t('classOne') : t('classMany');
  const enrolledLine = `${t('enrolledIn')} ${classes.length} ${classWord}`;

  return (
    <div
      dir={dir}
      lang={lang}
      className={`rounded-lg shadow-md p-4 sm:p-6 w-full mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 ${
        themeIsDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-800'
      }`}
    >
      {/* תמונה ומידע עליון - שורה אחת במובייל */}
      <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
        {/* תמונת פרופיל */}
        <img
          src={
            profilePic && profilePic !== 'default_empty_profile_pic'
              ? profilePic
              : defaultAvatar
          }
          alt={t('profileAlt')}
          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border flex-shrink-0 ${
            themeIsDark ? 'border-gray-600' : 'border-gray-300'
          }`}
          onError={(e) => {
            e.target.src = defaultAvatar;
            e.target.onerror = null;
          }}
        />

        {/* מידע על הסטודנט */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h2 className="text-base sm:text-xl font-bold mb-1 truncate">
            {username} — {t('detailedProgress')}
          </h2>
          <p className={`text-xs sm:text-sm ${mutedText}`}>
            {t('studentId')}: {id}
          </p>
          <p className={`text-xs sm:text-sm ${mutedText}`}>
            {enrolledLine}
          </p>
        </div>
      </div>

      {/* סטטיסטיקות - גריד במובייל, שורה בטאבלט */}
      <div
        className={`w-full sm:w-auto sm:ml-auto grid grid-cols-3 sm:flex gap-3 sm:gap-6 lg:gap-8 text-center text-xs sm:text-sm ${
          dir === 'rtl' ? 'sm:space-x-reverse' : ''
        }`}
      >
        <div>
          <div className="text-blue-600 font-bold text-base sm:text-lg">{totalAttempts}</div>
          <div className={`${mutedText} leading-tight`}>{t('totalSubmissions')}</div>
        </div>
        <div>
          <div className="text-green-600 font-bold text-base sm:text-lg">{uniqueSimulations}</div>
          <div className={`${mutedText} leading-tight`}>{t('uniqueSimulations')}</div>
        </div>
        <div>
          <div className="text-yellow-600 font-bold text-base sm:text-lg">{averageScore}/5</div>
          <div className={`${mutedText} leading-tight`}>{t('averageScore')}</div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewHeader;