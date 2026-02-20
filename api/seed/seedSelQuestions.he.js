// api/seed/seedSelQuestions.he.js
const SelQuestionHe = require('../models/SelQuestion.he');

/**
 * זורע שאלות SEL בעברית (idempotent) לקולקציה sel_questions_he
 * @param {Object} opts
 * @param {Array}  opts.data    מערך שאלות (key/category/text/options/order/...)
 * @param {String} opts.version גרסה (ברירת מחדל 'v1')
 */
async function seedSelQuestionsHe({ data, version = 'v1' } = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('seedSelQuestionsHe: data[] is required');
  }

  const seen = new Set();
  for (const q of data) {
    if (!q.key) throw new Error('seedSelQuestionsHe: each item must have key');
    if (seen.has(q.key)) throw new Error(`Duplicate key in seed: ${q.key}`);
    seen.add(q.key);
  }

  const ops = data.map((q) => ({
    updateOne: {
      filter: { version, key: q.key },
      update: { $set: { ...q, version } },
      upsert: true,
    },
  }));

  const res = await SelQuestionHe.bulkWrite(ops, { ordered: false });
  const upserts = res.upsertedCount ?? 0;
  const modified = res.modifiedCount ?? 0;
  console.log(`🌱 SEL HE seed done (${version}) → upserts=${upserts}, modified=${modified}`);
}

module.exports = { seedSelQuestionsHe };
