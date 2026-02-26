// src/studentPages/SimulationBox.jsx

import React from 'react';
import { useI18n } from '../utils/i18n';

const SimulationBox = ({ simulationText, situation }) => {

  const { t, dir, lang, ready } = useI18n('studentSimulationBox');

  if (!ready) return null;

  return (

    <div
      dir={dir}
      lang={lang}
      className="mb-6 p-6 rounded bg-white dark:bg-slate-700 shadow"
    >

      <h2 className="text-xl font-semibold mb-2">
        🧪 {t('situation')}
      </h2>

      <p className="mb-4">
        {situation}
      </p>


      <h2 className="text-xl font-semibold mb-2">
        ❓ {t('question')}
      </h2>

      <p className="mb-6">
        {simulationText}
      </p>

    </div>

  );

};

export default SimulationBox;