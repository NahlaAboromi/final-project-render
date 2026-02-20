// src/teacher/ClassForm.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNotifications } from '../context/NotificationsContext';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n';

const ClassForm = () => {
  const { user } = useContext(UserContext);
  const { fetchNotifications } = useNotifications();
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = lang === 'he';
  const { t } = useI18n('classForm');
const language = lang === 'he' ? 'he' : 'en';

  const [formData, setFormData] = useState({
    classCode: '',
    className: '',
    topic: '',
    customTopic: '',
    useCustomTopic: false,
  });

  const [errors, setErrors] = useState({
    classCode: false,
    className: false,
    topic: false,
  });

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [situation, setSituation] = useState('');
  const [question, setQuestion] = useState('');
  const [generatedSituations, setGeneratedSituations] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ===== Topics: keep backend values; map labels from dict =====
  const additionalTopics = [
    { value: 'teamwork', dictKey: 'teamwork' },
    { value: 'conflict-resolution', dictKey: 'conflictResolution' },
    { value: 'empathy', dictKey: 'empathy' },
    { value: 'emotional-intelligence', dictKey: 'emotionalIntelligence' },
    { value: 'communication', dictKey: 'communication' },
    { value: 'leadership', dictKey: 'leadership' },
    { value: 'stress-management', dictKey: 'stressManagement' },
    { value: 'cultural-awareness', dictKey: 'culturalAwareness' },
  ];

  // ===== Toasts (texts via i18n) =====
  const showSuccessToast = (message) => {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-bounce z-50';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const showErrorToast = (message) => {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded shadow-lg animate-bounce z-50';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // ===== Handlers =====
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) setErrors({ ...errors, [id]: false });
  };

  const handleTopicChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, topic: value });
    if (errors.topic) setErrors({ ...errors, topic: false });
  };

  const validateFirstStep = () => {
    const classCode = formData.classCode.trim();
    const className = formData.className.trim();
    const selectedTopic = formData.useCustomTopic
      ? formData.customTopic.trim()
      : formData.topic;

    const newErrors = {
      classCode: !classCode,
      className: !className,
      topic: !selectedTopic,
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      showErrorToast(t('toasts.fillAll'));
      return false;
    }
    return true;
  };

  // ===== API calls =====
  const generateSituation = async () => {
    if (step === 1 && !validateFirstStep()) return;

    setIsLoading(true);
    setLoadingAction('generating');

    const selectedTopic = formData.useCustomTopic
      ? formData.customTopic.trim()
      : formData.topic;

    try {
      const response = await fetch('/api/claude/generate-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
          'X-Teacher-Lang': language,
        },
        body: JSON.stringify({
          topic: selectedTopic,
          maxWords: 50,
          previousSituations: generatedSituations,
          language,   
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t('toasts.failGenerate'));

      setSituation(data.situation);
      setQuestion(data.question);
      setGeneratedSituations((prev) => prev + 1);

      if (step === 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep(2);
          setIsTransitioning(false);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error generating situation:', error);
      showErrorToast(`${t('toasts.failGenerate')}: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const createClass = async () => {
    setIsLoading(true);
    setLoadingAction('creating');

    try {
      const classCode = formData.classCode.trim();
      const className = formData.className.trim();
      const selectedTopic = formData.useCustomTopic
        ? formData.customTopic.trim()
        : formData.topic;

      const classResponse = await fetch('/api/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classCode,
          className,
          subject: selectedTopic,
          situation,
          question,
          createdBy: user.id,
        }),
      });

      const classData = await classResponse.json();
      if (!classResponse.ok) throw new Error(classData.message || 'Error creating class');

      // Notifications (נשאר באנגלית כדי לא לשנות לוגיקה/פורמט קיים)
      await fetch('/api/notifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.id,
          type: 'success',
          // אנגלית – לטבלת Notification הרגילה
          title: `Class ${formData.classCode} created successfully`,
          // עברית – לטבלת HebrewNotification
          titleHe: `הכיתה ${formData.classCode} נוצרה בהצלחה`,
          content: `A situational question about "${selectedTopic}" is ready for students.`,
          time: new Date().toLocaleString(),
          read: false,
        }),
      });


      await fetchNotifications();
      showSuccessToast(t('toasts.classCreated'));
      resetForm();
    } catch (error) {
      console.error('❌ Error creating class:', error);
const rawMessage = error.message || '';
const isCodeExists = rawMessage.includes('Class Code already exists');
const titleEn = isCodeExists
     ? 'Failed to create class: Class code already exists. Please choose a different code.'
     : `Failed to create class: ${rawMessage}`;
const titleHe = isCodeExists
    ? 'יצירת הכיתה נכשלה: קוד הכיתה כבר קיים. נא לבחור קוד אחר.'
    : `יצירת הכיתה נכשלה: ${rawMessage}`;
      await fetch('/api/notifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.id,
          type: 'warning',
          // אנגלית – לטבלת Notification
          title: titleEn,
          // עברית – לטבלת HebrewNotification
          titleHe: titleHe,
          time: new Date().toLocaleString(),
          read: false,
        }),
      });


      await fetchNotifications();
      showErrorToast(`${t('toasts.error')}: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const resetForm = () => {
    setFormData({
      classCode: '',
      className: '',
      topic: '',
      customTopic: '',
      useCustomTopic: false,
    });
    setErrors({ classCode: false, className: false, topic: false });
    setStep(1);
    setSituation('');
    setQuestion('');
    setGeneratedSituations(0);
    setLoadingAction('');
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-5 w-5 mr-2 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      className={`w-full transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Steps header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className={`text-sm font-medium ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
            {t('steps.step1')}
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
          <div className={`text-sm font-medium ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
            {t('steps.step2')}
          </div>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <form id="classForm" className="w-full space-y-4">
          <div className="mb-4">
            <label className="block mb-1 font-medium">{t('labels.classCode')}</label>
            <input
              type="text"
              id="classCode"
              className={`w-full p-2 border rounded dark:bg-slate-700 dark:text-white ${
                errors.classCode ? 'border-red-500 bg-red-50 dark:bg-red-900' : ''
              }`}
              placeholder={t('placeholders.classCode')}
              value={formData.classCode}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">{t('labels.className')}</label>
            <input
              type="text"
              id="className"
              className={`w-full p-2 border rounded dark:bg-slate-700 dark:text-white ${
                errors.className ? 'border-red-500 bg-red-50 dark:bg-red-900' : ''
              }`}
              placeholder={t('placeholders.className')}
              value={formData.className}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">{t('labels.selectTopic')}</label>
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">{t('hints.chooseOrCustom')}</div>

            <div className="flex mb-4 border-b">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, useCustomTopic: false })}
                className={`py-2 px-4 ${
                  !formData.useCustomTopic
                    ? 'border-b-2 font-medium text-blue-600 dark:bg-gray-600 dark:text-blue-500'
                    : 'text-gray-500 hover:text-gray-700 dark:bg-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                disabled={isLoading}
              >
                {t('tabs.fromList')}
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, useCustomTopic: true })}
                className={`py-2 px-4 ${
                  !formData.useCustomTopic
                    ? 'text-gray-500 dark:bg-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    : 'border-b-2 font-medium text-blue-600 dark:bg-gray-600 dark:text-blue-500'
                }`}
                disabled={isLoading}
              >
                {t('tabs.custom')}
              </button>
            </div>

            {!formData.useCustomTopic ? (
              <select
                id="topic"
                className={`w-full p-2 border rounded dark:bg-slate-700 dark:text-white ${
                  errors.topic ? 'border-red-500 bg-red-50 dark:bg-red-900' : ''
                }`}
                value={formData.topic}
                onChange={handleTopicChange}
                disabled={isLoading}
              >
                <option value="">{t('dropdown.selectPlaceholder')}</option>
                <optgroup label={t('dropdown.groupTopics')}>
                  {additionalTopics.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(`topics.${opt.dictKey}`)}
                    </option>
                  ))}
                </optgroup>
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  id="customTopic"
                  className={`w-full p-2 border rounded dark:bg-slate-700 dark:text-white ${
                    errors.topic ? 'border-red-500 bg-red-50 dark:bg-red-900' : ''
                  }`}
                  placeholder={t('placeholders.customTopic')}
                  value={formData.customTopic}
                  onChange={(e) => {
                    setFormData({ ...formData, customTopic: e.target.value });
                    if (errors.topic) setErrors({ ...errors, topic: false });
                  }}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('hints.customExplain')}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={generateSituation}
            className={`mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full flex justify-center items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
            title={t('buttons.generate')}
          >
            {isLoading && loadingAction === 'generating' ? (
              <>
                <LoadingSpinner />
                <span>{t('buttons.generating')}</span>
              </>
            ) : (
              t('buttons.generate')
            )}
          </button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">{t('review.title')}</h3>

          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow border border-gray-200 dark:border-slate-600">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('review.situation')}</h4>
            <div className="min-h-24">
              {situation ? (
                <p className="text-gray-800 dark:text-white mb-4">{situation}</p>
              ) : (
                <p className="text-gray-400">{t('review.noSituation')}</p>
              )}
            </div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('review.question')}</h4>
            <div className="min-h-12">
              {question ? (
                <p className="text-gray-800 dark:text-white">{question}</p>
              ) : (
                <p className="text-gray-400">{t('review.noQuestion')}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={generateSituation}
            className={`bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 flex items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
            title={t('buttons.regenerate')}
          >
            {isLoading && loadingAction === 'generating' ? (
              <>
                <LoadingSpinner />
                <span>{t('buttons.regenerating')}</span>
              </>
            ) : (
              t('buttons.regenerate')
            )}
          </button>

          <button
            type="button"
            onClick={createClass}
            className={`bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full flex justify-center items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
            title={t('buttons.approveCreate')}
          >
            {isLoading && loadingAction === 'creating' ? (
              <>
                <LoadingSpinner />
                <span>{t('buttons.creating')}</span>
              </>
            ) : (
              t('buttons.approveCreate')
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-blue-600 hover:underline mt-2"
            disabled={isLoading}
            title={t('buttons.backToEdit')}
          >
            {t('buttons.backToEdit')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassForm;
