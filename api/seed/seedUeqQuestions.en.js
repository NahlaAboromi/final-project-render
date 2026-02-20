// api/seed/seedUeqQuestions.en.js
const UeqQuestionEn = require('../models/UeqQuestion.en');

async function seedUeqQuestionsEn({ data, version = 'ueq-s-v1' }) {
  if (!Array.isArray(data)) {
    throw new Error('seedUeqQuestionsEn: data must be an array');
  }

  for (const q of data) {
    await UeqQuestionEn.updateOne(
      { version, key: q.key },  // מזהה ייחודי
      { $set: q },              // לעדכן את כל השדות מה-seed
      { upsert: true }          // ליצור אם לא קיים
    );
  }

  const keys = data.map(q => q.key);
  // (אופציונלי) לכבות שאלות ישנות שלא ברשימה
  await UeqQuestionEn.updateMany(
    { version, key: { $nin: keys } },
    { $set: { active: false } }
  );
}

module.exports = { seedUeqQuestionsEn };
