import React, { useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';

/**
 * Simple input component with optional label and error display.
 * Supports dark/light theme and read-only mode.
 */
const FormInput = ({ 
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  label,
  className = '',
  error = '',
  readOnly = false 
}) => {
    // Get theme from context to apply dark/light mode styles
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly} 
        className={`appearance-none block w-full px-3 py-3 border rounded-md 
          ${isDark ? 'bg-slate-700 border-slate-600 placeholder-slate-400' : 'border-gray-300 placeholder-gray-500 text-gray-900'} 
          ${error ? 'border-red-500' : ''}
          focus:outline-none focus:ring-blue-500 focus:border-blue-500
          ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
