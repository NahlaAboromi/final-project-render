// C:\Users\n0502\OneDrive\שולחן העבודה\final_project\hw2-frontend\src\components\LanguageSwitcher.jsx
import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../DarkLightMood/ThemeContext";

export default function LanguageSwitcher({ compact = false, disabled = false, title }) {
  const { lang, setLang } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div 
      style={{
        direction: 'ltr', 
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        padding: '4px',
        borderRadius: '10px',
        background: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.5)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.5)'}`,
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      title={title}
    >
      {/* Sliding background indicator */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          bottom: '4px',
          left: '4px',
          width: compact ? '36px' : '44px',
          borderRadius: '8px',
          background: isDark 
            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          boxShadow: isDark
            ? '0 2px 8px rgba(59, 130, 246, 0.3)'
            : '0 2px 8px rgba(59, 130, 246, 0.2)',
          transform: lang === 'he' 
            ? 'translateX(0)' 
            : `translateX(${compact ? 40 : 48}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Hebrew Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setLang("he")}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: compact ? 36 : 44,
          height: compact ? 28 : 34,
          borderRadius: '8px',
          color: lang === 'he' 
            ? '#ffffff'
            : isDark ? 'rgba(248, 250, 252, 0.6)' : 'rgba(30, 41, 59, 0.6)',
          fontSize: compact ? '13px' : '14px',
          fontWeight: lang === 'he' ? 600 : 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          letterSpacing: '0.3px',
          border: 'none',
          background: 'transparent',
          transition: 'all 0.3s ease',
        }}
      >
        עב
      </button>

      {/* English Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setLang("en")}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: compact ? 36 : 44,
          height: compact ? 28 : 34,
          borderRadius: '8px',
          color: lang === 'en' 
            ? '#ffffff'
            : isDark ? 'rgba(248, 250, 252, 0.6)' : 'rgba(30, 41, 59, 0.6)',
          fontSize: compact ? '13px' : '14px',
          fontWeight: lang === 'en' ? 600 : 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          letterSpacing: '0.3px',
          border: 'none',
          background: 'transparent',
          transition: 'all 0.3s ease',
        }}
      >
        EN
      </button>
    </div>
  );
}