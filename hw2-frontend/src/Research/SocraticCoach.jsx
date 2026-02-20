// src/Research/SocraticCoach.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { translateUI } from '../utils/translateUI';
import { ThemeContext } from '../DarkLightMood/ThemeContext';

/**
 * SocraticCoach – real AI-backed Socratic chat (Claude/backend).
 */
const DEFAULT_TITLE = "Hi! I'm your Socratic Coach ✋";

export default function SocraticCoach({
  anonId,
  situation,
  question,
  analysisText,
  onComplete,
  title = DEFAULT_TITLE,
  disabled = false,
  startImmediately = true,
}) {
  // ---- HOOKS: תמיד באותו סדר וללא תנאים ----
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { theme } = useContext(ThemeContext) || { theme: 'light' };
  const navigate = useNavigate();
const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const [T, setT] = useState({
    title: "Hi! I'm your Socratic Coach ✋",
    missingAnonId: 'Missing anonId',
    initFailed: 'Init failed',
    initError: 'Init error',
    sendFailed: 'Send failed',
    sendError: 'Send error',
    finalizeError: 'Failed to finalize conversation',
    aiSummaryFailed: 'AI summary failed',
    inputPlaceholder: 'Type your reply…',
    send: 'Send',
    finish: 'Finish',
    processing: 'Processing…',
    hintBeforeFinish:
      'The "Continue to Validated Questionnaire" button will enable after you click "Finish".',
  });
  const [messages, setMessages] = useState([]); // [{ role:'assistant'|'user', text, ts }]
  const [input, setInput] = useState('');
  const [finished, setFinished] = useState(false);
  const [chatLoading, setChatLoading] = useState(false); // init/send
  const [finishing, setFinishing] = useState(false);     // finalize+navigate
  const [error, setError] = useState('');
const [chatEnded, setChatEnded] = useState(false);
  const listRef = useRef(null);
  const startedRef = useRef({ ran: false, anonId: null });

  // ---- DERIVEDS (ללא hooks חדשים) ----
  const isDark = theme === 'dark';
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const t = (k) => T[k] ?? k;

  // ---- i18n (אותה לוגיקה, רק אחרי שהוגדרו כל ה-hooks) ----
  useEffect(() => {
    let cancelled = false;
    async function loadT() {
      if (lang === 'he') {
        try {
          const SOURCE = T;
          const keys = Object.keys(SOURCE);
          const vals = Object.values(SOURCE);
          const tr = await translateUI({
            sourceLang: 'EN',
            targetLang: 'HE',
            texts: vals,
          });
          if (!cancelled) {
            const map = {};
            keys.forEach((k, i) => (map[k] = tr[i]));
            setT(map);
          }
        } catch {
          if (!cancelled) {
            setT((prev) => prev);
          }
        }
      } else {
        setT({
          title: "Hi! I'm your Socratic Coach ✋",
          missingAnonId: 'Missing anonId',
          initFailed: 'Init failed',
          initError: 'Init error',
          sendFailed: 'Send failed',
          sendError: 'Send error',
          finalizeError: 'Failed to finalize conversation',
          aiSummaryFailed: 'AI summary failed',
          inputPlaceholder: 'Type your reply…',
          send: 'Send',
          finish: 'Finish',
          processing: 'Processing…',
          hintBeforeFinish:
            'The "Continue to Validated Questionnaire" button will enable after you click "Finish".',
        });
      }
    }
    loadT();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ---- auto scroll ----
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, chatLoading]);

  // ---- memos ----
const canType = useMemo(
  () => !chatEnded && !finished && !disabled && !chatLoading && !finishing,
  [chatEnded, finished, disabled, chatLoading, finishing]
);
  const canSend = useMemo(
    () => canType && input.trim().length > 0,
    [canType, input]
  );

  // ---- helpers ----
  const fmtTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const TypingDots = ({ align = 'left' }) => (
    <div className={align === 'left' ? 'text-left' : 'text-right'}>
      <span className={`inline-flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm
        ${isDark ? 'bg-slate-700' : 'bg-gradient-to-r from-slate-100 to-slate-50'}`}>
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDark ? 'bg-slate-300' : 'bg-slate-400'} animate-bounce`} style={{ animationDelay: '0ms' }} />
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDark ? 'bg-slate-300' : 'bg-slate-400'} animate-bounce`} style={{ animationDelay: '150ms' }} />
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDark ? 'bg-slate-300' : 'bg-slate-400'} animate-bounce`} style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  );

  // ---- init (first AI turn) ----
  async function start() {
    if (startedRef.current.ran && startedRef.current.anonId === anonId) return;
    startedRef.current = { ran: true, anonId };

    try {
      if (!anonId) {
        setError(t('missingAnonId'));
        return;
      }
      setError('');
      setChatLoading(true);

      const res = await fetch('/api/trial/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId,
          init: true,
          situation,
          question,
          analysisText,
          maxTokens: 300,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || t('initFailed'));

      const replyRaw = data?.reply;
const reply = Array.isArray(replyRaw)
  ? (lang === 'he' ? (replyRaw[1] || replyRaw[0]) : (replyRaw[0] || replyRaw[1]))
  : (replyRaw || '').toString();
      if (data?.chatEnded) setChatEnded(true);
      if (reply) {
        setMessages([{ role: 'assistant', text: reply, ts: new Date().toISOString() }]);
      }
    } catch (e) {
      setError(e.message || t('initError'));
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    if (startImmediately && anonId) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonId, startImmediately, situation, question, analysisText]);

  // ---- send user turn ----
  async function send() {
    const text = input.trim();
    if (!text || !canType) return;

    const nowIso = new Date().toISOString();

    try {
      setError('');
      setChatLoading(true);
      setMessages((prev) => [...prev, { role: 'user', text, ts: nowIso }]);
      setInput('');

      const res = await fetch('/api/trial/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId,
          userText: text,
          maxTokens: 300,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || t('sendFailed'));

      const replyRaw = data?.reply;
const reply = Array.isArray(replyRaw)
  ? (lang === 'he' ? (replyRaw[1] || replyRaw[0]) : (replyRaw[0] || replyRaw[1]))
  : (replyRaw || '').toString();
      if (data?.chatEnded) setChatEnded(true);
      if (reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: reply, ts: new Date().toISOString() }]);
      }
    } catch (e) {
      setError(e.message || t('sendError'));
    } finally {
      setChatLoading(false);
    }
  }
async function doFinish() {
  if (finished || finishing) return;
  try {
    setError('');
    setFinished(true);
    setFinishing(true);

    if (!anonId) throw new Error(t('missingAnonId'));

    const resp = await fetch('/api/trial/summary/final', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonId, maxTokens: 600 })
    });
    const data = await resp.json();
    if (!resp.ok || !data?.ok) throw new Error(data?.error || t('aiSummaryFailed'));

    const summaryText = (data.summaryText || '').toString();

    navigate('/simulation/final-summary', {
      state: { anonId, summaryText, from: 'coach-finish' }
    });
  } catch (e) {
    setFinished(false);
    setFinishing(false);
    setError(e.message || t('finalizeError'));
  }
}

  // ---- finish ----
function finish() {
  if (finished || finishing) return;
  setShowFinishConfirm(true);
}


  const shownTitle = title === DEFAULT_TITLE ? t('title') : title;

return (
  <div
    className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-7 shadow-lg border
      ${isDark
        ? 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100'
        : 'border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-800'}`}
    dir={dir}
    style={{
      fontFamily:
        'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
  >
{showFinishConfirm && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowFinishConfirm(false)}
    />
    <div
      className={`relative w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}
      dir={dir}
    >
      <h3 className="text-xl font-bold mb-2">
        {lang === 'he' ? 'לסיים את השיחה?' : 'Finish the chat?'}
      </h3>
      <p className={`text-sm mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {lang === 'he'
          ? 'לחיצה על Finish תעביר אותך לשלב הבא ולא ניתן לחזור.'
          : 'Clicking Finish will move you forward and you won’t be able to return.'}
      </p>

      <div className={`flex gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={() => setShowFinishConfirm(false)}
          className={`flex-1 py-2.5 rounded-xl font-semibold border ${
            isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-300'
          }`}
        >
          {lang === 'he' ? 'ביטול' : 'Cancel'}
        </button>

        <button
          onClick={() => {
            setShowFinishConfirm(false);
            doFinish();
          }}
          className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          {lang === 'he' ? 'כן, לסיים' : 'Yes, finish'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Header */}
      <div className={`flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 ${dir === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl shadow-md shrink-0">
          ✋
        </div>
        <h3 className={`text-base sm:text-lg md:text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'} leading-tight`}>
          {shownTitle.replace(' ✋', '')}
        </h3>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 sm:mb-4 text-xs sm:text-sm rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-3 sm:px-4 py-2 sm:py-3 text-red-800 shadow-sm" aria-live="polite">
          <div className={`flex items-start gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <span className="text-base sm:text-lg shrink-0">⚠️</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        </div>
      )}

      {/* Chat Area - רספונסיבי */}
      <div
        ref={listRef}
        className={`h-64 sm:h-72 md:h-80 overflow-y-auto space-y-2 sm:space-y-3 mb-3 sm:mb-4 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-inner border
          ${isDark
            ? 'border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 text-slate-100'
            : 'border-slate-200 bg-gradient-to-b from-white to-slate-50/50 text-slate-800'}`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <div key={i} className={isUser ? 'text-right' : 'text-left'}>
              <div className={`inline-flex flex-col max-w-[90%] sm:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <span
                  className={`inline-block px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all hover:shadow-md ${
                    isUser
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : (isDark
                          ? 'bg-slate-700 text-slate-100 border border-slate-600'
                          : 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-800 border border-slate-200')
                  }`}
                >
                  {m.text}
                </span>
                <span className={`mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {fmtTime(m.ts)}
                </span>
              </div>
            </div>
          );
        })}

        {chatLoading && !finishing && <TypingDots align="left" />}
      </div>

      {/* Input Row - רספונסיבי */}
      <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
        <input
          className={`flex-1 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base transition-all focus:outline-none
            ${isDark
              ? 'bg-slate-800 text-slate-100 placeholder-slate-400 border-2 border-slate-600 focus:border-blue-400 focus:ring-4 focus:ring-blue-900/40'
              : 'bg-white text-slate-800 placeholder-slate-400 border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'}
            ${finishing ? 'cursor-wait opacity-70' : 'shadow-sm'}`}
          placeholder={chatEnded ? (lang === 'he' ? 'השיחה הסתיימה' : 'Chat ended') : t('inputPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!canType}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend) send();
            }
          }}
        />
        
        <div className={`flex gap-2 sm:gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={send}
            disabled={!canSend}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all transform active:scale-95 sm:hover:scale-105"
          >
            {t('send')}
          </button>

          <button
              onClick={() => {
  if (chatEnded) {
    doFinish();   // מביא summary ומנווט ל /simulation/final-summary
  } else {
    setShowFinishConfirm(true);
  }
}}
            disabled={finished || finishing}
            aria-busy={finishing ? 'true' : 'false'}
            className={`flex-1 sm:flex-none sm:min-w-[8rem] px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base text-white font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 ${finishing ? 'cursor-wait opacity-90' : 'transform active:scale-95 sm:hover:scale-105'}`}
          >
            {finishing ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a 8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                </svg>
                <span>{t('processing')}</span>
              </>
) : (
  chatEnded
    ? (lang === 'he' ? 'המשך לסיכום' : 'Continue')
    : t('finish')
)}
          </button>
        </div>
      </div>

      {/* Hint */}
      {!finished && (
        <div className={`mt-3 sm:mt-4 flex items-start gap-2 text-[11px] sm:text-xs rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border
          ${isDark
            ? 'text-slate-300 bg-slate-800 border-slate-700'
            : 'text-slate-600 bg-blue-50 border-blue-100'}`}>
          <span className="text-xs sm:text-sm shrink-0">💡</span>
          <p className="leading-relaxed">{t('hintBeforeFinish')}</p>
        </div>
      )}
    </div>
  );
}