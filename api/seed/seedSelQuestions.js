// seed/seedSelQuestions.js
const SelQuestion = require('../models/SelQuestion');

/**
 * זורע שאלות SEL לבסיס הנתונים (idempotent).
 * @param {Object} opts
 * @param {Array}  opts.data   - מערך השאלות לזריעה (עם key/category/text/options/order/...)
 * @param {String} opts.version- גרסת השאלון (ברירת מחדל 'v1')
 * @param {String} opts.lang   - שפה (ברירת מחדל 'en')
 */
async function seedSelQuestions({ data, version = 'v1', lang = 'en' } = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('seedSelQuestions: data[] is required');
  }

  // נוודא שלכל פריט יש key יחיד
  const seen = new Set();
  for (const q of data) {
    if (!q.key) throw new Error('seedSelQuestions: each item must have key');
    if (seen.has(q.key)) throw new Error(`Duplicate key in seed: ${q.key}`);
    seen.add(q.key);
  }

  const ops = data.map((q) => ({
    updateOne: {
      filter: { version, lang, key: q.key },
      update: { $set: q },
      upsert: true,
    },
  }));

  const res = await SelQuestion.bulkWrite(ops, { ordered: false });
  const upserts = res.upsertedCount ?? 0;
  const modified = res.modifiedCount ?? 0;
  console.log(`🌱 SEL seed done (${version}/${lang}) → upserts=${upserts}, modified=${modified}`);
}

module.exports = { seedSelQuestions };
