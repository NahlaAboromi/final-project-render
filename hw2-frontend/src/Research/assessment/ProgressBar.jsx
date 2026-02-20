import React, { useContext } from 'react';
import { Zap } from 'lucide-react';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { useI18n } from '../../utils/i18n'; // ✅ מילון מקומי ומהיר

export default function ProgressBar({
  progress,
  quickMode,
  current,
  total,
  answered,
  isDark: isDarkProp,
}) {
  // theme
  const { theme } = useContext(ThemeContext) || {};
  const isDarkCtx = theme === 'dark';
  const isDark = typeof isDarkProp === 'boolean' ? isDarkProp : isDarkCtx;

  // i18n
  const { t, dir } = useI18n('progressBar');
  const isRTL = dir === 'rtl';

  // ---- classes ----
  const wrapperCls = isDark
    ? 'bg-white/10 border-white/20 text-white'
    : 'bg-slate-900/5 border-slate-300/60 text-slate-800';

  const trackCls = isDark ? 'bg-white/20' : 'bg-slate-900/15';

  const leftTextCls = isDark ? 'text-white/90' : 'text-slate-800';
  const rightTextCls = isDark ? 'text-white' : 'text-slate-900';

  // RTL: הופך סדר אייקון/טקסט בצ׳יפ של Quick Mode
  const chipDirCls = isRTL ? 'flex-row-reverse' : 'flex-row';

  // פורמט “שאלה X מתוך Y” / “Question X of Y”
  const qLabel =
    typeof total === 'number' && typeof current === 'number'
      ? `${t('question')} ${current} ${t('of')} ${total}`
      : '';

  // “NN% Complete”
  const pctLabel = `${Math.round(progress)}% ${t('completeSuffix')}`;

  return (
    <div className={`mb-8 rounded-2xl p-6 border backdrop-blur-md ${wrapperCls}`} dir={dir}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          {qLabel && (
            <span className={`text-sm font-semibold ${leftTextCls}`}>
              {qLabel}
            </span>
          )}

          {/* רוצים את מונה התשובות? הסירו את ההערה: */}
          {/* {typeof answered === 'number' && typeof total === 'number' && (
            <span className={isDark ? 'text-xs text-white/70' : 'text-xs text-slate-600'}>
              ({answered} {t('answered')})
            </span>
          )} */}

          {quickMode && (
            <span
              className={`text-xs bg-purple-500/80 text-white px-3 py-1 rounded-full font-bold flex ${chipDirCls} items-center gap-1.5 backdrop-blur-sm`}
              title={t('quickMode')}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t('quickMode')}</span>
            </span>
          )}
        </div>

        <span className={`text-sm font-bold ${rightTextCls}`}>{pctLabel}</span>
      </div>

      <div className={`relative w-full ${trackCls} rounded-full h-3 overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 transition-all ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
