// api/seed/seedUeqQuestions.he.js
const UeqQuestionHe = require('../models/UeqQuestion.he');

async function seedUeqQuestionsHe({ data, version = 'ueq-s-v1' }) {
  if (!Array.isArray(data)) {
    throw new Error('seedUeqQuestionsHe: data must be an array');
  }

  for (const q of data) {
    await UeqQuestionHe.updateOne(
      { version, key: q.key },
      { $set: q },
      { upsert: true }
    );
  }

  const keys = data.map(q => q.key);
  await UeqQuestionHe.updateMany(
    { version, key: { $nin: keys } },
    { $set: { active: false } }
  );
}

module.exports = { seedUeqQuestionsHe };
