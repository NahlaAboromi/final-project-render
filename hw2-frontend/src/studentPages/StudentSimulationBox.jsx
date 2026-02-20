import React, { useState } from 'react';

 // Displays a simulation scenario and its related question in a styled box.

const SimulationBox = ({ simulationText, situation}) => {

  return (
    <div className="mb-6 p-6 rounded bg-white dark:bg-slate-700 shadow">
      <h2 className="text-xl font-semibold mb-2">🧪 Situation</h2>
      <p className="mb-4">{situation}</p>

      <h2 className="text-xl font-semibold mb-2">❓ Question</h2>
      <p className="mb-6">{simulationText}</p>
    </div>
  );
};

export default SimulationBox;
