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
      insight: "באיזו דרך השיחה הסוקרטית עזרה לך להרהר במחשבות או ברגשות שלך?",
      usefulness: "באופן כללי, האם הרגשת שהשיחה עם CASELy הייתה שימושית או משמעותית עבורך?",
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

          {/* final reflection (same as old) */}
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
                className={`rounded-xl border p-3 ${
                  isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-white"
                }`}
              >
                <div className="text-xs opacity-50 mb-2">
                  {typeof fmtDateTime === "function"
                    ? fmtDateTime(soc.finalReflection.submittedAt, participantLocale)
                    : "—"}
                </div>

                <div className="text-sm break-words space-y-3">
                  <div>
                    <div
                      dir={participantIsRTL ? "rtl" : "ltr"}
                      className={`font-semibold text-xs uppercase tracking-wide mb-1 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {finalReflectionQuestions.insight}
                    </div>
                    <div className="whitespace-pre-wrap">
                      {soc.finalReflection.insight || "—"}
                    </div>
                  </div>

                  <div className={`pt-2 border-t ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                    <div
                      dir={participantIsRTL ? "rtl" : "ltr"}
                      className={`font-semibold text-xs uppercase tracking-wide mb-1 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {finalReflectionQuestions.usefulness}
                    </div>
                    <div className="whitespace-pre-wrap">
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