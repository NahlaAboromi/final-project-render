// api/models/UeqQuestion.he.js
const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true }
}, { _id: false });

const UeqQuestionHeSchema = new mongoose.Schema({
  key:      { type: String, required: true },  // למשל: 'ueqs01'
  category: { type: String, required: true },  // Pragmatic / Hedonic (אפשר בעברית ב-seed)
  text:     { type: String, required: true },  // הטקסט בעברית (עם שני קטבים)
  order:    { type: Number, required: true },

  // גם אם UEQ-S הוא רק בסוף – נשמור את אותו enum כמו ב-SEL:
  phase:   { type: String, enum: ['pre','post','both'], default: 'post' },

  // לשמור על זיהוי גרסה ברור
  version: { type: String, default: 'ueq-s-v1' },

  active:  { type: Boolean, default: true },
  options: { type: [OptionSchema], default: [] }
}, {
  timestamps: true,
  collection: 'ueq_questions_he'  // קולקציה נפרדת לעברית
});

// ייחודיות לגרסה + מפתח
UeqQuestionHeSchema.index({ version: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('UeqQuestionHe', UeqQuestionHeSchema);
