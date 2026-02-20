import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/**
 * ExportButton renders a button for exporting content (typically as PDF).
 * Fully supports RTL & localized tooltips.
 */
const ExportButton = ({ onExport, isExporting, isDark }) => {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('exportButton');

  if (!ready) return null;

  return (
    <button
      onClick={onExport}
      disabled={isExporting}
      dir={dir}
      lang={lang}
      // ✅ שינוי כאן – אם השפה עברית (RTL) אז הצד הוא left, אחרת right
      className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} z-10 px-3 py-1 text-xs rounded-md transition-colors ${
        isDark
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={t('tooltip')}
    >
      {isExporting ? t('exporting') : t('export')}
    </button>
  );
};

export default ExportButton;
