// src/Research/UeqQuestionnaire.jsx
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AnonymousHeader from "./AnonymousHeader";
import Footer from "../layout/Footer";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import { useAnonymousStudent as useStudent } from "../context/AnonymousStudentContext";

import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";

const SCALE_VALUES = [1, 2, 3, 4, 5, 6, 7];

function UeqQuestionnaireContent() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { lang } = useContext(LanguageContext);
  const isRTL = lang === "he";

  const { t } = useI18n("ueqQuestionnaire");
  // תווית "שאלות" – תומך גם בעברית וגם באנגלית
  const rawQuestions = t("questions");
  const questionsLabel =
    lang === "he"
      ? (rawQuestions && rawQuestions !== "questions" ? rawQuestions : "שאלות")
      : (rawQuestions && rawQuestions !== "questions" ? rawQuestions : "questions");

  const { student } =
    typeof useStudent === "function"
      ? useStudent()
      : { student: null };
  const anonId = student?.anonId || null;

  const [alreadyDone, setAlreadyDone] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  const UEQ_CACHE_KEY =
    lang === "he"
      ? "ueq_questions_he_v1"
      : "ueq_questions_en_v1";

  useEffect(() => {
    if (!anonId) {
      setStatusChecked(true);
      return;
    }

    try {
      const key = `experienceQuestionnaireDone:${anonId}`;
      const flag = localStorage.getItem(key);
      if (flag === "1") {
        setAlreadyDone(true);
      }
    } catch (e) {
      console.warn("experienceQuestionnaireDone check failed:", e);
    } finally {
      setStatusChecked(true);
    }
  }, [anonId]);

  const [items, setItems] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
const [showHowTo, setShowHowTo] = useState(false);
const howToBtnLabel   = lang === "he" ? "איך לענות?" : "How to answer?";
const howToTitle      = lang === "he" ? "איך לענות על השאלון" : "How to answer the questionnaire";

const howToOkLabel    = lang === "he" ? "הבנתי" : "Got it";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(UEQ_CACHE_KEY);
      if (!raw) {
        console.warn("UEQ-S not found in localStorage for key:", UEQ_CACHE_KEY);
        setItems([]);
        setError(
          t("err_load") ||
            "לא נמצאו פריטי שאלון חוויית משתמש (UEQ-S) בזיכרון המקומי."
        );
        return;
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        console.warn("UEQ-S format is not an array:", parsed);
        setItems([]);
        setError(
          t("err_load") ||
            "פורמט השאלון ב-localStorage אינו תקין."
        );
        return;
      }

      const sorted = [...parsed].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      setItems(sorted);
      setError("");
    } catch (e) {
      console.warn("UEQ-S parse error:", e);
      setItems([]);
      setError(
        t("err_load") ||
          "אירעה שגיאה בקריאת השאלון מהזיכרון המקומי."
      );
    }
  }, [UEQ_CACHE_KEY]);

  const answeredCount = useMemo(
    () => Object.keys(responses).length,
    [responses]
  );

  const isComplete = items.length > 0 && answeredCount === items.length;

  const mapToUeqScale = (v) => v - 4;

  const calculateScores = () => {
    if (!items.length) return null;

    const pragmaticItems = items.filter((i) =>
      (i.category || "").toLowerCase().includes("pragmatic")
    );
    const hedonicItems = items.filter((i) =>
      (i.category || "").toLowerCase().includes("hedonic")
    );

    const sumFor = (arr) =>
      arr.reduce((sum, item) => {
        const key = item.key || item.id;
        const v = responses[key];
        if (!v) return sum;
        return sum + mapToUeqScale(v);
      }, 0);

    const pragmaticScore =
      pragmaticItems.length > 0
        ? sumFor(pragmaticItems) / pragmaticItems.length
        : 0;

    const hedonicScore =
      hedonicItems.length > 0
        ? sumFor(hedonicItems) / hedonicItems.length
        : 0;

    const overallScore = (pragmaticScore + hedonicScore) / 2;

    return { pragmaticScore, hedonicScore, overallScore };
  };

  const handleSelect = (itemKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [itemKey]: value,
    }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      setError(t("err_incomplete") || "נא לענות על כל הסעיפים.");
      return;
    }

    setSubmitting(true);
    setError("");

    const scores = calculateScores();
    try {
      await fetch("/api/ueq/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonId: student?.anonId || null,
          groupType: student?.assignment?.groupType || null,
          lang,
          responses,
          scores,
        }),
      });

      console.log("UEQ-S responses", responses);
      console.log("UEQ-S scores", scores);

      if (anonId) {
        try {
          localStorage.setItem(
            `experienceQuestionnaireDone:${anonId}`,
            "1"
          );
        } catch (e) {
          console.warn("Failed to persist experience flag:", e);
        }
      }

      setSubmitted(true);
      navigate("/thanks");

    } catch (e) {
      console.error("UEQ-S submit failed:", e);
      setError(t("err_submit") || "חלה שגיאה בשמירת השאלון.");
    } finally {
      setSubmitting(false);
    }
  };

  const anonBadge = useMemo(
    () =>
      student?.anonId ? (
        <div
          className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
            isDark
              ? "bg-slate-700/80 text-slate-200 border border-slate-600"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          <span className="font-medium">anonId:</span>
          <code
            className={`font-mono ${
              isDark ? "text-emerald-300" : "text-emerald-700"
            }`}
          >
            {student.anonId}
          </code>
        </div>
      ) : null,
    [student?.anonId, isDark]
  );

  if (!statusChecked) {
    return (
      <div
        key={lang}
        dir={isRTL ? "rtl" : "ltr"}
        lang={lang}
        className={`flex flex-col min-h-screen w-screen ${
          isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
        }`}
        style={{
          fontFamily:
            'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">
              {t("checkingStatus") || "בודקים את מצב השאלון..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div
        key={lang}
        dir={isRTL ? "rtl" : "ltr"}
        lang={lang}
        className={`flex flex-col min-h-screen w-screen ${
          isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
        }`}
        style={{
          fontFamily:
            'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div className="px-4 mt-4">
          <AnonymousHeader />
        </div>

        <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
          <section
            className={`${
              isDark ? "bg-slate-700" : "bg-slate-200"
            } p-4 sm:p-6 md:p-7 rounded-xl`}
          >
            <div
              className={`rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border-2 max-w-3xl mx-auto ${
                isDark
                  ? "bg-slate-800 border-emerald-500/30 shadow-emerald-500/10"
                  : "bg-white border-emerald-200 shadow-emerald-100"
              }`}
            >
              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 ${
                    isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                  }`}
                >
                  <svg
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {t("alreadyDoneTitle") ||
                    "כבר מילאת את שאלון הערכת החוויה"}
                </h2>
                <p
                  className={`mt-2 text-sm sm:text-base ${
                    isDark ? "text-emerald-200" : "text-emerald-700"
                  }`}
                >
                  {t("alreadyDoneBody") ||
                    "אין צורך למלא אותו שוב. אפשר להמשיך לסיכום."}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/thanks")}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>{t("goToSummary") || "מעבר לסיכום"}</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </main>

        <div className="px-4 pb-4">
          <Footer />
        </div>
      </div>
    );
  }
// 🔹 estimated time fallback (1–2 דקות ל־UEQ-S)
const rawEstimated = t("estimatedTime");
const estimatedTimeLabel =
  rawEstimated && rawEstimated !== "estimatedTime"
    ? rawEstimated
    : lang === "he"
      ? "זמן משוער: כ-1–2 דקות"
      : "Estimated time: about 1–2 minutes";

  return (
    <div
      key={lang}
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark
          ? "bg-slate-800 text-white"
          : "bg-slate-100 text-slate-800"
      }`}
      style={{
        fontFamily:
          'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* HEADER */}
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      {/* BODY */}
      <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
        <section
          className={`${
            isDark ? "bg-slate-700" : "bg-slate-200"
          } p-3 sm:p-6 md:p-7 rounded-xl`}
        >
          <div
            className={`rounded-xl shadow-lg p-4 sm:p-6 md:p-8 ${
              isDark
                ? "bg-slate-600 border border-slate-500 text-white"
                : "bg-white border border-slate-200 text-slate-800"
            } max-w-5xl mx-auto`}
          >
            {/* Header Section */}
            <div className="mb-8 pb-6 border-b border-opacity-20" style={{
              borderColor: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(71, 85, 105, 0.2)'
            }}>
              {/* Anonymous ID Badge */}
              {anonBadge && (
                <div className="mb-4">
                  {anonBadge}
                </div>
              )}

              {/* Title with Icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${
                  isDark 
                    ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30" 
                    : "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200"
                }`}>
                  <svg 
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <div className="flex-1">
<div className="flex items-center justify-between gap-3 flex-wrap">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
    {t("title") || "שאלון חוויית משתמש (UEQ-S)"}
  </h2>

  <button
    type="button"
    onClick={() => setShowHowTo(true)}
    className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border transition
      ${isDark ? "bg-slate-700 text-slate-200 border-slate-500 hover:bg-slate-600"
               : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
  >
   {howToBtnLabel}
  </button>
</div>
                  <p className={`text-sm leading-7 ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                    {t("intro") || "אנא דרג/י את חווייתך עם המערכת בכל אחד מההיבטים הבאים."}
                  </p>
                </div>
              </div>

              {/* Info Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm ${
                isDark 
                  ? "bg-blue-900/20 text-blue-300 border border-blue-800/50" 
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
<span className="font-medium">
  {items.length || 0} {questionsLabel} • {estimatedTimeLabel}
</span>


              </div>
            </div>

            {items.length === 0 && (
              <div className={`mb-4 p-4 rounded-lg text-sm ${
                isDark 
                  ? "bg-red-900/20 text-red-300 border border-red-800" 
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {error ||
                  t("err_load") ||
                  "השאלון לא נטען. אם זה מופיע במחקר אמיתי – נא לפנות לחוקרת."}
              </div>
            )}

            {items.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-xs sm:text-sm mb-2 font-medium">
                  <span>{t("progress") || "התקדמות"}</span>
                  <span className={isDark ? "text-emerald-300" : "text-emerald-600"}>
                    {answeredCount} / {items.length || 0}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2.5 overflow-hidden ${
                  isDark ? "bg-slate-700" : "bg-gray-200"
                }`}>
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width:
                        items.length === 0
                          ? "0%"
                          : `${
                              (answeredCount / items.length) * 100
                            }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {error && items.length > 0 && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                isDark 
                  ? "bg-red-900/20 text-red-300 border border-red-800" 
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {error}
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-6 sm:space-y-8">
                {items.map((item, idx) => {
                  const key = item.key || item._id || `q${idx + 1}`;

                  const rawText = item.text || "";
                  const parts = rawText.split("/");
                  const left = (parts[0] || "").trim();
                  const right = (parts[1] || "").trim();

                  const catRaw = item.category || "";
                  const dim = catRaw
                    .toLowerCase()
                    .includes("pragmatic")
                    ? "pragmatic"
                    : catRaw
                        .toLowerCase()
                        .includes("hedonic")
                    ? "hedonic"
                    : "";

                  return (
                    <div
                      key={key}
                      className={`pb-6 sm:pb-8 border-b last:border-b-0 ${
                        isDark ? "border-slate-500/50" : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-bold shadow-sm ${
                            isDark
                              ? "bg-slate-700 text-emerald-300 border border-slate-600"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        {dim === "pragmatic" && idx === 0 && (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                            isDark
                              ? "bg-blue-900/30 text-blue-300 border border-blue-700"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {t("dim_pragmatic") ||
                              "שימושיות / איכות פרגמטית"}
                          </span>
                        )}
                        {dim === "hedonic" &&
                          !items
                            .slice(0, idx)
                            .some((i) =>
                              (i.category || "")
                                .toLowerCase()
                                .includes("hedonic")
                            ) && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                              isDark
                                ? "bg-purple-900/30 text-purple-300 border border-purple-700"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}>
                              {t("dim_hedonic") ||
                                "חוויה רגשית / איכות הדונית"}
                            </span>
                          )}
                      </div>

                      <div className="flex justify-between items-center mb-4 gap-4">
                        <span className={`text-xs sm:text-sm font-semibold ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}>
                          {left}
                        </span>
                        <span className={`text-xs sm:text-sm font-semibold ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}>
                          {right}
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-center items-end gap-1 sm:gap-2 md:gap-3 px-0">
                        {SCALE_VALUES.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleSelect(key, v)}
                            className="flex flex-col items-center gap-1 flex-[0_0_13%] xs:flex-1 min-w-[2.1rem] touch-manipulation"
                          >
                            <div
                              className={`w-9 h-9 min-w-[2.25rem] min-h-[2.25rem] sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                                ${
                                  responses[key] === v
                                    ? isDark
                                      ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/50 scale-105 sm:scale-110"
                                      : "bg-emerald-500 border-emerald-600 shadow-lg shadow-emerald-500/30 scale-105 sm:scale-110"
                                    : isDark
                                    ? "bg-slate-700 border-slate-500 hover:border-emerald-400 hover:bg-slate-600 active:scale-95"
                                    : "bg-white border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
                                }`}
                            >
                              {responses[key] === v && (
                                <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-white rounded-full shadow-inner" />
                              )}
                            </div>
                            <span className={`text-[10px] xs:text-[11px] sm:text-xs font-medium whitespace-nowrap ${
                              responses[key] === v
                                ? isDark ? "text-emerald-300" : "text-emerald-600"
                                : isDark ? "text-slate-400" : "text-slate-500"
                            }`}>
                              {v}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4">
              <button
                type="button"
                disabled={!isComplete || submitting || items.length === 0}
                onClick={handleSubmit}
                className={`w-full px-6 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md
                  ${
                    !isComplete || submitting || items.length === 0
                      ? isDark
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("saving") || "שומר..."}</span>
                  </>
                ) : (
                  <>
                    <span>{t("submit") || "שליחת השאלון"}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {submitted && !error && (
              <div className={`mt-4 p-4 rounded-lg text-sm ${
                isDark 
                  ? "bg-emerald-900/20 text-emerald-300 border border-emerald-800" 
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {t("thanks") ||
                  "תודה רבה! תשובותיך נשמרו כחלק מהמחקר על חוויית השימוש במערכת."}
              </div>
            )}
          </div>
        </section>
      </main>
{showHowTo && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div
  className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
  onClick={() => setShowHowTo(false)}
/>
   <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border
  ${isDark ? "bg-slate-700 text-slate-100 border-slate-500" : "bg-white text-slate-800 border-slate-200"}`}>
      
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold">{howToTitle}</h3>
<button
  type="button"
  onClick={() => setShowHowTo(false)}
  aria-label="Close"
  className={`w-9 h-9 inline-flex items-center justify-center rounded-lg border transition
    ${isDark
      ? "bg-slate-800 text-slate-100 border-slate-500 hover:bg-slate-750"
      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
>
  <span className="text-lg leading-none">×</span>
</button>
      </div>

<div className={`text-sm leading-relaxed space-y-2 ${isDark ? "text-slate-200" : "text-slate-600"}`}>
  <p className="break-words">
    {lang === "he"
      ? "בכל שורה תרא/י זוג מילים מנוגדות. בחר/י מספר בין 1 ל-7."
      : "In each row you will see two opposite words. Choose a number from 1 to 7."}
  </p>

  <p className="break-words">
    {lang === "he" ? (
      <>
        <b>1</b> = קרוב מאוד למילה הימנית (השלילית), <b>7</b> = קרוב מאוד למילה השמאלית (החיובית).
        <br />
        אין תשובות נכונות או לא נכונות — ענה/י לפי התחושה שלך.
      </>
    ) : (
      <>
        <b>1</b> = very close to the right (negative) word, <b>7</b> = very close to the left (positive) word.
        <br />
        There are no right or wrong answers—answer based on your feeling.
      </>
    )}
  </p>
</div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowHowTo(false)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
        >
         {howToOkLabel}
        </button>
      </div>
    </div>
  </div>
)}
      {/* FOOTER */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function UeqQuestionnaire() {
  return <UeqQuestionnaireContent />;
}