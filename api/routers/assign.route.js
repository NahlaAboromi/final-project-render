// api/routers/assign.route.js
const express = require('express');
const router = express.Router();

const Trial = require('../models/Trial');
const Scenario = require('../models/Scenario');      // מודל אנגלית
const ScenarioHe = require('../models/Scenario.he'); // מודל עברית

// 🔗 מיפוי קבוע בין קבוצות לסנריו
const GROUP_SCENARIO = { A: 'S1', B: 'S3', C: 'S10', D: 'S14' };
const groupTypeByLetter = (g) => (g === 'D' ? 'control' : 'experimental');

// בחירת מודל סנריו לפי שפה
function getScenarioModelByLang(langRaw) {
  const lang = String(langRaw || '').toLowerCase();
  return lang === 'he' ? ScenarioHe : Scenario; // ברירת מחדל: אנגלית
}

// בחירת שפה מהבקשה (query/header) עם נפילה ל-en
function pickLang(req) {
  return (
    req.query.lang ||
    req.headers['x-lang'] ||
    (req.headers['accept-language'] || '').split(',')[0] ||
    'en'
  );
}

/** ⚖️ בחירה מאוזנת בין ארבע קבוצות (A,B,C,D) */
async function assignBalancedGroup() {
  const groups = ['A','B','C','D'];
  const counts = await Trial.aggregate([{ $group: { _id: '$group', n: { $sum: 1 } } }]);
  const mapCounts = new Map(counts.map(c => [c._id, c.n]));
  let min = Infinity;
  groups.forEach(g => { min = Math.min(min, mapCounts.get(g) || 0); });
  const candidates = groups.filter(g => (mapCounts.get(g) || 0) === min);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * POST /api/assign
 * קלט: { anonId, lang? }
 * פלט: { groupType, group, scenarioId, scenario: {...} }
 * אם כבר שובץ בעבר – מחזיר את אותו שיבוץ + פרטי הסנריו (idempotent)
 */
router.post('/assign', async (req, res) => {
  try {
    const { anonId, lang: bodyLang } = req.body || {};
    if (!anonId) return res.status(400).json({ error: 'anonId is required' });

    const lang = bodyLang || pickLang(req);
    const PROJ = { _id: 0, title: 1, text: 1, reflection: 1, selTags: 1, assignedGroupType: 1, version: 1 };


    // אם כבר יש שיבוץ – נחזיר אותו (בשפה המבוקשת + fallback)
    const existing = await Trial.findOne({ anonId }).lean();
if (existing) {
  const [scenarioHe, scenarioEn] = await Promise.all([
    ScenarioHe.findOne(
      { scenarioId: existing.scenarioId, active: { $ne: false } },
      PROJ
    ).lean(),
    Scenario.findOne(
      { scenarioId: existing.scenarioId, active: { $ne: false } },
      PROJ
    ).lean()
  ]);

  if (!scenarioHe && !scenarioEn) {
    return res.status(500).json({
      error: 'scenario_not_found',
      details: `Scenario ${existing.scenarioId} not found or inactive`
    });
  }

  return res.json({
    groupType: existing.groupType,
    group: existing.group,
    scenarioId: existing.scenarioId,
    scenarios: { he: scenarioHe, en: scenarioEn }
  });
}


    // 1) בוחרים קבוצה מאוזנת 1:1:1:1
    const group = await assignBalancedGroup();
    const groupType = groupTypeByLetter(group);

    // 2) סנריו קבוע לפי הקבוצה
    const scenarioId = GROUP_SCENARIO[group];

// 3) מאתרים את שתי הגרסאות של הסנריו (he + en)
const [scenarioHe, scenarioEn] = await Promise.all([
  ScenarioHe.findOne({ scenarioId, active: { $ne: false } }, PROJ).lean(),
  Scenario.findOne(  { scenarioId, active: { $ne: false } }, PROJ).lean()
]);

if (!scenarioHe && !scenarioEn) {
  return res.status(500).json({
    error: 'scenario_not_found',
    details: `Scenario ${scenarioId} not found or inactive`
  });
}

    // 4) שומרים את השיבוץ
    await Trial.create({ anonId, groupType, group, scenarioId });

    // 5) מחזירים הכל לפרונט
    res.json({
  groupType,
  group,
  scenarioId,
  scenarios: { he: scenarioHe, en: scenarioEn }
});

  } catch (err) {
    console.error('assign error:', err);
    res.status(500).json({ error: 'assignment_failed', details: err.message });
  }
});

/** GET /api/trial/:anonId – מחזיר את השיבוץ + פרטי הסנריו (לפי שפה + fallback) */
router.get('/trial/:anonId', async (req, res) => {
  try {
    const { anonId } = req.params;
    const lang = pickLang(req);
    const ScenarioModel = getScenarioModelByLang(lang);

    const trial = await Trial.findOne({ anonId }).lean();
    if (!trial) return res.status(404).json({ error: 'not_found' });

    let scenario = await ScenarioModel.findOne(
      { scenarioId: trial.scenarioId, active: { $ne: false } },
      { _id: 0, title: 1, text: 1, reflection: 1, selTags: 1, assignedGroupType: 1, version: 1 }
    ).lean();

    // fallback לאנגלית אם לא קיים בעברית
    if (!scenario && String(lang).toLowerCase() === 'he') {
      scenario = await Scenario.findOne(
        { scenarioId: trial.scenarioId, active: { $ne: false } },
        { _id: 0, title: 1, text: 1, reflection: 1, selTags: 1, assignedGroupType: 1, version: 1 }
      ).lean();
    }

    res.json({
      anonId: trial.anonId,
      groupType: trial.groupType,
      group: trial.group,
      scenarioId: trial.scenarioId,
      assignedAt: trial.assignedAt,
      scenario
    });
  } catch (err) {
    console.error('get trial error:', err);
    res.status(500).json({ error: 'server_error', details: err.message });
  }
});

module.exports = router;
