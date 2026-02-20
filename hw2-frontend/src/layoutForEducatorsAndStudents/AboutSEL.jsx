import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { translateUI } from "../utils/translateUI";

const AboutModal = ({ label }) => {
  const [showModal, setShowModal] = useState(false);
  const { lang } = useContext(LanguageContext);
  const isRTL = lang === "he";

  // 🌐 טקסטים באנגלית בלבד
  const SOURCE = {
    link: "About SEL",
    title: "About SEL",
    intro:
      "Social and Emotional Learning (SEL) is the process through which individuals develop self-awareness, self-control, interpersonal skills, and decision-making abilities. SEL is essential for success in school, work, and life.",
    c1: "🌟 Self-awareness",
    c2: "👥 Social-awareness",
    c3: "🧘 Self-management",
    c4: "🤝 Relationship Skills",
    c5: "🧠 Responsible decision-making",
    close: "Close",
  };

  const [T, setT] = useState(SOURCE);

  // תרגום דינמי לפי השפה
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
      {/* 🔗 קישור לפתיחת המודל */}
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

      {/* 🔳 תוכן המודל */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-11/12 max-w-md text-slate-800 dark:text-white ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">{T.title}</h2>
            <p className="text-sm leading-6 mb-4">{T.intro}</p>

            <ul className="pl-5 mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-100">
              <li className="flex items-center gap-2">{T.c1}</li>
              <li className="flex items-center gap-2">{T.c2}</li>
              <li className="flex items-center gap-2">{T.c3}</li>
              <li className="flex items-center gap-2">{T.c4}</li>
              <li className="flex items-center gap-2">{T.c5}</li>
            </ul>

            {/* 🔘 כפתור סגירה */}
            <div className={`mt-6 ${isRTL ? "text-left" : "text-right"}`}>
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

export default AboutModal;
