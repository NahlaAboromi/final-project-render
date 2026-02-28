// src/admin/CaselAvgCards.jsx

import React from "react";

const CASEL_CATEGORY_STYLE = {

  "Self-Awareness": {
    light: "bg-orange-50 border-orange-200",
    dark: "bg-orange-950/20 border-orange-800/40",
    label: "text-orange-700",
    dot: "bg-orange-400",
  },

  "Self-Management": {
    light: "bg-amber-50 border-amber-200",
    dark: "bg-amber-950/20 border-amber-800/40",
    label: "text-amber-700",
    dot: "bg-amber-400",
  },

  "Social Awareness": {
    light: "bg-yellow-50 border-yellow-200",
    dark: "bg-yellow-950/20 border-yellow-800/40",
    label: "text-yellow-700",
    dot: "bg-yellow-400",
  },

  "Relationship Skills": {
    light: "bg-lime-50 border-lime-200",
    dark: "bg-lime-950/20 border-lime-800/40",
    label: "text-lime-700",
    dot: "bg-lime-500",
  },

  "Responsible Decision-Making": {
    light: "bg-emerald-50 border-emerald-200",
    dark: "bg-emerald-950/20 border-emerald-800/40",
    label: "text-emerald-700",
    dot: "bg-emerald-500",
  },

};


const getCaselStyle = (key) =>
  CASEL_CATEGORY_STYLE[key] || {
    light: "bg-slate-50 border-slate-200",
    dark: "bg-slate-900/30 border-slate-700",
    label: "text-slate-600",
    dot: "bg-slate-400",
  };



const CaselAvgCards = ({
  isDark,
  isRTL,
  lang,
  averages,
  scaleHint,
}) => {

  const labelsHe = {

    "Self-Awareness": "מודעות עצמית",

    "Self-Management": "ניהול עצמי",

    "Social Awareness": "מודעות חברתית",

    "Relationship Skills": "מיומנויות בין-אישיות",

    "Responsible Decision-Making": "קבלת החלטות אחראית",

  };


  const labelsEn = {

    "Self-Awareness": "Self-Awareness",

    "Self-Management": "Self-Management",

    "Social Awareness": "Social Awareness",

    "Relationship Skills": "Relationship Skills",

    "Responsible Decision-Making": "Responsible Decision-Making",

  };


  const order = [

    "Self-Awareness",

    "Self-Management",

    "Social Awareness",

    "Relationship Skills",

    "Responsible Decision-Making",

  ];


  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

      {order.map((key) => {

        const value = averages?.[key];

        const title =
          lang === "he"
            ? labelsHe[key]
            : labelsEn[key];

        const style = getCaselStyle(key);


        return (

          <div

            key={key}

            className={`rounded-xl border p-4 ${
              isDark
                ? style.dark
                : `${style.light} shadow-sm`
            }`}

          >

            <div className="flex items-center gap-1.5 mb-2">

              <span
                className={`w-2 h-2 rounded-full ${style.dot}`}
              />

              <div
                className={`text-sm font-semibold ${
                  style.label
                } ${
                  isRTL
                    ? "text-right"
                    : "text-left"
                }`}
              >

                {title}

              </div>

            </div>


 <div className="text-3xl font-bold">
  {value == null || !Number.isFinite(value) ? "—" : value.toFixed(2)}
</div>


            <div className="text-xs opacity-60">

              {lang==="he"
                ? "ממוצע"
                : "Average"}

              {scaleHint && ` (${scaleHint})`}

            </div>


          </div>

        );

      })}

    </div>

  );

};

export default CaselAvgCards;