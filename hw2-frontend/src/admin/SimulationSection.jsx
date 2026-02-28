// src/admin/SimulationSection.jsx
import React from "react";
import { Card } from "./AdminResultsShared";
import AnswerCard from "../studentPages/AnswerCard";

const SimulationSection = ({
  t,
  isDark,
  lang,
  scenarioTitle,
  scenarioText,
  scenarioReflection,
  data,
}) => {
  const isRTL = lang === "he";

  const titleFallback = lang === "he" ? "ללא כותרת" : "Untitled";
  const safeTitle = scenarioTitle || titleFallback;
  const safeText = scenarioText || "—";
  const reflection = Array.isArray(scenarioReflection) ? scenarioReflection : [];

  return (
    <Card title={t("sections.simulation")} isDark={isDark}>
      <div className="space-y-4">
        {/* Simulation box */}
        <div>
          <div
            className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
              isDark ? "text-slate-400" : "text-slate-500"
            } ${isRTL ? "text-right" : "text-left"}`}
          >
            {lang === "he" ? "הסימולציה" : "Simulation"}
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className={`text-lg font-bold mb-2 ${isRTL ? "text-right" : "text-left"}`}>
              {safeTitle}
            </div>

            <div
              className={`whitespace-pre-wrap leading-relaxed text-sm ${
                isDark ? "text-slate-300" : "text-slate-600"
              } ${isRTL ? "text-right" : "text-left"}`}
            >
              {safeText}
            </div>
          </div>
        </div>

        {/* Reflection Questions box */}
        <div>
          <div
            className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
              isDark ? "text-slate-400" : "text-slate-500"
            } ${isRTL ? "text-right" : "text-left"}`}
          >
            {lang === "he" ? "שאלות רפלקציה" : "Reflection Questions"}
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"
            }`}
          >
            {reflection.length === 0 ? (
              <div className={`${isDark ? "text-gray-300" : "text-slate-600"} text-sm`}>
                {lang === "he" ? "אין שאלות רפלקציה." : "No reflection questions."}
              </div>
            ) : (
              <ul className={`list-disc ${isRTL ? "pr-6 pl-0" : "pl-6"} space-y-2`}>
                {reflection.map((q, i) => (
                  <li key={i} className="break-words leading-relaxed text-sm">
                    {q}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* AnswerCard (full width like old) */}
        <div className="-mx-4">
          <AnswerCard
            isDark={isDark}
            answer={{
              answerText: (data?.simulation?.answers || []).slice(-1)[0] || "",
              analysisResult: data?.simulation?.aiAnalysisJson || {},
              submittedAt: data?.timeline?.simulationEndedAt || data?.timeline?.processEndedAt,
              hideAnswerText: true,
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default SimulationSection;