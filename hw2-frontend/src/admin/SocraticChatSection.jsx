// ✅ src/admin/SocraticChatSection.jsx
import React, { useMemo } from "react";
import { Card } from "./AdminResultsShared";

const SocraticChatSection = ({
  t,
  lang,
  isDark,
  isExperimental,
  data,
  fmtDateTime,
  fmtDuration,
  locale,
}) => {
  // old behavior: if not experimental → show "notExperimental"
  if (!isExperimental) {
    return (
      <Card title={t("sections.socraticChat")} isDark={isDark}>
        <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
          {t("states.notExperimental")}
        </div>
      </Card>
    );
  }

  const soc = data?.socraticChat || null;

  // participant language from server (same logic as old file)
  const participantLang =
    data?.questions?.lang ||
    data?.casel?.post?.lang ||
    data?.casel?.pre?.lang ||
    data?.ueq?.lang ||
    "he";

  const participantIsRTL = participantLang === "he";
  const participantLocale = participantLang === "he" ? "he-IL" : "en-US";

  const finalReflectionQuestions = useMemo(() => {
const he = {
  insight: "באיזה אופן השיחה הסוקרטית עזרה לך להרהר במחשבות או ברגשות שלך?",
  usefulness: "בסך הכל, האם את/ה מרגיש/ה שהשיחה עם Casely הייתה מועילה או משמעותית עבורך?",
};

const en = {
  insight: "In what way did the Socratic conversation help you reflect on your thoughts or feelings?",
  usefulness: "Overall, do you feel that talking with Casely was useful or meaningful to you?",
};
    return participantLang === "he" ? he : en;
  }, [participantLang]);

  // safety
  const messagesRaw = soc?.messages || [];
  const summary = soc?.aiConversationSummary || "—";
  const recs = Array.isArray(soc?.aiRecommendations) ? soc.aiRecommendations : [];
  const chatStats = soc?.chatStats || {};

  // clean system message
  const chatMessagesClean = useMemo(() => {
    return (messagesRaw || []).filter((m) => m?.text !== "__CHAT_SESSION_START__");
  }, [messagesRaw]);

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

  const hasSocraticChat = Boolean(soc);

  return (
    <Card title={t("sections.socraticChat")} isDark={isDark}>
      {!hasSocraticChat ? (
        <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
          {t("states.noData")}
        </div>
      ) : (
        <div className="space-y-4">
          {/* top mini-cards (same as old) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              className={`rounded-xl border p-3 ${
                isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
                {lang === "he" ? "תחילת השיחה" : "Chat start"}
              </div>
              <div className="text-base font-bold">
                {typeof fmtDateTime === "function" ? fmtDateTime(chatFirstTs, locale) : "—"}
              </div>
            </div>

            <div
              className={`rounded-xl border p-3 ${
                isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
                {lang === "he" ? "סוף השיחה" : "Chat end"}
              </div>
              <div className="text-base font-bold">
                {typeof fmtDateTime === "function" ? fmtDateTime(chatLastTs, locale) : "—"}
              </div>
            </div>

            <div
              className={`rounded-xl border p-3 ${
                isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
                {lang === "he" ? "משך השיחה" : "Chat duration"}
              </div>
              <div className="text-base font-bold">
                {typeof fmtDuration === "function" ? fmtDuration(chatDurationSecUi) : "—"}
              </div>
            </div>
          </div>

          {/* stats mini-cards (same as old) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              className={`rounded-xl border p-3 ${
                isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
                {t("fields.turns")}
              </div>
              <div className="text-lg font-bold">{chatStats?.turns ?? "—"}</div>
            </div>

            <div
              className={`rounded-xl border p-3 ${
                isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
                {t("fields.studentTurns")}
              </div>
              <div className="text-lg font-bold">{chatStats?.studentTurns ?? "—"}</div>
            </div>

            <div
              className={`rounded-xl border p-3 ${
                isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
                {t("fields.aiTurns")}
              </div>
              <div className="text-lg font-bold">{chatStats?.aiTurns ?? "—"}</div>
            </div>
          </div>

          {/* messages (same as old bubble UI) */}
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {t("fields.messages")}
            </div>

            {chatMessagesClean.length === 0 ? (
              <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
                {t("states.noData")}
              </div>
            ) : (
              <div className="space-y-2">
                {chatMessagesClean.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 ${
                      m.sender === "ai"
                        ? isDark
                          ? "border-slate-600 bg-slate-900/40"
                          : "border-slate-200 bg-white"
                        : isDark
                        ? "border-slate-700 bg-slate-800/30"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div
                        className={`text-xs font-semibold ${
                          m.sender === "ai"
                            ? "text-violet-500"
                            : isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        {m.sender === "ai" ? t("labels.ai") : t("labels.student")}
                      </div>
                      <div className="text-xs opacity-50">
                        {typeof fmtDateTime === "function" ? fmtDateTime(m.timestamp, locale) : "—"}
                      </div>
                    </div>

                    <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* summary (same as old) */}
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {t("fields.chatSummary")}
            </div>

            <div
              className={`rounded-xl border p-3 whitespace-pre-wrap text-sm leading-relaxed ${
                isDark
                  ? "border-slate-700 bg-slate-900/30 text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              {summary}
            </div>
          </div>

          {/* recommendations (same as old) */}
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {t("fields.recommendations")}
            </div>

            {recs.length === 0 ? (
              <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
                {t("states.noData")}
              </div>
            ) : (
              <ul className="list-disc ps-6 space-y-1">
                {recs.map((r, idx) => (
                  <li key={idx} className="text-sm">
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* final reflection (improved cards UI) */}
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {t("fields.finalReflection")}
            </div>

            {!soc?.finalReflection ? (
              <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
                {t("states.noData")}
              </div>
            ) : (
              <div
                className={`rounded-2xl border p-4 ${
                  isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"
                }`}
              >
                {/* meta row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-sm font-semibold">
                    {lang === "he" ? "רפלקציה סופית" : "Final Reflection"}
                  </div>
                  <div className="text-xs opacity-60">
                    {typeof fmtDateTime === "function"
                      ? fmtDateTime(soc.finalReflection.submittedAt, participantLocale)
                      : "—"}
                  </div>
                </div>

                {/* cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* insight card */}
                  <div
                    className={`rounded-2xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-800/30"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div
                      dir={participantIsRTL ? "rtl" : "ltr"}
                      className="flex items-start gap-2 mb-2"
                    >
                      <div
                        className={`mt-0.5 h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDark ? "bg-violet-500/20 text-violet-200" : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        1
                      </div>

                      <div>
                        <div
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {participantLang === "he" ? "שאלה" : "Question"}
                        </div>
                        <div
                          className={`text-sm font-semibold leading-snug ${
                            isDark ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          {finalReflectionQuestions.insight}
                        </div>
                      </div>
                    </div>

                    <div
                      dir={participantIsRTL ? "rtl" : "ltr"}
                      className={`rounded-xl border p-3 text-sm whitespace-pre-wrap break-words leading-relaxed ${
                        isDark
                          ? "border-slate-700 bg-slate-900/30 text-slate-200"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {soc.finalReflection.insight || "—"}
                    </div>
                  </div>

                  {/* usefulness card */}
                  <div
                    className={`rounded-2xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-800/30"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div
                      dir={participantIsRTL ? "rtl" : "ltr"}
                      className="flex items-start gap-2 mb-2"
                    >
                      <div
                        className={`mt-0.5 h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDark ? "bg-emerald-500/20 text-emerald-200" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        2
                      </div>

                      <div>
                        <div
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {participantLang === "he" ? "שאלה" : "Question"}
                        </div>
                        <div
                          className={`text-sm font-semibold leading-snug ${
                            isDark ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          {finalReflectionQuestions.usefulness}
                        </div>
                      </div>
                    </div>

                    <div
                      dir={participantIsRTL ? "rtl" : "ltr"}
                      className={`rounded-xl border p-3 text-sm whitespace-pre-wrap break-words leading-relaxed ${
                        isDark
                          ? "border-slate-700 bg-slate-900/30 text-slate-200"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {soc.finalReflection.usefulness || "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SocraticChatSection;