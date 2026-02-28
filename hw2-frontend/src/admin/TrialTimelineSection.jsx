// src/admin/TrialTimelineSection.jsx
import React from "react";
import { Card } from "./AdminResultsShared";

const TrialTimelineSection = ({
  t,
  isDark,
  isRTL,
  locale,
  data,
  groupType,
  isExperimental,
  fmtDateTime,
  fmtDuration
}) => {

  return (
    <>

      {/* Trial Info */}

      <Card title={t("sections.trialInfo")} isDark={isDark}>

        <KVRow
          label={t("fields.groupType")}
          value={groupType}
          isRTL={isRTL}
        />

        <KVRow
          label={t("fields.group")}
          value={data.trialInfo?.group || "—"}
          isRTL={isRTL}
        />

        <KVRow
          label={t("fields.scenarioId")}
          value={data.trialInfo?.scenarioId || "—"}
          isRTL={isRTL}
        />

        <KVRow
          label={t("fields.assignedAt")}
          value={fmtDateTime(data.trialInfo?.assignedAt, locale)}
          isRTL={isRTL}
        />

      </Card>


      {/* Timeline */}

      <Card title={t("sections.timeline")} isDark={isDark}>

        <KVRow
          label={t("fields.processStartedAt")}
          value={fmtDateTime(data.timeline?.processStartedAt, locale)}
          isRTL={isRTL}
        />

        <KVRow
          label={t("fields.processEndedAt")}
          value={fmtDateTime(data.timeline?.processEndedAt, locale)}
          isRTL={isRTL}
        />

        <KVRow
          label={t("fields.processDuration")}
          value={fmtDuration(data.timeline?.processDurationSec)}
          isRTL={isRTL}
        />


        <Divider isDark={isDark} />


        <KVRow
          label={t("fields.simStartedAt")}
          value={fmtDateTime(data.timeline?.simulationStartedAt, locale)}
          isRTL={isRTL}
        />

        <KVRow
          label={t("fields.simEndedAt")}
          value={fmtDateTime(data.timeline?.simulationEndedAt, locale)}
          isRTL={isRTL}
        />

        <KVRow
          label={t("fields.simDuration")}
          value={fmtDuration(data.timeline?.simulationDurationSec)}
          isRTL={isRTL}
        />


        {isExperimental && (
          <>
            <Divider isDark={isDark} />

            <KVRow
              label={t("fields.chatStartedAt")}
              value={fmtDateTime(data.timeline?.chatStartedAt, locale)}
              isRTL={isRTL}
            />

            <KVRow
              label={t("fields.chatEndedAt")}
              value={fmtDateTime(data.timeline?.chatEndedAt, locale)}
              isRTL={isRTL}
            />

            <KVRow
              label={t("fields.chatDuration")}
              value={fmtDuration(data.timeline?.chatDurationSec)}
              isRTL={isRTL}
            />
          </>
        )}

      </Card>

    </>
  );
};

export default TrialTimelineSection;


/* helpers */

const Divider = ({ isDark }) => (
  <div
    className={`pt-4 mt-2 border-t ${
      isDark ? "border-slate-700" : "border-slate-100"
    }`}
  />
);


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
