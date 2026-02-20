import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import { LanguageContext } from "../../context/LanguageContext";
import { useI18n } from "../../utils/i18n";



/**
 * ClassCard component displays a summary card for a class,
 * including statistics and actions such as view, reports, and delete.
 */
const ClassCard = ({ classData, onDeleteSuccess }) => {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = lang === 'he';
  const locale = lang === 'he' ? 'he-IL' : 'en-US';
  const { t, ready } = useI18n('classCard');

  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guard קטן למניעת הבהוב מפתחות
  if (!ready) return null;

  // Formats a date string to a readable localized format
  const formatDate = (dateString) => {
    if (!dateString) return t('misc.unknown');
    const date = new Date(dateString);
    if (isNaN(date)) return t('misc.unknown');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(locale, options);
  };

  // Returns a Tailwind background color class based on the percentage
  const getGradeColorClass = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get the list of students (or empty array if missing)
  const students = classData.studentsTaken || [];

  // Filter only students who have a valid overallScore
  const studentsWithScores = students.filter(
    (student) => student.analysisResult && typeof student.analysisResult.overallScore === 'number'
  );

  // Count unique students by their studentId
  const uniqueStudentIds = new Set();
  students.forEach((student) => {
    if (student.studentId) uniqueStudentIds.add(student.studentId);
  });
  const totalStudents = uniqueStudentIds.size;

  // Average SEL score (out of 5)
  const averageScore =
    studentsWithScores.length > 0
      ? (
          studentsWithScores.reduce(
            (sum, student) => sum + student.analysisResult.overallScore,
            0
          ) / studentsWithScores.length
        ).toFixed(1)
      : '0.0';

  // Convert to percentage
  const averageScorePercent = Math.round((parseFloat(averageScore) / 5) * 100);

  // Total attempts across all students
  const totalAttempts = students.reduce((sum, student) => {
    if (Array.isArray(student.simulations)) {
      return sum + student.simulations.length;
    } else if (student.analysisResult && typeof student.analysisResult.overallScore === 'number') {
      return sum + 1;
    }
    return sum;
  }, 0);

  // Unique students with attempts or score
  const studentIdsWithAttempts = new Set();
  students.forEach((student) => {
    const hasSimulations = Array.isArray(student.simulations) && student.simulations.length > 0;
    const hasScore = student.analysisResult && typeof student.analysisResult.overallScore === 'number';
    if (hasSimulations || hasScore) {
      if (student.studentId) studentIdsWithAttempts.add(student.studentId);
      else if (student._id) studentIdsWithAttempts.add(student._id);
      else studentIdsWithAttempts.add(JSON.stringify(student));
    }
  });
  const uniqueStudents = studentIdsWithAttempts.size;

  // Delete handler
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/classes/delete/${classData.classCode}`, { method: 'DELETE' });
      const data = await response.json();

      if (response.ok) {
        setShowConfirm(false);
        onDeleteSuccess(classData.classCode);
      } else {
        alert(t('toasts.deleteError') + ': ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert(t('toasts.serverError'));
    } finally {
      setIsDeleting(false);
    }
  };

  // טקסטים עם מספרים—בלי פלורליזציה חכמה כדי לא לשנות util:
  const studentsBadgeText =
    lang === 'he'
      ? `${totalStudents} ${t('badges.students_he')}`
      : `${totalStudents} ${t('badges.students_en')}`;

  const attemptsTitle = t('stats.attemptsTitle');
  const attemptsLine =
    lang === 'he'
      ? `${totalAttempts} ${t('stats.attempts_he')}`
      : `${totalAttempts} ${t('stats.attempts_en', '')}${totalAttempts !== 1 ? 's' : ''}`;

  const completedByLine =
    lang === 'he'
      ? `${t('stats.completedBy_he.prefix')} ${uniqueStudents} ${t('stats.completedBy_he.suffix')}`
      : `${t('stats.completedBy_en.prefix')} ${uniqueStudents} ${t('stats.completedBy_en.suffix')}${uniqueStudents !== 1 ? 's' : ''}`;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} lang={lang} className="bg-white dark:bg-slate-700 rounded shadow class-card relative">
      {/* Header - רספונסיבי */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {classData.classCode}: {classData.className}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('header.created')}: {formatDate(classData.createdAt)}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 text-xs font-medium py-1 px-2 rounded">
            {t('badges.active')}
          </span>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs font-medium py-1 px-2 rounded">
            {studentsBadgeText}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* Subject - רספונסיבי */}
        {classData.subject && (
          <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100 text-xs font-medium py-1 px-2 rounded">
              {classData.subject}
            </span>
          </div>
        )}

        {/* No students */}
        {totalStudents === 0 && (
          <p className="text-xs sm:text-sm text-gray-400 italic mb-3 sm:mb-4">{t('empty.noStudents')}</p>
        )}

        {/* Stats - רספונסיבי */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* Attempts summary */}
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
            <h3 className="font-bold text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
              {attemptsTitle}
            </h3>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {attemptsLine}
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              {completedByLine}
            </p>
          </div>

          {/* Average SEL score */}
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
            <h3 className="font-bold text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
              {t('stats.avgSelTitle')}
            </h3>
            <div className="flex items-center justify-between mb-1">
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {averageScore} / 5
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t('stats.avgSelLabel')}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 sm:h-3">
              <div
                className={`${getGradeColorClass(averageScorePercent)} h-2 sm:h-3 rounded-full`}
                style={{ width: `${averageScorePercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Actions - רספונסיבי */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-2">
          <Link to={`/teacher/class/${encodeURIComponent(classData.classCode)}`} className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-1 px-4 sm:px-3 rounded text-sm">
              {t('actions.view')}
            </button>
          </Link>

          <Link to={`/teacher/class/${encodeURIComponent(classData.classCode)}/reports`} className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white py-2 sm:py-1 px-4 sm:px-3 rounded text-sm">
              {t('actions.reports')}
            </button>
          </Link>

          <button
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white py-2 sm:py-1 px-4 sm:px-3 rounded text-sm"
            onClick={() => setShowConfirm(true)}
          >
            {t('actions.delete')}
          </button>
        </div>
      </div>

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={showConfirm}
        title={t('modal.title')}
        description={t('modal.desc')}
        confirmText={t('modal.confirm')}
        cancelText={t('modal.cancel')}
        isProcessing={isDeleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ClassCard