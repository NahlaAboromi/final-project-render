// src/layoutForEducatorsAndStudents/SharedHeader.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import ThemeToggle from '../DarkLightMood/ThemeToggle';
import FeaturesModal from './FeaturesModal';
import AboutModal from './AboutSEL';
import { LanguageContext } from '../context/LanguageContext';
import { translateUI } from '../utils/translateUI';
import LanguageSwitcher from '../components/LanguageSwitcher';
const SharedHeader = () => {
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext);
  const isDark = theme === 'dark';
  const isRTL = lang === 'he';

  const SOURCE = {
    features: 'Features',
    about: 'About SEL',
    aiBadge: 'AI POWERED',
    brand: 'Edu Map',
  };

  const [T, setT] = useState(SOURCE);

  useEffect(() => {
    let cancelled = false;
    async function loadTranslations() {
      if (lang === 'he') {
        try {
          const keys = Object.keys(SOURCE);
          const values = Object.values(SOURCE);
          const translated = await translateUI({
            sourceLang: 'EN',
            targetLang: 'HE',
            texts: values,
          });
          if (!cancelled) {
            const map = {};
            keys.forEach((k, i) => (map[k] = translated[i]));
            setT(map);
          }
        } catch {
          if (!cancelled) setT(SOURCE);
        }
      } else {
        setT(SOURCE);
      }
    }
    loadTranslations();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return (
    <header
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      className={`
        w-full
        px-4 sm:px-6 py-3
        shadow-sm transition-all
        ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-b border-gray-200'}
        flex flex-col gap-3
        sm:flex-row sm:items-center sm:justify-between
      `}
    >

      {/* Left side (brand + badge) */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          {T.brand}
        </Link>
        <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-red-400 to-green-300 text-white">
          {T.aiBadge}
        </span>
      </div>

      {/* Right side (buttons) */}
      <div
        className={`
          flex flex-wrap items-center
          gap-3 sm:gap-6 text-sm font-semibold
          ${isRTL
            ? 'flex-row-reverse justify-center sm:justify-start'
            : 'justify-center sm:justify-end'}
        `}
      >
        <ThemeToggle />
        <LanguageSwitcher />
        <FeaturesModal label={T.features} />
        <AboutModal label={T.about} />
      </div>

    </header>
  );
};

export default SharedHeader;
