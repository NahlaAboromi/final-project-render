// src/admin/UeqSection.jsx
import React, { useMemo } from "react";
import { Card } from "./AdminResultsShared";

const safeEntries = (obj) => {
  if (!obj) return [];
  if (obj instanceof Map) return Array.from(obj.entries());
  if (typeof obj === "object") return Object.entries(obj);
  return [];
};

const UeqSection = ({ t, isDark, isRTL, locale, data, fmtDateTime }) => {
  if (!data?.ueq) return null;

  const ueqQuestions = data?.questions?.ueq || [];
  const ueqQMap = useMemo(() => {
    const m = new Map();
    ueqQuestions.forEach((q) => m.set(q.key, q));
    return m;
  }, [ueqQuestions]);

  const entries = safeEntries(data?.ueq?.responses);

  return (
    <Card title={t("sections.ueq")} isDark={isDark}>
      <div className="space-y-4">
        {/* metadata */}
        <div className="space-y-2">
          <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            <span className="opacity-70">{t("fields.createdAt")}:</span>{" "}
            <span className="font-semibold">
              {typeof fmtDateTime === "function" ? fmtDateTime(data.ueq.createdAt, locale) : "—"}
            </span>
          </div>

          <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            <span className="opacity-70">{t("fields.lang")}:</span>{" "}
            <span className="font-semibold">{data.ueq.lang || "—"}</span>
          </div>
        </div>

        {/* scores (optional) */}
        {data.ueq?.scores ? (
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {t("fields.ueqScores")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"}`}>
                <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">{t("fields.pragmatic")}</div>
                <div className="text-lg font-bold">{data.ueq.scores?.pragmaticScore ?? "—"}</div>
              </div>

              <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"}`}>
                <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">{t("fields.hedonic")}</div>
                <div className="text-lg font-bold">{data.ueq.scores?.hedonicScore ?? "—"}</div>
              </div>

              <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50"}`}>
                <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">{t("fields.overall")}</div>
                <div className="text-lg font-bold">{data.ueq.scores?.overallScore ?? "—"}</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* table */}
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isRTL ? "תשובות + פריטים" : "Responses + Items"}
          </div>

          {entries.length === 0 ? (
            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("states.noData")}</div>
          ) : (
            <div className={`rounded-xl border overflow-hidden ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                    <th
                      className={`p-3 text-xs font-semibold uppercase tracking-wide ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      } ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {isRTL ? "פריט" : "Item"}
                    </th>
                    <th className={`p-3 text-xs font-semibold uppercase tracking-wide text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {isRTL ? "ערך" : "Value"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {entries.map(([k, v]) => {
                    const q = ueqQMap.get(k);
                    const questionText = q?.text || k;
                    const category = q?.category ? ` • ${q.category}` : "";

                    return (
                      <tr
                        key={k}
                        className={`border-t transition-colors ${
                          isDark ? "border-slate-700 hover:bg-slate-700/30" : "border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <td className={`p-3 ${isRTL ? "text-right" : "text-left"} align-top`}>
                          <div className="font-semibold">{questionText}</div>
                          <div className="text-xs opacity-60 mt-0.5">
                            {k}
                            {category}
                          </div>
                        </td>
                        <td className="p-3 text-center font-semibold align-top">{String(v)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UeqSection;