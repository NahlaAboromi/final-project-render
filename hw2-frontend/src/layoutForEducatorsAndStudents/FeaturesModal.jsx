import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { translateUI } from "../utils/translateUI";

const FeaturesModal = ({ label }) => {
  const [showModal, setShowModal] = useState(false);
  const { lang } = useContext(LanguageContext);
  const isRTL = lang === "he";

  // 🔤 טקסטים באנגלית בלבד
  const SOURCE = {
    featuresTitle: "📋 Key Features",
    f1: "Educator and student management",
    f2: "Export progress reports as PDF",
    f3: "Interactive performance charts",
    f4: "Per-class statistics and summaries",
    f5: "Dark mode support 🌙",
    close: "Close",
    link: "Features",
  };

  const [T, setT] = useState(SOURCE);

  // תרגום דינמי אם השפה היא עברית
  useEffect(() => {
    let cancelled = false;
    async function loadTranslations() {
      if (lang === "he") {
        const keys = Object.keys(SOURCE);
        const values = Object.values(SOURCE);
        try {
          const translated = await translateUI({
            sourceLang: "EN",
            targetLang: "HE",
            texts: values,
          });
          if (!cancelled) {
            const map = {};
keys.forEach((k, i) => (map[k] = translated[i]));

// 🟢 תיקון ידני למילים מסוימות בעברית
if (lang === "he") {
  const fixHebrew = (txt = "") =>
    txt
      .replace(/מחנכים/g, "מרצים")
      .replace(/מורים/g, "מרצים")
      .replace(/תלמידים/g, "סטודנטים")
      .replace(/התלמידים/g, "הסטודנטים");

  map.f1 = fixHebrew(map.f1);
  map.f2 = fixHebrew(map.f2);
  map.f3 = fixHebrew(map.f3);
  map.f4 = fixHebrew(map.f4);
  map.f5 = fixHebrew(map.f5);
}

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
    <div dir={isRTL ? "rtl" : "ltr"} lang={lang}>
      {/* 🔗 לינק לפתיחת המודל */}
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
        className="hover:text-blue-500"
      >
        {label || T.link}
      </Link>

      {/* 🔳 מודל */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-11/12 max-w-md text-slate-800 dark:text-white ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">{T.featuresTitle}</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>{T.f1}</li>
              <li>{T.f2}</li>
              <li>{T.f3}</li>
              <li>{T.f4}</li>
              <li>{T.f5}</li>
            </ul>

            {/* 🔘 כפתור סגירה */}
            <div
              className={`mt-6 ${
                isRTL ? "text-left" : "text-right"
              }`}
            >
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {T.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesModal;
