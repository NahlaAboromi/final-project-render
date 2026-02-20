// src/context/LanguageContext.jsx
import React, { createContext, useState, useLayoutEffect } from "react";
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 1️⃣ קריאה מה-localStorage או ברירת מחדל לעברית
  const storedLang = localStorage.getItem("lang") || "he";
  const [lang, setLang] = useState(storedLang);

  // 2️⃣ כל פעם שהשפה משתנה – נעדכן את ה-HTML direction
useLayoutEffect(() => {    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang); // שומר גם באחסון המקומי
  }, [lang]);

  // 3️⃣ פונקציה פשוטה להחלפה בין אנגלית↔עברית
  const toggleLanguage = () => {
    setLang((prev) => (prev === "he" ? "en" : "he"));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
