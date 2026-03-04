// src/admin/AdminResults.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SectionLabel, Card } from "./AdminResultsShared";

import AdminHeader from "./AdminHeader";
import Footer from "../layout/Footer";

import ParticipantSection from "./ParticipantSection";
import TrialTimelineSection from "./TrialTimelineSection";
import CaselSection from "./CaselSection";
import SimulationSection from "./SimulationSection";
import SocraticChatSection from "./SocraticChatSection";
import UeqSection from "./UeqSection";

import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";

/* =========================
   helpers (keep in this file)
========================= */

const normalizeCategoryKey = (raw) => {
  const s = String(raw || "").trim().toLowerCase();
  const flat = s.replace(/[\s\-_]/g, "");

  if (flat.includes("selfawareness")) return "Self-Awareness";
  if (flat.includes("selfmanagement")) return "Self-Management";
  if (flat.includes("socialawareness")) return "Social Awareness";
  if (flat.includes("relationshipskills") || flat.includes("relationships") || flat.includes("interpersonal"))
    return "Relationship Skills";
  if (flat.includes("responsibledecisionmaking") || flat.includes("decisionmaking"))
    return "Responsible Decision-Making";

  // Hebrew fallbacks
  if (s.includes("מודעות") && s.includes("עצמ")) return "Self-Awareness";
  if (s.includes("ניהול") && s.includes("עצמ")) return "Self-Management";
  if (s.includes("מודעות") && s.includes("חברת")) return "Social Awareness";
  if (s.includes("מיומנויות") && (s.includes("בין") || s.includes("אישיות"))) return "Relationship Skills";
  if (s.includes("החלט") || s.includes("אחראי") || s.includes("אחראית")) return "Responsible Decision-Making";

  return "Other";
};

const parseLikertValue = (v) => {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;

  const s = String(v).trim();
  const asNum = Number(s);
  if (!Number.isNaN(asNum) && Number.isFinite(asNum)) return asNum;

  const en = s.toLowerCase();
  if (en.includes("strongly disagree")) return 1;
  if (en === "disagree" || en.includes(" disagree")) return 2;
  if (en === "agree" || en.includes(" agree")) return 3;
  if (en.includes("strongly agree")) return 4;

  if (s.includes("מאוד לא מסכ")) return 1;
  if (s.includes("לא מסכ")) return 2;
  if (s === "מסכים" || s === "מסכימה" || s.includes("מסכ")) return 3;
  if (s.includes("מאוד מסכ")) return 4;

  return null;
};

const calcCaselCategoryAverages = (answers = [], qMap) => {
  const buckets = new Map();

  (answers || []).forEach((a) => {
    const q = qMap?.get?.(a.questionKey);
    const canonicalCat = normalizeCategoryKey(
      q?.category || q?.competency || q?.skill || q?.domain
    );

    const val = parseLikertValue(a.value);
    if (val == null) return;

    const cur = buckets.get(canonicalCat) || { sum: 0, count: 0 };
    cur.sum += val;
    cur.count += 1;
    buckets.set(canonicalCat, cur);
  });

  const out = {};
  for (const [cat, { sum, count }] of buckets.entries()) {
    out[cat] = count ? sum / count : null;
  }
  return out;
};

// Detect question language (prefer explicit q.lang, else heuristic)
const detectQuestionLang = (q) => {
  if (q?.lang === "he" || q?.language === "he") return "he";
  if (q?.lang === "en" || q?.language === "en") return "en";
  const text = String(q?.text || "");
  if (/[א-ת]/.test(text)) return "he";
  return "en";
};

// Map numeric likert (1..4) to label by language
const likertLabel = (num, qLang) => {
  const n = Number(num);
  if (!Number.isFinite(n)) return null;

  const he = {
    1: "מאוד לא מסכים/ה",
    2: "לא מסכים/ה",
    3: "מסכים/ה",
    4: "מאוד מסכים/ה",
  };
  const en = {
    1: "Strongly Disagree",
    2: "Disagree",
    3: "Agree",
    4: "Strongly Agree",
  };

  const dict = qLang === "he" ? he : en;
  return dict[n] || null;
};

// Show value as: "1 (Strongly Disagree)" / "1 (מאוד לא מסכים/ה)"
const prettyLikertValue = (rawValue, qLang) => {
  if (rawValue == null) return "—";

  const s = String(rawValue).trim();
  const asNum = Number(s);

  if (!Number.isNaN(asNum) && Number.isFinite(asNum)) {
    const lbl = likertLabel(asNum, qLang);
    return lbl ? `${asNum} (${lbl})` : String(asNum);
  }
  return s;
};

// dots like old design
const CASEL_DOT_STYLE = {
  "Self-Awareness": { dot: "bg-orange-400" },
  "Self-Management": { dot: "bg-amber-400" },
  "Social Awareness": { dot: "bg-yellow-400" },
  "Relationship Skills": { dot: "bg-lime-500" },
  "Responsible Decision-Making": { dot: "bg-emerald-500" },
};

const getCaselStyle = (key) => CASEL_DOT_STYLE[key] || { dot: "bg-slate-400" };

/* =========================
   component
========================= */

const AdminResultsContent = () => {
  const navigate = useNavigate();
  const { anonId } = useParams();

  const back = () => navigate("/admin/sessions");

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { lang } = useContext(LanguageContext) || { lang: "he" };
  const isRTL = lang === "he";
  const locale = lang === "he" ? "he-IL" : "en-US";

  const { t, ready } = useI18n("adminResults");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const url = useMemo(
    () => `${import.meta.env.VITE_API_URL}/api/admin/results/${encodeURIComponent(anonId || "")}`,
    [anonId]
  );

  const fmtDateTime = (d, localeArg) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "—";
      return dt.toLocaleString(localeArg);
    } catch {
      return "—";
    }
  };

  const fmtDuration = (sec) => {
    const s = Math.max(0, Math.floor(Number(sec || 0)));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    if (hh > 0) return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
    return `${pad(mm)}:${pad(ss)}`;
  };

  useEffect(() => {
    if (!ready || !anonId) return;

    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Request failed: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.error("AdminResults fetch error:", e);
        setData(null);
        setError(lang === "he" ? "נכשל לטעון תוצאות." : "Failed to load results.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [ready, anonId, url, lang]);

  // questions maps
  const caselQuestions = data?.questions?.casel || [];
  const caselQMap = useMemo(() => {
    const m = new Map();
    caselQuestions.forEach((q) => m.set(q.key, q));
    return m;
  }, [caselQuestions]);

  const caselPreAverages = useMemo(() => {
    const answers = data?.casel?.pre?.answers || [];
    return calcCaselCategoryAverages(answers, caselQMap);
  }, [data, caselQMap]);

  const caselPostAverages = useMemo(() => {
    const answers = data?.casel?.post?.answers || [];
    return calcCaselCategoryAverages(answers, caselQMap);
  }, [data, caselQMap]);

  const renderCaselAnswersTable = (answers = []) => {
    if (!Array.isArray(answers) || answers.length === 0) return null;

    return (
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark ? "border-slate-700" : "border-slate-200"
        }`}
      >
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
              <th
                className={`p-3 text-xs font-semibold uppercase tracking-wide ${
                  isDark ? "text-slate-400" : "text-slate-500"
                } ${isRTL ? "text-right" : "text-left"}`}
              >
                {lang === "he" ? "שאלה" : "Question"}
              </th>
              <th
                className={`p-3 text-xs font-semibold uppercase tracking-wide text-center ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {lang === "he" ? "ערך" : "Value"}
              </th>
            </tr>
          </thead>

          <tbody>
            {answers.map((a, idx) => {
              const q = caselQMap.get(a.questionKey);
              const questionText = q?.text || a.questionKey;
              const category = q?.category ? ` • ${q.category}` : "";

              const dotClass = getCaselStyle(
                normalizeCategoryKey(q?.category || q?.competency || q?.skill || q?.domain)
              ).dot;

              const shownValue = prettyLikertValue(a.value, detectQuestionLang(q));

              return (
                <tr
                  key={`${a.questionKey}-${idx}`}
                  className={`border-t ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-700/30"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <td className={`p-3 ${isRTL ? "text-right" : "text-left"} align-top`}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                      <div>
                        <div className="font-semibold">{questionText}</div>
                        <div className="text-xs opacity-60 mt-0.5">
                          {a.questionKey}
                          {category}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-center font-semibold align-top">{shownValue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const groupType = data?.trialInfo?.groupType || "—";
  const isExperimental = groupType === "experimental";

  const scenario = data?.simulation?.scenario || null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* Header - תמיד מוצג */}
      <div className="px-4 mt-4">
        <AdminHeader />
      </div>

      {/* Body */}
      <main className="flex-1 w-full px-4 py-6">
        {/* Title + Back - תמיד מוצג */}
        <div
          className={`rounded-2xl border shadow-sm px-6 py-5 mb-6 flex items-start justify-between gap-3 ${
            isDark ? "bg-slate-800/70 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex flex-col gap-1">
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
              {ready ? t("title") : "Loading…"}
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-slate-500"}`}>
              {ready ? t("subtitle") : ""}
              {anonId ? (
                <>
                  {" "}
                  <span
                    className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                      isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    ({anonId})
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <button
            onClick={back}
            className={`px-4 py-2 rounded-lg font-semibold text-sm border transition-all hover:shadow-sm active:scale-95 ${
              isDark
                ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-gray-200"
                : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
            }`}
          >
            {ready ? t("buttons.back") : "Back"}
          </button>
        </div>

        {/* States (כמו בקוד הישן) */}
        {!ready ? (
          <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>Loading…</div>
        ) : loading ? (
          <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.loading")}</div>
        ) : error ? (
          <div
            className={`rounded-xl border px-5 py-4 text-sm font-medium ${
              isDark
                ? "bg-red-900/20 border-red-800 text-red-400"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {error}
          </div>
        ) : !data ? (
          <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.empty")}</div>
        ) : (
          <>
            <SectionLabel label={lang === "he" ? "מידע כללי" : "General Info"} isDark={isDark} />

            <ParticipantSection t={t} isDark={isDark} isRTL={isRTL} data={data} />

            <TrialTimelineSection
              t={t}
              isDark={isDark}
              isRTL={isRTL}
              locale={locale}
              data={data}
              groupType={groupType}
              isExperimental={isExperimental}
              fmtDateTime={fmtDateTime}
              fmtDuration={fmtDuration}
            />

            <SectionLabel label={lang === "he" ? "שאלוני CASEL" : "CASEL Questionnaires"} isDark={isDark} />

            <CaselSection
              type="pre"
              t={t}
              lang={lang}
              isDark={isDark}
              isRTL={isRTL}
              locale={locale}
              data={data}
              averages={caselPreAverages}
              fmtDateTime={fmtDateTime}
              renderCaselAnswersTable={renderCaselAnswersTable}
            />

            <SectionLabel label={lang === "he" ? "סימולציה" : "Simulation"} isDark={isDark} />

            <SimulationSection
              t={t}
              isDark={isDark}
              lang={lang}
              scenarioTitle={scenario?.title}
              scenarioText={scenario?.text}
              scenarioReflection={scenario?.reflection}
              data={data}
            />

            <SectionLabel label={lang === "he" ? "שיחה סוקרטית" : "Socratic Chat"} isDark={isDark} />

            <SocraticChatSection
              t={t}
              lang={lang}
              isDark={isDark}
              data={data}
              isExperimental={isExperimental}
              locale={locale}
              fmtDateTime={fmtDateTime}
              fmtDuration={fmtDuration}
            />

            <SectionLabel label={lang === "he" ? "שאלוני POST" : "POST Questionnaires"} isDark={isDark} />

            <CaselSection
              type="post"
              t={t}
              lang={lang}
              isDark={isDark}
              isRTL={isRTL}
              locale={locale}
              data={data}
              averages={caselPostAverages}
              fmtDateTime={fmtDateTime}
              renderCaselAnswersTable={renderCaselAnswersTable}
            />

            <SectionLabel label="UEQ" isDark={isDark} />

            <UeqSection
              t={t}
              isDark={isDark}
              isRTL={isRTL}
              locale={locale}
              data={data}
              fmtDateTime={fmtDateTime}
            />
          </>
        )}
      </main>

      {/* Footer - תמיד מוצג */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const AdminResults = () => (
  <ThemeProvider>
    <AdminResultsContent />
  </ThemeProvider>
);

export default AdminResults;