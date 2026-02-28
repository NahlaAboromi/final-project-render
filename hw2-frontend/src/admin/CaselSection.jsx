// src/admin/CaselSection.jsx

import React from "react";
import { Card, KV } from "./AdminResultsShared";
import CaselAvgCards from "./CaselAvgCards";

const CaselSection = ({
  type,
  t,
  lang,
  isDark,
  isRTL,
  locale,
  data,
  averages,
  renderCaselAnswersTable,
  fmtDateTime,
}) => {

  const section = type === "pre"
    ? data?.casel?.pre
    : data?.casel?.post;

  if (!section)
    return (
      <Card title={type==="pre"?t("sections.caselPre"):t("sections.caselPost")} isDark={isDark}>
        {t("states.noData")}
      </Card>
    );

  return (

    <Card
      title={type==="pre"?t("sections.caselPre"):t("sections.caselPost")}
      isDark={isDark}
    >

      <KV
        label={t("fields.startedAt")}
        value={fmtDateTime(section.startedAt, locale)}
        isRTL={isRTL}
      />

      <KV
        label={t("fields.endedAt")}
        value={fmtDateTime(section.endedAt, locale)}
        isRTL={isRTL}
      />

      <div className="pt-3">

        <CaselAvgCards
          isDark={isDark}
          isRTL={isRTL}
          lang={lang}
          averages={averages}
          scaleHint={
            lang === "he"
              ? "לפי בחירות הסטודנט"
              : "from student answers"
          }
        />

      </div>

      <div className="pt-3">

        {typeof renderCaselAnswersTable === "function"
  ? renderCaselAnswersTable(section.answers || [])
  : null}

      </div>

    </Card>

  );
};

export default CaselSection;


