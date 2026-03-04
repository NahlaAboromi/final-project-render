// src/context/AnonymousStudentContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEYS = {
  student: "anon_student",
  sessionStart: "anon_sessionStart",
  questionnaire: "anon_questionnaire", // ← שומר את השאלון (both) פעם אחת
};

function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

const AnonymousStudentContext = createContext({
  // --- Student / Session ---
  student: null,
  setStudent: () => {},
  clearStudent: () => {},
  sessionStart: null,
  startSessionTimer: () => {},
  stopSessionTimer: () => {},

  // --- Questionnaire (validated CASEL) ---
  questionnaire: null,
  setQuestionnaire: () => {},
  clearQuestionnaire: () => {},
  loadQuestionnaire: async () => {}, // טוען פעם אחת מהשרת (phase=both)
});

export const AnonymousStudentProvider = ({ children }) => {
  // ✅ טוען סטודנט אנונימי מה-localStorage אם קיים
  const [student, setStudent] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.student);
    return raw ? safeParse(raw) : null;
  });

  // ⏱️ שחזור טיימר סשן אם קיים
  const [sessionStart, setSessionStart] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.sessionStart);
    return saved ? Number(saved) : null;
  });

  // ✅ טוען את השאלון (אם כבר קיים ב-LS) – זה השאלון האחיד (phase='both')
  const [questionnaire, setQuestionnaire] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.questionnaire);
    return raw ? safeParse(raw) : null;
  });

  // 🔄 כל שינוי ב-student נשמר אוטומטית ב-LS
  useEffect(() => {
    if (student) localStorage.setItem(STORAGE_KEYS.student, JSON.stringify(student));
    else localStorage.removeItem(STORAGE_KEYS.student);
  }, [student]);

  // 🔄 כל שינוי בשאלון נשמר אוטומטית ב-LS
  useEffect(() => {
    if (questionnaire) localStorage.setItem(STORAGE_KEYS.questionnaire, JSON.stringify(questionnaire));
    else localStorage.removeItem(STORAGE_KEYS.questionnaire);
  }, [questionnaire]);

  const clearStudent = () => {
    localStorage.removeItem(STORAGE_KEYS.student);
    setStudent(null);
  };

  const startSessionTimer = () => {
    const now = Date.now();
    setSessionStart(now);
    localStorage.setItem(STORAGE_KEYS.sessionStart, String(now));
  };

  const stopSessionTimer = async (anonId) => {
    localStorage.removeItem(STORAGE_KEYS.sessionStart);
    setSessionStart(null);
    if (anonId) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/anonymous/update-last-seen/${anonId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      } catch (e) {
        console.error("stopSessionTimer failed:", e);
      }
    }
  };

  // ❌ ניקוי השאלון
  const clearQuestionnaire = () => {
    localStorage.removeItem(STORAGE_KEYS.questionnaire);
    setQuestionnaire(null);
  };

  const loadQuestionnaire = async ({ lang = 'en', phase = 'both' } = {}) => {
    // אם כבר יש בקאש אבל לשפה אחרת — נרענן
    if (questionnaire?.items?.length && questionnaire?.lang === lang) {
      return questionnaire;
    }

   const res = await fetch(
     `${import.meta.env.VITE_API_URL}/api/questionnaires/casel?active=true&phase=${encodeURIComponent(phase)}&lang=${encodeURIComponent(lang)}`
    );
    if (!res.ok) throw new Error("Failed to load questionnaire");
const data = await res.json();
    // מיון שאלות לפי order ליתר ביטחון
    data.items = (data.items || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
data.lang = data.lang || lang;
    setQuestionnaire(data);
    return data;
  };

  return (
    <AnonymousStudentContext.Provider
      value={{
        // --- Student / Session ---
        student, setStudent, clearStudent,
        sessionStart, startSessionTimer, stopSessionTimer,

        // --- Questionnaire ---
        questionnaire,
        setQuestionnaire,
        clearQuestionnaire,
        loadQuestionnaire,
      }}
    >
      {children}
    </AnonymousStudentContext.Provider>
  );
};

export const useAnonymousStudent = () => useContext(AnonymousStudentContext);
export { useAnonymousStudent as useStudent };
