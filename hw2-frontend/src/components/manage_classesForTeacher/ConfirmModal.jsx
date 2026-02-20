import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/**
 * ConfirmModal component displays a modal dialog for confirming critical actions.
 */
const ConfirmModal = ({
  title,
  description,
  confirmText,
  cancelText,
  isOpen,
  isProcessing = false,
  onConfirm,
  onCancel
}) => {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('confirmModal');
  if (!ready || !isOpen) return null;

  return (
    <div dir={dir} lang={lang} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
          {title || t('title')}
        </h2>

        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:text-white"
          >
            {cancelText || t('cancelText')}
          </button>

          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-sm rounded text-white ${
              isProcessing
                ? 'bg-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isProcessing ? t('deleting') : (confirmText || t('confirmText'))}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
