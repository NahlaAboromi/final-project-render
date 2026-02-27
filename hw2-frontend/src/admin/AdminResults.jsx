// src/admin/AdminResults.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import Footer from "../layout/Footer";
import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";
import AnswerCard from "../studentPages/AnswerCard";

/* ========= helpers ========= */
const fmtDateTime = (d, locale) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString(locale);
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

const safeEntries = (obj) => {
  if (!obj) return [];
  if (obj instanceof Map) return Array.from(obj.entries());
  if (typeof obj === "object") return Object.entries(obj);
  return [];
};

const Card = ({ title, isDark, children }) => (
  <section
    className={`rounded-xl border shadow-sm mb-4 ${
      isDark ? "bg-slate-800/60 border-slate-700" : "bg-white/80 border-slate-200"
    }`}
  >
    <div className={`px-4 py-3 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
      <h2 className="font-bold">{title}</h2>
    </div>
    <div className="px-4 py-4">{children}</div>
  </section>
);

const KV = ({ label, value, isRTL }) => (
  <div className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-start justify-between gap-4`}>
    <div className="text-sm opacity-70">{label}</div>
    <div className="text-sm font-semibold break-words text-right max-w-[70%]">{value}</div>
  </div>
);

const AdminResultsContent = () => {
  const navigate = useNavigate();
  const { anonId } = useParams();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { lang } = useContext(LanguageContext) || { lang: "he" };
  const isRTL = lang === "he";
  const locale = lang === "he" ? "he-IL" : "en-US";

  // ✅ i18n (NO early return before hooks)
  const { t, ready } = useI18n("adminResults");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const url = useMemo(() => `/api/admin/results/${encodeURIComponent(anonId || "")}`, [anonId]);

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

  const back = () => navigate("/admin/sessions");

  const groupType = data?.trialInfo?.groupType || "—";
  const isExperimental = groupType === "experimental";
// ✅ Chat session summary (ignore __CHAT_SESSION_START__)
const chatMessagesClean = useMemo(() => {
  const msgs = data?.socraticChat?.messages || [];
  return msgs.filter((m) => m?.text !== "__CHAT_SESSION_START__");
}, [data]);

const chatFirstTs = chatMessagesClean.length ? chatMessagesClean[0].timestamp : null;
const chatLastTs = chatMessagesClean.length
  ? chatMessagesClean[chatMessagesClean.length - 1].timestamp
  : null;

const chatDurationSecUi = useMemo(() => {
  if (!chatFirstTs || !chatLastTs) return 0;
  const a = new Date(chatFirstTs).getTime();
  const b = new Date(chatLastTs).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.floor((b - a) / 1000));
}, [chatFirstTs, chatLastTs]);
  // ✅ שאלות לפי השרת (מגיעים ב-data.questions)
  const caselQuestions = data?.questions?.casel || [];
  const ueqQuestions = data?.questions?.ueq || [];

  // ✅ maps: key -> question
  const caselQMap = useMemo(() => {
    const m = new Map();
    caselQuestions.forEach((q) => m.set(q.key, q));
    return m;
  }, [caselQuestions]);

  const ueqQMap = useMemo(() => {
    const m = new Map();
    ueqQuestions.forEach((q) => m.set(q.key, q));
    return m;
  }, [ueqQuestions]);

  // ✅ הופך answers (questionKey/value) לטבלה עם טקסט השאלה
  const renderCaselAnswersTable = (answers = []) => {
    if (!answers.length) return null;

    return (
      <div className={`rounded-lg border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDark ? "bg-slate-900/40" : "bg-slate-100"}`}>
              <th className={`p-3 ${isRTL ? "text-right" : "text-left"}`}>
                {lang === "he" ? "שאלה" : "Question"}
              </th>
              <th className="p-3 text-center">{lang === "he" ? "ערך" : "Value"}</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((a, idx) => {
              const q = caselQMap.get(a.questionKey);
              const questionText = q?.text || a.questionKey;
              const category = q?.category ? ` • ${q.category}` : "";

              return (
                <tr
                  key={`${a.questionKey}-${idx}`}
                  className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}
                >
                  <td className={`p-3 ${isRTL ? "text-right" : "text-left"} align-top`}>
                    <div className="font-semibold">{questionText}</div>
                    <div className="text-xs opacity-70">{a.questionKey}{category}</div>
                  </td>
                  <td className="p-3 text-center font-semibold align-top">{a.value}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ✅ UEQ responses (Map key->value) לטבלה עם טקסט השאלה
  const renderUeqTable = () => {
    const entries = safeEntries(data?.ueq?.responses);
    if (!entries.length) return null;

    return (
      <div className={`rounded-lg border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${isDark ? "bg-slate-900/40" : "bg-slate-100"}`}>
              <th className={`p-3 ${isRTL ? "text-right" : "text-left"}`}>
                {lang === "he" ? "פריט" : "Item"}
              </th>
              <th className="p-3 text-center">{lang === "he" ? "ערך" : "Value"}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([k, v]) => {
              const q = ueqQMap.get(k);
              const questionText = q?.text || k;
              const category = q?.category ? ` • ${q.category}` : "";

              return (
                <tr key={k} className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <td className={`p-3 ${isRTL ? "text-right" : "text-left"} align-top`}>
                    <div className="font-semibold">{questionText}</div>
                    <div className="text-xs opacity-70">{k}{category}</div>
                  </td>
                  <td className="p-3 text-center font-semibold align-top">{v}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ✅ סימולציה מהשרת (title/text/reflection)
  const scenario = data?.simulation?.scenario || null;
  const scenarioTitle = scenario?.title || (lang === "he" ? "ללא כותרת" : "Untitled");
  const scenarioText = scenario?.text || "—";
  const scenarioReflection = Array.isArray(scenario?.reflection) ? scenario.reflection : [];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* Header */}
      <div className="px-4 mt-4">
        <AdminHeader />
      </div>

      {/* Body */}
      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? "bg-slate-700" : "bg-slate-200"} p-6 rounded`}>
          {!ready ? (
            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>Loading…</div>
          ) : (
            <>
              {/* Title + Back */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex flex-col gap-1">
                  <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    {t("title")}
                  </h1>
                  <p className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
                    {t("subtitle")} <span className="font-mono">({anonId})</span>
                  </p>
                </div>

                <button
                  onClick={back}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm border transition ${
                    isDark
                      ? "bg-slate-900 border-slate-600 hover:bg-slate-800 text-gray-200"
                      : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {t("buttons.back")}
                </button>
              </div>

              {/* States */}
              {loading ? (
                <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.loading")}</div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : !data ? (
                <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.empty")}</div>
              ) : (
                <>
                  {/* 1) Participant */}
                  <Card title={t("sections.participant")} isDark={isDark}>
                    <div className="space-y-3">
                      <KV label={t("fields.email")} value={data.participant?.email || "—"} isRTL={isRTL} />
                      <KV label={t("fields.anonId")} value={data.anonId || "—"} isRTL={isRTL} />

                      <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <KV label={t("fields.gender")} value={data.participant?.demographics?.gender || "—"} isRTL={isRTL} />
                          <KV label={t("fields.ageRange")} value={data.participant?.demographics?.ageRange || "—"} isRTL={isRTL} />
                        </div>
                        <div className="space-y-2">
                          <KV label={t("fields.fieldOfStudy")} value={data.participant?.demographics?.fieldOfStudy || "—"} isRTL={isRTL} />
                          <KV label={t("fields.semester")} value={data.participant?.demographics?.semester || "—"} isRTL={isRTL} />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* 2) Trial Info */}
                  <Card title={t("sections.trialInfo")} isDark={isDark}>
                    <div className="space-y-3">
                      <KV label={t("fields.groupType")} value={groupType} isRTL={isRTL} />
                      <KV label={t("fields.group")} value={data.trialInfo?.group || "—"} isRTL={isRTL} />
                      <KV label={t("fields.scenarioId")} value={data.trialInfo?.scenarioId || "—"} isRTL={isRTL} />
                      <KV label={t("fields.assignedAt")} value={fmtDateTime(data.trialInfo?.assignedAt, locale)} isRTL={isRTL} />
                    </div>
                  </Card>

                  {/* 3) Timeline */}
                  <Card title={t("sections.timeline")} isDark={isDark}>
                    <div className="space-y-3">
                      <KV label={t("fields.processStartedAt")} value={fmtDateTime(data.timeline?.processStartedAt, locale)} isRTL={isRTL} />
                      <KV label={t("fields.processEndedAt")} value={fmtDateTime(data.timeline?.processEndedAt, locale)} isRTL={isRTL} />
                      <KV label={t("fields.processDuration")} value={fmtDuration(data.timeline?.processDurationSec)} isRTL={isRTL} />

                      <hr className={`${isDark ? "border-slate-700" : "border-slate-200"} my-2`} />

                      <KV label={t("fields.simStartedAt")} value={fmtDateTime(data.timeline?.simulationStartedAt, locale)} isRTL={isRTL} />
                      <KV label={t("fields.simEndedAt")} value={fmtDateTime(data.timeline?.simulationEndedAt, locale)} isRTL={isRTL} />
                      <KV label={t("fields.simDuration")} value={fmtDuration(data.timeline?.simulationDurationSec)} isRTL={isRTL} />

                      {isExperimental && (
                        <>
                          <hr className={`${isDark ? "border-slate-700" : "border-slate-200"} my-2`} />
                          <KV label={t("fields.chatStartedAt")} value={fmtDateTime(data.timeline?.chatStartedAt, locale)} isRTL={isRTL} />
                          <KV label={t("fields.chatEndedAt")} value={fmtDateTime(data.timeline?.chatEndedAt, locale)} isRTL={isRTL} />
                          <KV label={t("fields.chatDuration")} value={fmtDuration(data.timeline?.chatDurationSec)} isRTL={isRTL} />
                        </>
                      )}
                    </div>
                  </Card>

                  {/* 4) CASEL PRE */}
                  <Card title={t("sections.caselPre")} isDark={isDark}>
                    {!data.casel?.pre ? (
                      <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                    ) : (
                      <div className="space-y-3">
                        <KV label={t("fields.lang")} value={data.casel.pre.lang || "—"} isRTL={isRTL} />
                        <KV label={t("fields.startedAt")} value={fmtDateTime(data.casel.pre.startedAt, locale)} isRTL={isRTL} />
                        <KV label={t("fields.endedAt")} value={fmtDateTime(data.casel.pre.endedAt, locale)} isRTL={isRTL} />
                        <KV label={t("fields.completedAt")} value={fmtDateTime(data.casel.pre.completedAt, locale)} isRTL={isRTL} />

                        <div className="pt-2">
                          <div className="font-semibold mb-2">
                            {lang === "he" ? "תשובות + שאלות השאלון" : "Answers + Questionnaire Questions"}
                          </div>
                          {renderCaselAnswersTable(data.casel.pre.answers || []) || (
                            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* 5) Simulation + AI Analysis (רק מה שצריך: סימולציה + כרטיסיות) */}
                  <Card title={t("sections.simulation")} isDark={isDark}>
                    <div className="space-y-4">
                      {/* ✅ הסימולציה עצמה */}
                      <div>
                        <div className="font-semibold mb-2">{lang === "he" ? "הסימולציה" : "Simulation"}</div>

                        {/* כותרת */}
                        <div className={`rounded-lg border p-4 mb-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                          <div className="text-lg font-bold mb-2">{scenarioTitle}</div>
                          <div className="whitespace-pre-wrap leading-relaxed">{scenarioText}</div>
                        </div>
<div className="mt-4">
  <div className="font-semibold mb-2">
    {lang === "he" ? "שאלות רפלקציה" : "Reflection Questions"}
  </div>

  <div
    className={`rounded-lg border p-4 ${
      isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"
    }`}
  >
    {scenarioReflection.length === 0 ? (
      <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
    ) : (
      <ul className="list-disc ps-6 space-y-2">
        {scenarioReflection.map((q, idx) => (
          <li key={idx} className="break-words leading-relaxed">
            {q}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
                      </div>

                      {/* ✅ הכרטיסיות היפות (AnswerCard) – בלי להציג תשובה עוד פעם למעלה */}
                      <div className="-mx-4">
                        <AnswerCard
                          isDark={isDark}
                          // ✅ זה גורם ל-AnswerCard להציג "הסימולציה עצמה" בתוך הכרטיס במקום לחזור על תשובה.
                          // אם ב-AnswerCard עדיין מופיע "התשובה שלך" עם טקסט, תתקני שם: להסתיר את בלוק ה-answerText כשhideAnswerText=true
                          answer={{
                            answerText: (data.simulation?.answers || []).slice(-1)[0] || "",
                            analysisResult: data.simulation?.aiAnalysisJson || {},
                            submittedAt: data.timeline?.simulationEndedAt || data.timeline?.processEndedAt,
                            // optional flag (אם תרצי לתמוך בזה ב-AnswerCard)
                            hideAnswerText: true,
                          }}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* 6) Socratic Chat (Experimental only) */}
                  <Card title={t("sections.socraticChat")} isDark={isDark}>
                    {!isExperimental || !data.socraticChat ? (
                      <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.notExperimental")}</div>
                    ) : (
                      <div className="space-y-4">
                      {/* ✅ session time cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
  <div
    className={`rounded-lg border p-3 ${
      isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"
    }`}
  >
    <div className="text-xs opacity-70">
      {lang === "he" ? "תחילת השיחה" : "Chat start"}
    </div>
    <div className="text-lg font-bold">
      {fmtDateTime(chatFirstTs, locale)}
    </div>
  </div>

  <div
    className={`rounded-lg border p-3 ${
      isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"
    }`}
  >
    <div className="text-xs opacity-70">
      {lang === "he" ? "סוף השיחה" : "Chat end"}
    </div>
    <div className="text-lg font-bold">
      {fmtDateTime(chatLastTs, locale)}
    </div>
  </div>

  <div
    className={`rounded-lg border p-3 ${
      isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"
    }`}
  >
    <div className="text-xs opacity-70">
      {lang === "he" ? "משך השיחה" : "Chat duration"}
    </div>
    <div className="text-lg font-bold">
      {fmtDuration(chatDurationSecUi)}
    </div>
  </div>
</div>
                        {/* stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                            <div className="text-xs opacity-70">{t("fields.turns")}</div>
                            <div className="text-lg font-bold">{data.socraticChat.chatStats?.turns ?? "—"}</div>
                          </div>
                          <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                            <div className="text-xs opacity-70">{t("fields.studentTurns")}</div>
                            <div className="text-lg font-bold">{data.socraticChat.chatStats?.studentTurns ?? "—"}</div>
                          </div>
                          <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                            <div className="text-xs opacity-70">{t("fields.aiTurns")}</div>
                            <div className="text-lg font-bold">{data.socraticChat.chatStats?.aiTurns ?? "—"}</div>
                          </div>
                        </div>

                        {/* messages */}
                        <div>
                          <div className="font-semibold mb-2">{t("fields.messages")}</div>
                          {(data.socraticChat.messages || []).length === 0 ? (
                            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                          ) : (
                            <div className="space-y-2">
{data.socraticChat.messages
  .filter(m => m.text !== "__CHAT_SESSION_START__")
  .map((m, idx) => (                                <div
                                  key={idx}
                                  className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}
                                >
                                  <div className="flex items-center justify-between gap-3 mb-1">
                                    <div className="text-xs font-semibold opacity-80">
                                      {m.sender === "ai" ? t("labels.ai") : t("labels.student")}
                                    </div>
                                    <div className="text-xs opacity-60">{fmtDateTime(m.timestamp, locale)}</div>
                                  </div>
                                  <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* summary + recommendations */}
                        <div>
                          <div className="font-semibold mb-2">{t("fields.chatSummary")}</div>
                          <div className={`rounded-lg border p-3 whitespace-pre-wrap ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                            {data.socraticChat.aiConversationSummary || "—"}
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold mb-2">{t("fields.recommendations")}</div>
                          {(data.socraticChat.aiRecommendations || []).length === 0 ? (
                            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                          ) : (
                            <ul className="list-disc ps-6 space-y-1">
                              {data.socraticChat.aiRecommendations.map((r, idx) => (
                                <li key={idx}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <div className="font-semibold mb-2">{t("fields.finalReflection")}</div>
                          {!data.socraticChat.finalReflection ? (
                            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                          ) : (
                            <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                              <div className="text-xs opacity-70 mb-2">
                                {fmtDateTime(data.socraticChat.finalReflection.submittedAt, locale)}
                              </div>
                              <div className="text-sm whitespace-pre-wrap break-words">
                                <span className="font-semibold">{t("fields.insight")}:</span>{" "}
                                {data.socraticChat.finalReflection.insight}
                                {"\n"}
                                <span className="font-semibold">{t("fields.usefulness")}:</span>{" "}
                                {data.socraticChat.finalReflection.usefulness}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* 7) CASEL POST */}
                  <Card title={t("sections.caselPost")} isDark={isDark}>
                    {!data.casel?.post ? (
                      <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                    ) : (
                      <div className="space-y-3">
                        <KV label={t("fields.lang")} value={data.casel.post.lang || "—"} isRTL={isRTL} />
                        <KV label={t("fields.startedAt")} value={fmtDateTime(data.casel.post.startedAt, locale)} isRTL={isRTL} />
                        <KV label={t("fields.endedAt")} value={fmtDateTime(data.casel.post.endedAt, locale)} isRTL={isRTL} />
                        <KV label={t("fields.completedAt")} value={fmtDateTime(data.casel.post.completedAt, locale)} isRTL={isRTL} />

                        <div className="pt-2">
                          <div className="font-semibold mb-2">
                            {lang === "he" ? "תשובות + שאלות השאלון" : "Answers + Questionnaire Questions"}
                          </div>
                          {renderCaselAnswersTable(data.casel.post.answers || []) || (
                            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* 8) UEQ */}
                  <Card title={t("sections.ueq")} isDark={isDark}>
                    {!data.ueq ? (
                      <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                    ) : (
                      <div className="space-y-4">
                        <KV label={t("fields.createdAt")} value={fmtDateTime(data.ueq.createdAt, locale)} isRTL={isRTL} />
                        <KV label={t("fields.lang")} value={data.ueq.lang || "—"} isRTL={isRTL} />

                        <div>
                          <div className="font-semibold mb-2">{t("fields.ueqScores")}</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                              <div className="text-xs opacity-70">{t("fields.pragmatic")}</div>
                              <div className="text-lg font-bold">{data.ueq.scores?.pragmaticScore ?? "—"}</div>
                            </div>
                            <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                              <div className="text-xs opacity-70">{t("fields.hedonic")}</div>
                              <div className="text-lg font-bold">{data.ueq.scores?.hedonicScore ?? "—"}</div>
                            </div>
                            <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"}`}>
                              <div className="text-xs opacity-70">{t("fields.overall")}</div>
                              <div className="text-lg font-bold">{data.ueq.scores?.overallScore ?? "—"}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold mb-2">
                            {lang === "he" ? "תשובות + פריטים" : "Responses + Items"}
                          </div>
                          {renderUeqTable() || (
                            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
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