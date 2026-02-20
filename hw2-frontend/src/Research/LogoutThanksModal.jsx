import React, { useEffect, useRef, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n'; // ✅ מילון מקומי ומהיר

export default function LogoutThanksModal({
  open,
  onClose,
  onConfirm,
  summary,
  closeOnBackdrop = false,
  closeOnEsc = false,
}) {
  // שפה וכיוון – חייב להיות לפני כל return
  const { lang } = useContext(LanguageContext);
  const isHe = lang === 'he';
  const { t, dir } = useI18n('logoutThanksModal');

  const dialogRef = useRef(null);

  // ניקוי langLock
  useEffect(() => {
    try {
      const lock = localStorage.getItem('langLock');
      if (lock === '1') {
        localStorage.removeItem('langLock');
        window.dispatchEvent(new Event('lang-lock-change'));
      }
    } catch (e) {
      // השמטת הדפסה, אין שינוי לוגי
    }
    return () => {
      // השמטת הדפסה, אין שינוי לוגי
    };
  }, []);

  // ESC לסגור (אם הוגדר closeOnEsc)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (closeOnEsc) {
          onClose?.();
        }
      }
    };

    document.addEventListener('keydown', onKey, true);

    // פוקוס לכפתור
    setTimeout(() => {
      const btn = dialogRef.current?.querySelector('[data-primary]');
      if (btn) {
        btn.focus?.();
      }
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKey, true);
    };
  }, [closeOnEsc, onClose]);

  // סיכום זמנים
  const {
    createdAt,
    lastSeenAt,
    createdAtLocal,
    lastSeenAtLocal,
    sessionDurationSec,
  } = summary || {};

  const parseISO = (s) => {
    if (!s) return null;
    const d = new Date(s);
    const ok = !Number.isNaN(d.getTime());
    return ok ? d : null;
  };

  let durationSec = null;
  const sISO = parseISO(createdAt);
  const eISO = parseISO(lastSeenAt);

  if (sISO && eISO) {
    durationSec = Math.max(0, Math.round((eISO - sISO) / 1000));
  } else if (typeof sessionDurationSec === 'number') {
    durationSec = Math.max(0, Math.round(sessionDurationSec));
  }

  const formatDuration = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    const result = [h ? `${h}h` : null, (m || h) ? `${m}m` : null, `${r}s`]
      .filter(Boolean)
      .join(' ');
    return result;
  };

  const stop = (e) => {
    e.stopPropagation();
  };

  const handlePrimaryClick = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  // ✅ ה־hooks כבר נקראו בכל מקרה – עכשיו מותר להחליט אם לא לצייר כלום
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      dir={dir}
    >
      {/* רקע */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={
          closeOnBackdrop
            ? () => {
                onClose?.();
              }
            : () => {}
        }
      />
      <div
        ref={dialogRef}
        onClick={stop}
        className={`relative bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-[520px] border border-slate-200 dark:border-slate-700 ${
          dir === 'rtl' ? 'text-right' : 'text-left'
        }`}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-2">{t('title')}</h2>
        <p className="text-xs sm:text-sm opacity-80 mb-4">{t('desc')}</p>

        {/* בלוק הנתונים — לא מתהפך */}
        <div className="rounded-lg border dark:border-slate-600 p-3 sm:p-4 mb-4 text-xs sm:text-sm">
          <div className="flex justify-between py-1 gap-2">
            <span className="font-medium flex-shrink-0">{t('startTime')}</span>
            <span dir="ltr" className="font-mono tabular-nums text-right">
              {createdAtLocal || '—'}
            </span>
          </div>
          <div className="flex justify-between py-1 gap-2">
            <span className="font-medium flex-shrink-0">{t('endTime')}</span>
            <span dir="ltr" className="font-mono tabular-nums text-right">
              {lastSeenAtLocal || '—'}
            </span>
          </div>
          {typeof durationSec === 'number' && !Number.isNaN(durationSec) && (
            <div className="flex justify-between py-1 gap-2">
              <span className="font-medium flex-shrink-0">{t('duration')}</span>
              <span dir="ltr" className="font-mono tabular-nums text-right">
                {formatDuration(durationSec)}
              </span>
            </div>
          )}
        </div>

        {/* כפתור בצד ההגיוני */}
        <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
          <button
            data-primary
            onClick={handlePrimaryClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base w-full sm:w-auto"
          >
            {t('closeAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
}
