const express = require('express');
const router = express.Router();

const UeqQuestionEn = require('../models/UeqQuestion.en');
const UeqQuestionHe = require('../models/UeqQuestion.he');
const UeqAssessment = require('../models/UeqAssessment'); // ⬅️ הוספה חדשה

// --- GET שאלות ---
router.get('/questionnaires/ueq', async (req, res) => {
  const lang = (req.query.lang || 'he').toLowerCase();
  const version = req.query.version || 'ueq-s-v1';
  const phase = req.query.phase || 'post';

  try {
    const Model = lang === 'en' ? UeqQuestionEn : UeqQuestionHe;
    const questions = await Model.find({
      version,
      active: true,
      phase: { $in: ['both', phase] },
    })
      .sort({ order: 1 })
      .lean();

    return res.json(questions);
  } catch (err) {
    console.error('❌ UEQ questionnaire fetch error:', err);
    return res.status(500).json({ message: 'Failed to load UEQ questionnaire' });
  }
});

// --- POST תשובות סטודנט ---
router.post('/ueq/assessments', async (req, res) => {
  try {
    const { anonId, groupType, lang, responses, scores } = req.body;

    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Missing UEQ responses' });
    }

    const saved = await UeqAssessment.create({
      anonId,
      groupType,
      lang,
      responses,
      scores,
    });

    return res.status(201).json({ ok: true, id: saved._id });
  } catch (err) {
    console.error('❌ UEQ-S save error:', err);
    return res.status(500).json({ error: 'Failed to save UEQ assessment' });
  }
});

module.exports = router;
