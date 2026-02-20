// api/models/SelQuestion.he.js
const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true }
}, { _id: false });

const SelQuestionHeSchema = new mongoose.Schema({
  key: { type: String, required: true },
  category: { type: String, required: true }, // בעברית ב-seed
  text: { type: String, required: true },     // בעברית ב-seed
  order: { type: Number, required: true },
  phase: { type: String, enum: ['pre','post','both'], default: 'both' },
  version: { type: String, default: 'v1' },
  active: { type: Boolean, default: true },
  options: { type: [OptionSchema], default: [] }
}, {
  timestamps: true,
  collection: 'sel_questions_he' // קולקציה נפרדת לעברית
});

// ייחודיות לגרסה+מפתח (ללא lang כי זו קולקציה ייעודית לעברית)
SelQuestionHeSchema.index({ version: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('SelQuestionHe', SelQuestionHeSchema);
