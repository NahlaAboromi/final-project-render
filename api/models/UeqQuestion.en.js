// api/models/UeqQuestion.en.js
const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true }
}, { _id: false });

const UeqQuestionEnSchema = new mongoose.Schema({
  key:      { type: String, required: true },  // למשל: 'ueqs01'
  category: { type: String, required: true },  // Pragmatic Quality / Hedonic Quality
  text:     { type: String, required: true },  // הטקסט באנגלית "obstructive / supportive"
  order:    { type: Number, required: true },

  phase:   { type: String, enum: ['pre','post','both'], default: 'post' },
  version: { type: String, default: 'ueq-s-v1' },

  active:  { type: Boolean, default: true },
  options: { type: [OptionSchema], default: [] }
}, {
  timestamps: true,
  collection: 'ueq_questions_en'  // קולקציה נפרדת לאנגלית
});

// ייחודיות לגרסה + מפתח
UeqQuestionEnSchema.index({ version: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('UeqQuestionEn', UeqQuestionEnSchema);
