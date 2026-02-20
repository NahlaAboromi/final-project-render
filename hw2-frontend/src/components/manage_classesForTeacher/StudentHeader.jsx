import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/**
 * StudentHeader
 * Displays student's profile image, name, ID, and completed simulations count.
 */
const StudentHeader = ({
  profilePic,
  onImageError,
  username,
  studentId,
  simulationCount,
  isDark
}) => {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('studentHeader');
  if (!ready) return null;

  const name = username || t('unknown');
  const simsText =
    simulationCount === 1
      ? t('simulationsOne')
      : (t('simulationsMany') || '').replace('{n}', String(simulationCount));

  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4" dir={dir} lang={lang}>
      {/* Student profile image - רספונסיבי */}
      <img
        src={profilePic}
        onError={onImageError}
        alt="Profile"
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 object-cover ${
          isDark ? 'border-slate-500' : 'border-gray-300'
        }`}
      />

      <div className="flex-1 min-w-0">
        {/* Student's name - רספונסיבי */}
        <p className="text-sm sm:text-base font-semibold truncate">{name}</p>

        {/* Student ID - רספונסיבי */}
        <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {t('studentId')} {studentId}
        </p>

        {/* Completed simulations - רספונסיבי */}
        <p className="text-xs sm:text-sm">{simsText}</p>
      </div>
    </div>
  );
};

export default StudentHeader;