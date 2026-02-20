// api/routers/translate.route.js
const express = require('express');
const crypto = require('crypto');
const Translation = require('../models/Translation');
const { translateBatch } = require('../services/deepl.service');

const router = express.Router();

function makeKey({ sourceLang, targetLang, text }) {
  return crypto.createHash('sha256')
    .update(`${sourceLang}::${targetLang}::${text}`, 'utf8')
    .digest('hex');
}

/**
 * POST /api/translate
 * body: { sourceLang: "EN", targetLang: "HE", texts: ["Start", "Submit", ...] }
 * resp: { translations: ["התחל", "שליחה", ...] }
 */
router.post('/translate', async (req, res) => {
  try {
    const { sourceLang = 'EN', targetLang = 'HE', texts } = req.body || {};
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'texts must be a non-empty array' });
    }

    // שמירה על הסדר המקורי
    const original = texts.map((t, i) => ({ i, t, key: makeKey({ sourceLang, targetLang, text: t }) }));

    // 1) בדיקת קאש
    const keys = original.map(o => o.key);
    const cached = await Translation.find({ key: { $in: keys } }).lean();
    const cacheMap = new Map(cached.map(c => [c.key, c.translatedText]));

    // 2) אילו חסרים בקאש?
    const missing = original.filter(o => !cacheMap.has(o.key));
    let newlyTranslated = [];

    if (missing.length > 0) {
      // תרגום בבאצ' אחד
      const translated = await translateBatch({
        texts: missing.map(m => m.t),
        sourceLang,
        targetLang
      });

      // שמירה בקאש
      newlyTranslated = await Promise.all(missing.map((m, idx) => {
        const doc = {
          key: m.key,
          sourceLang,
          targetLang,
          text: m.t,
          translatedText: translated[idx],
          updatedAt: new Date()
        };
        return Translation.findOneAndUpdate({ key: m.key }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
      }));

      newlyTranslated.forEach(nt => cacheMap.set(nt.key, nt.translatedText));
    }

    // 3) הרכבת תשובה לפי סדר המקור
    const translations = original.map(o => cacheMap.get(o.key) || o.t);
    res.json({ translations });
  } catch (err) {
    console.error('translate error:', err?.response?.data || err.message);
    if (err?.response?.status === 456) {
      return res.status(503).json({ error: 'DeepL quota exceeded (456)' });
    }
    return res.status(500).json({ error: 'translate failed' });
  }
});

module.exports = router;
