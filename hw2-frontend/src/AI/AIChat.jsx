// src/AI/AIChat.jsxTEST
import React, { useState, useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n';

const AIChat = ({ teacherId }) => {
  const [showBox, setShowBox] = useState(false);
  const [input, setInput] = useState('');
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const ctx = useContext(LanguageContext) || {};
  const lang = ctx.lang ?? (document.documentElement.lang === 'he' ? 'he' : 'en');
  const isRTL = lang === 'he';
  const { t, ready } = useI18n('aiChat');

  const chatRef = useRef(null);
  const greetingRef = useRef('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleChatBox = () => setShowBox(v => !v);

  const closeChat = () => {
    setShowBox(false);
    setMessages([]);
  };

  const scrollToBottom = () => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!showBox || !ready) return;

    const greeting = t('greeting');

    setMessages(prev => {
      if (prev.length === 0) {
        greetingRef.current = greeting;
        return [{ role: 'ai', content: greeting }];
      }

      if (prev[0]?.role === 'ai' && prev[0].content === greeting) {
        return prev;
      }

      if (prev[0]?.role === 'ai') {
        const updated = [...prev];
        updated[0] = { ...updated[0], content: greeting };
        greetingRef.current = greeting;
        return updated;
      }

      return prev;
    });
  }, [showBox, lang, ready, t]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/claude/chat-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          messages: newMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      const aiReply = data?.success ? data.response : t('fallback');
      setMessages([...newMessages, { role: 'ai', content: aiReply }]);
    } catch {
      setMessages([...newMessages, { role: 'ai', content: t('errGeneric') }]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAME IDEA AS STUDENT:
  // Hebrew (RTL): :AI
  // English (LTR): AI:
  const labelWithColon = (isUser) => {
    const label = isUser ? t('labelYou') : t('labelAI');
    if (!isUser && isRTL) return `:${label}`; // RTL: colon before
    return `${label}:`; // normal
  };

  // ✅ IMPORTANT:
  // AI label should always be LTR so it doesn’t flip around emojis/RTL text
  // YOU label follows UI direction
  const labelDir = (isUser) => {
    if (!isUser) return 'ltr';
    return isRTL ? 'rtl' : 'ltr';
  };

  return (
    <>
      <style>{`
        .dot{width:6px;height:6px;margin-inline-end:4px;background-color:currentColor;border-radius:50%;display:inline-block;animation:jump 1.4s infinite ease-in-out both;}
        .dot1{animation-delay:-0.32s;}
        .dot2{animation-delay:-0.16s;}
        .dot3{animation-delay:0;}
        @keyframes jump{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}
        
        /* כפתור צף - רספונסיבי */
        .ai-chat-button {
          position: fixed;
          bottom: 1rem;
          background-color: #2563eb;
          color: white;
          padding: 0.75rem;
          border-radius: 9999px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: background-color 0.2s;
          z-index: 40;
          border: none;
          cursor: pointer;
        }
        
        .ai-chat-button:hover {
          background-color: #1d4ed8;
        }
        
        /* LTR (אנגלית) - ימין תמיד */
        [dir="ltr"] .ai-chat-button {
          right: 1.5rem;
          left: auto;
        }
        
        /* RTL (עברית) - MOBILE: מרכז */
        [dir="rtl"] .ai-chat-button {
          left: 50%;
          transform: translateX(-50%);
          right: auto;
        }
        
        /* RTL (עברית) - TABLET ומעלה: שמאל */
        @media (min-width: 640px) {
          [dir="rtl"] .ai-chat-button {
            left: 1.5rem;
            right: auto;
            transform: none;
          }
        }
        
        /* תיבת צ'אט - רספונסיבי */
        .ai-chat-box {
          position: fixed;
          display: flex;
          flex-direction: column;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 50;
        }
        
        /* LTR (אנגלית) - ימין תמיד */
        [dir="ltr"] .ai-chat-box {
          bottom: 4.5rem;
          right: 0.5rem;
          left: auto;
          width: auto;
          max-height: calc(100vh - 6rem);
        }
        
        @media (min-width: 640px) {
          [dir="ltr"] .ai-chat-box {
            bottom: 6rem;
            right: 1.5rem;
            width: 24rem;
            max-height: 80vh;
          }
        }
        
        @media (min-width: 1024px) {
          [dir="ltr"] .ai-chat-box {
            width: 28rem;
          }
        }
        
        /* RTL (עברית) - MOBILE: מסך מלא */
        [dir="rtl"] .ai-chat-box {
          bottom: 4.5rem;
          left: 0.5rem;
          right: 0.5rem;
          width: auto;
          max-height: calc(100vh - 6rem);
        }
        
        /* RTL (עברית) - TABLET ומעלה: שמאל */
        @media (min-width: 640px) {
          [dir="rtl"] .ai-chat-box {
            left: 1.5rem;
            right: auto;
            width: 24rem;
            max-height: 80vh;
          }
        }
        
        @media (min-width: 1024px) {
          [dir="rtl"] .ai-chat-box {
            width: 28rem;
          }
        }
        
        /* כותרת - רספונסיבי */
        .ai-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
        }
        
        .ai-chat-header h4 {
          font-size: 1rem;
          font-weight: 600;
        }
        
        @media (min-width: 640px) {
          .ai-chat-header h4 {
            font-size: 1.125rem;
          }
        }
        
        /* אזור הודעות - רספונסיבי */
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem;
        }
        
        @media (min-width: 640px) {
          .ai-chat-messages {
            padding: 1rem;
          }
        }
        
        /* בועות הודעות - רספונסיבי */
        .ai-message-bubble {
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.813rem;
          white-space: pre-wrap;
          word-break: break-word;
          max-width: 90%;
        }
        
        @media (min-width: 640px) {
          .ai-message-bubble {
            font-size: 0.875rem;
            max-width: 85%;
          }
        }
        
        @media (min-width: 1024px) {
          .ai-message-bubble {
            font-size: 0.9375rem;
          }
        }
        
        /* אזור קלט - רספונסיבי */
        .ai-chat-input-area {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          gap: 0.5rem;
        }
        
        @media (min-width: 640px) {
          .ai-chat-input-area {
            padding: 0.75rem 1rem;
          }
        }
        
        .ai-chat-input {
          flex: 1;
          border: 1px solid;
          border-radius: 0.375rem;
          padding: 0.5rem;
          font-size: 0.813rem;
        }
        
        @media (min-width: 640px) {
          .ai-chat-input {
            font-size: 0.875rem;
          }
        }
        
        @media (min-width: 1024px) {
          .ai-chat-input {
            font-size: 0.9375rem;
          }
        }
        
        .ai-chat-input:focus {
          outline: none;
          ring: 2px;
          ring-color: #3b82f6;
        }
        
        .ai-chat-send-btn {
          background-color: #2563eb;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.813rem;
          white-space: nowrap;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
        }
        
        @media (min-width: 640px) {
          .ai-chat-send-btn {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }
        
        @media (min-width: 1024px) {
          .ai-chat-send-btn {
            font-size: 0.9375rem;
          }
        }
        
        .ai-chat-send-btn:hover:not(:disabled) {
          background-color: #1d4ed8;
        }
        
        .ai-chat-send-btn:disabled {
          opacity: 0.5;
        }
      `}</style>

      {/* כפתור צף */}
      <button
        onClick={toggleChatBox}
        className="ai-chat-button"
        title={t('tooltip')}
        aria-label={t('tooltip')}
      >
        💬
      </button>

      {/* תיבת צ'אט */}
      {showBox && (
        <div
          key={lang}
          dir={isRTL ? 'rtl' : 'ltr'}
          lang={lang}
          className={`ai-chat-box border ${
            isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'
          }`}
        >
          {/* כותרת */}
          <div className={`ai-chat-header border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <h4>{t('title')}</h4>
            <button
              onClick={closeChat}
              className={`text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                isDark
                  ? 'text-pink-400 hover:text-pink-500 bg-slate-700 hover:bg-slate-600'
                  : 'text-red-500 hover:text-red-600 bg-white hover:bg-gray-100'
              }`}
              aria-label="close"
            >
              &times;
            </button>
          </div>

          {/* הודעות */}
          <div ref={chatRef} className="ai-chat-messages space-y-2">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={index}
                  className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  lang={lang}
                >
                  <div
                    className={[
                      'ai-message-bubble',
                      isUser
                        ? 'bg-blue-600 text-white'
                        : (isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'),
                      isRTL ? 'text-right' : 'text-left',
                    ].join(' ')}
                  >
                    <strong>
                      <bdi dir={labelDir(isUser)}>{labelWithColon(isUser)}</bdi>
                    </strong>{' '}
                    <bdi>{msg.content}</bdi>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="w-full flex justify-start" dir={isRTL ? 'rtl' : 'ltr'} lang={lang}>
                <div
                  className={[
                    'ai-message-bubble inline-flex items-center gap-1',
                    isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800',
                    isRTL ? 'text-right' : 'text-left',
                  ].join(' ')}
                >
                  <strong>
                    <bdi dir="ltr">{labelWithColon(false)}</bdi>
                  </strong>
                  <div className="flex ms-2">
                    <span className="dot dot1" />
                    <span className="dot dot2" />
                    <span className="dot dot3" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* קלט+שליחה */}
          <div className={`ai-chat-input-area border-t ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('placeholder')}
              className={`ai-chat-input focus:outline-none ${
                isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              lang={lang}
            />
            <button onClick={handleSend} disabled={loading} className="ai-chat-send-btn">
              {loading ? t('asking') : t('ask')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;