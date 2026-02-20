// src/Research/ValidatedQuestionnaireButton.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { translateUI } from '../utils/translateUI';

/**
 * Button that navigates to the validated (POST) questionnaire.
 *
 * Props:
 * - anonId: string                // required (passed via route state)
 * - label?: string                // button text (default: "Continue to Validated Questionnaire")
 * - disabled?: boolean            // disable the button
 * - extraState?: object           // extra values to pass in navigation state
 * - className?: string            // extra Tailwind classes for styling
 * - onClickBeforeNavigate?: fn    // optional sync hook before navigate
 */
export default function ValidatedQuestionnaireButton({
  anonId,
  label = 'Continue to Validated Questionnaire',
  disabled = false,
  extraState = {},
  className = '',
  onClickBeforeNavigate,
}) {
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);
  const [translatedLabel, setTranslatedLabel] = useState(label);

  // 🈶 תרגום דינמי לפי שפה
  useEffect(() => {
    let cancelled = false;
    async function loadTranslation() {
      if (lang === 'he') {
        try {
          const res = await translateUI({
            sourceLang: 'EN',
            targetLang: 'HE',
            texts: [label],
          });
          if (!cancelled) setTranslatedLabel(res[0] || label);
        } catch {
          if (!cancelled) setTranslatedLabel(label);
        }
      } else {
        setTranslatedLabel(label);
      }
    }
    loadTranslation();
    return () => { cancelled = true; };
  }, [lang, label]);

  const handleClick = () => {
    if (typeof onClickBeforeNavigate === 'function') {
      onClickBeforeNavigate();
    }

    // 🚀 Navigate to the validated questionnaire (POST phase)
    navigate('/validated-questionnaire', {
      state: { anonId, phase: 'post', ...extraState },
    });
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={[
        'mt-4 px-5 py-2 rounded-xl font-medium transition text-sm md:text-base',
        disabled
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow',
        lang === 'he' ? 'font-bold tracking-tight' : '',
        className,
      ].join(' ')}
      aria-disabled={disabled ? 'true' : 'false'}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      {translatedLabel}
    </button>
  );
}
