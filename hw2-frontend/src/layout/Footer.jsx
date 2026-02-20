// layout/Footer.jsx
import React from 'react'; 
/**
 * Footer is a simple, reusable footer component for the application.
 * It displays the current year and application name, and supports dark/light theme.
 */

const Footer = () => {
  // Render the footer with theme-aware styling and current year
  return (
    <footer className="p-4 text-center bg-slate-300 dark:bg-slate-700 rounded">
      &copy; {new Date().getFullYear()} Modular Skills Assessment Tool
    </footer>
  );
};

export default Footer;
