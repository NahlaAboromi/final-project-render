// src/Research/assessment/ResultsView.jsx
import React, { useContext } from "react";
import { Award, TrendingUp } from "lucide-react";
import { LanguageContext } from "../../context/LanguageContext";
import { useI18n } from "../../utils/i18n";

export default function ResultsView({ results, completionTime, onFinish }) {
  const { lang } = useContext(LanguageContext);
  const { t } = useI18n("resultsView");
  const dir = lang === "he" ? "rtl" : "ltr";
  const spaceDir = lang === "he" ? "space-x-reverse" : "";

  return (
<div
  className="min-h-screen bg-transparent p-3 sm:p-4 md:p-6 lg:p-8"
  dir={dir}
  style={{ fontFamily: lang === "he" ? "Heebo, Rubik, Arial, sans-serif" : "inherit" }}
>
      <div className="w-full max-w-7xl mx-auto rounded-lg shadow-md p-4 sm:p-6 md:p-8 lg:p-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        
        {/* HEADER */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl mb-4 sm:mb-6 shadow"
            style={{ background: "#059669" }}
          >
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 px-2">
            {t("title")}
          </h2>

          {completionTime && (
            <div
              className={`inline-flex items-center space-x-2 sm:space-x-3 ${spaceDir} bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full mb-2 text-sm sm:text-base`}
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold whitespace-nowrap">
                {t("completedIn")} {completionTime}
              </span>
            </div>
          )}
        </div>

        {/* RESULTS LIST */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-6 sm:mb-8 md:mb-10">
          {results.map(({ category, score, average }) => (
            <div
              key={category}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg">
                  {category}
                  <span className="block sm:inline text-xs sm:text-sm text-slate-600 dark:text-slate-300 sm:ml-2 mt-1 sm:mt-0">
                    ({t("avg")} {average} / 4.0)
                  </span>
                </h3>
                <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 self-start sm:self-auto">
                  {Math.round(score)}%
                </div>
              </div>
              
              <div className="relative w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* TIP BOX */}
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
          <p className="text-blue-800 dark:text-blue-200 text-sm sm:text-base leading-relaxed">
            {t("useResults")}
          </p>
        </div>

        {/* CTA BUTTON */}
        <div className="w-full">
          <button
            onClick={() => {
              try {
                localStorage.removeItem("langLock");
              } catch {}
              window.dispatchEvent(new Event("lang-lock-change"));
              onFinish?.();
            }}
            className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-shadow active:scale-[0.98] text-sm sm:text-base"
          >
            {t("finish")}
          </button>
        </div>
      </div>
    </div>
  );
}