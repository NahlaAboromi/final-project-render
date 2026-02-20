import React, { useState, useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/**
 * SimulationBox component displays the simulation situation and question,
 * and provides a button to request an overall AI class insight.
 * Fully supports Hebrew/English and RTL layout.
 */
const SimulationBox = ({ simulationText, situation, onGetClassInsight }) => {
  const [loading, setLoading] = useState(false);

  // ✅ language / direction
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('simulationBox');

  if (!ready) return null;

  const handleInsightClick = async () => {
    setLoading(true);
    await onGetClassInsight();
    setLoading(false);
  };

  return (
    <div className="mb-4 sm:mb-6 p-4 sm:p-6 rounded bg-white dark:bg-slate-700 shadow" dir={dir} lang={lang}>
      {/* Situation - רספונסיבי */}
      <h2 className="text-lg sm:text-xl font-semibold mb-2">{t('situationTitle')}</h2>
      <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">{situation}</p>

      {/* Question - רספונסיבי */}
      <h2 className="text-lg sm:text-xl font-semibold mb-2">{t('questionTitle')}</h2>
      <p className="mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{simulationText}</p>

      {/* Button - רספונסיבי */}
      <div className="flex gap-4 items-center justify-start">
        <button
          onClick={handleInsightClick}
          disabled={loading}
          title={t('tooltip')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded text-white transition text-sm sm:text-base w-full sm:w-auto
            ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading && (
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
          )}
          <span>{loading ? t('buttonLoading') : t('buttonDefault')}</span>
        </button>
      </div>
    </div>
  );
};

export default SimulationBox;