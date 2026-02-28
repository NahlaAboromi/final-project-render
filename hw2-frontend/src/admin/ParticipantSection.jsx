// src/admin/ParticipantSection.jsx
import React from "react";
import { Card } from "./AdminResultsShared";

const ParticipantSection = ({ t, isDark, isRTL, data }) => {
  return (
    <Card title={t("sections.participant")} isDark={isDark}>
      <div className="space-y-0">

        <KVRow
          label={t("fields.email")}
          value={data.participant?.email || "—"}
          isRTL={isRTL}
        />

        <KVRow
          label={t("fields.anonId")}
          value={data.anonId || "—"}
          isRTL={isRTL}
        />

        <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6">

          <div>

            <KVRow
              label={t("fields.gender")}
              value={data.participant?.demographics?.gender || "—"}
              isRTL={isRTL}
            />

            <KVRow
              label={t("fields.ageRange")}
              value={data.participant?.demographics?.ageRange || "—"}
              isRTL={isRTL}
            />

          </div>

          <div>

            <KVRow
              label={t("fields.fieldOfStudy")}
              value={data.participant?.demographics?.fieldOfStudy || "—"}
              isRTL={isRTL}
            />

            <KVRow
              label={t("fields.semester")}
              value={data.participant?.demographics?.semester || "—"}
              isRTL={isRTL}
            />

          </div>

        </div>

      </div>
    </Card>
  );
};

export default ParticipantSection;


/* ========================= */
/* פנימי — בלי שינוי לוגיקה */
/* ========================= */

const KVRow = ({ label, value, isRTL }) => (
  <div
    className={`flex ${
      isRTL ? "flex-row-reverse" : "flex-row"
    } items-start justify-between gap-4 py-2 border-b last:border-b-0 border-slate-100 dark:border-slate-700/50`}
  >
    <div className="text-sm opacity-60 shrink-0">
      {label}
    </div>

    <div className="text-sm font-semibold break-words text-right max-w-[70%]">
      {value}
    </div>

  </div>
);