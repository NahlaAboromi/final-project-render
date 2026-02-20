// src/components/Button.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

const Button = ({
  children,
  type = 'button',
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'primary',    // 'primary' | 'secondary' | 'danger'
  fullWidth = false,
  className = '',
  loadingLabel,           // ✅ אופציונלי: טקסט טעינה ידני
}) => {
  const { theme } = useContext(ThemeContext);
  const { lang }  = useContext(LanguageContext);
  const isDark = theme === 'dark';

  // ✅ טקסט טעינה לפי שפה (או לפי prop אם הועבר)
  const loadingText = loadingLabel ?? (lang === 'he' ? '. טוען' : '...Loading');

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `${isDark ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                         : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'} text-white`;
      case 'secondary':
        return `${isDark ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                         : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-400'} ${isDark ? 'text-white' : 'text-gray-900'}`;
      case 'danger':
        return `${isDark ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                         : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'} text-white`;
      default:
        return `${isDark ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                         : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'} text-white`;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      aria-busy={isLoading ? 'true' : 'false'}
      aria-live="polite"
      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium
        ${getVariantStyles()}
        ${isLoading || disabled ? 'opacity-70 cursor-not-allowed' : ''}
        ${fullWidth ? 'w-full' : ''}
        focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out
        ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
