const router = require('express').Router();
const SelQuestion = require('../models/SelQuestion');
const SelAssessment = require('../models/SelAssessment');

// אם יש לך מודל לקולקציה עברית נפרדת – ייטען; אם לא, נתעלם
let SelQuestionHe = null;
try {
  SelQuestionHe = require('../models/SelQuestion.he');
} catch (_) {
  // no-op: עובדים רק עם SelQuestion מרובה-שפות
}

/**
 * GET /api/questionnaires/casel?version=v1&lang=en|he&phase=both|pre|post&active=true
 * טוען את השאלות (PRE/POST/BOTH) לפי גרסה/שפה, עם fallback הגיוני.
 */
router.get('/questionnaires/casel', async (req, res) => {
  try {
    let { version = 'v1', lang = 'en', phase = 'both', active = 'true' } = req.query;

    lang = String(lang).toLowerCase() === 'he' ? 'he' : 'en';
    const isActive = ['true','1','yes','on'].includes(String(active).toLowerCase());

    const phaseFilter =
      phase === 'pre'  ? { $in: ['both', 'pre'] } :
      phase === 'post' ? { $in: ['both', 'post'] } :
                         { $in: ['both', 'pre', 'post'] };

    const baseQuery = { version, phase: phaseFilter };
    let items = [];
    let usedLang = lang;
    let fallback = false;

    if (lang === 'he') {
      // 1) נסה קודם את הקולקציה הרב-לשונית עם lang='he'
      const qHeInMain = { ...baseQuery, lang: 'he' };
      if (isActive) qHeInMain.active = { $ne: false };
      items = await SelQuestion.find(qHeInMain).sort({ order: 1, createdAt: 1 }).lean();

      // 2) אם אין – נסה קולקציה עברית נפרדת (אם קיימת)
      if ((!items || !items.length) && SelQuestionHe) {
        const qHeSeparate = { ...baseQuery };
        if (isActive) qHeSeparate.active = { $ne: false };
        items = await SelQuestionHe.find(qHeSeparate).sort({ order: 1, createdAt: 1 }).lean();
        usedLang = items && items.length ? 'he' : usedLang;
      }

      // 3) אם עדיין אין – פולבק לאנגלית
      if (!items || !items.length) {
        const qEn = { ...baseQuery, lang: 'en' };
        if (isActive) qEn.active = { $ne: false };
        items = await SelQuestion.find(qEn).sort({ order: 1, createdAt: 1 }).lean();
        if (items && items.length) { usedLang = 'en'; fallback = true; }
      }
    } else {
      // lang === 'en'
      const qEn = { ...baseQuery, lang: 'en' };
      if (isActive) qEn.active = { $ne: false };
      items = await SelQuestion.find(qEn).sort({ order: 1, createdAt: 1 }).lean();
    }

    res.set('Content-Language', usedLang);
    return res.json({
      _id: `casel-${version}-${usedLang}`,
      key: 'casel',
      version,
      lang: usedLang,
      fallback,         // true רק אם ביקשו he ונפלנו ל-en
      items,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load questionnaire' });
  }
});

/**
 * GET /api/assessments/status?anonId=...&phase=pre|post
 * בודק אם ה־PRE/POST כבר הושלם עבור anonId.
 */
router.get('/assessments/status', async (req, res) => {
  try {
    const { anonId, phase } = req.query;
    if (!anonId || !phase) {
      return res.status(400).json({ error: 'anonId_and_phase_required' });
    }

    const doc = await SelAssessment.findOne(
      { anonId, phase },
      { _id: 1, phase: 1, completedAt: 1, endedAt: 1 }
    ).lean();

    return res.json({
      anonId,
      phase,
      completed: Boolean(doc?.completedAt),
      endedAt: doc?.endedAt || null,
      assessmentId: doc?._id || null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'status_failed' });
  }
});

/**
 * POST /api/assessments
 * body: { anonId, version, lang, phase, startedAt, endedAt, answers:[{questionKey,value}] }
 * שמירה אידמפוטנטית: אם כבר הושלם — 409; אם לא — סוגר (completedAt).
 */
router.post('/assessments', async (req, res) => {
  try {
    const {
      anonId,
      version = 'v1',
      lang: rawLang = 'en',
      startedAt,
      endedAt,
      answers = [],
      phase = 'pre'
    } = req.body || {};

    if (!anonId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'anonId and answers are required' });
    }

    const lang = String(rawLang).toLowerCase() === 'he' ? 'he' : 'en';

    // אימות שהמפתחות קיימים בשאלון לגרסה/שפה הנתונות
    const keys = answers.map(a => a.questionKey).filter(Boolean);

    let valid = false;
    if (lang === 'he') {
      // קודם ננסה בקולקציה הרב-לשונית
      let found = await SelQuestion.countDocuments({ version, lang: 'he', key: { $in: keys } });
      if (found === keys.length) {
        valid = true;
      } else if (SelQuestionHe) {
        // ננסה בקולקציה העברית הנפרדת
        found = await SelQuestionHe.countDocuments({ version, key: { $in: keys } });
        if (found === keys.length) valid = true;
      }
    } else {
      const found = await SelQuestion.countDocuments({ version, lang: 'en', key: { $in: keys } });
      if (found === keys.length) valid = true;
    }

    if (!valid) {
      return res.status(400).json({ error: 'Some questionKey values are invalid' });
    }

    // אם כבר הושלם — חסימה רכה
    const existing = await SelAssessment.findOne({ anonId, phase }, { completedAt: 1 }).lean();
    if (existing?.completedAt) {
      return res.status(409).json({ error: 'PHASE_ALREADY_COMPLETED' });
    }

    const now = new Date();

    // נוודא שהערכים בטווח 1–4 (אם השאלון שלך הוא 4-נקודות)
    const sanitizedAnswers = answers.map(a => {
      const v = Number(a.value);
      const clamped = Number.isFinite(v) ? Math.min(4, Math.max(1, v)) : null;
      return { questionKey: a.questionKey, value: clamped };
    });

    const update = {
      questionnaireKey: 'casel',
      version,
      lang,
      phase,
      ...(startedAt ? { startedAt: new Date(startedAt) } : {}),
      endedAt: endedAt ? new Date(endedAt) : now,
      answers: sanitizedAnswers,
      completedAt: now, // נועל סופית את השלב
    };

    const doc = await SelAssessment.findOneAndUpdate(
      { anonId, phase },
      { $setOnInsert: { anonId }, $set: update },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, id: doc._id, completedAt: doc.completedAt });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: 'PHASE_ALREADY_COMPLETED_OR_EXISTS' });
    }
    console.error(e);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

module.exports = router;