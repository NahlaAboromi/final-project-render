// api/seed/seedScenarios.he.js
const ScenarioHe = require('../models/Scenario.he');

async function seedScenariosHe({ data, version = 'v1' } = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('seedScenariosHe: data[] required');
  }

  const ops = data.map((doc) => ({
    updateOne: {
      filter: { scenarioId: doc.scenarioId },
      update: { $set: { ...doc, version } },
      upsert: true,
    },
  }));

  const res = await ScenarioHe.bulkWrite(ops, { ordered: false });
  const upserts = res.upsertedCount ?? 0;
  const modified = res.modifiedCount ?? 0;
  console.log(`✅ Scenarios HE seeded (${version}) upserts=${upserts}, modified=${modified}`);
}

module.exports = { seedScenariosHe };
