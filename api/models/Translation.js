// api/models/Translation.js
const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
  key: { type: String, unique: true, index: true }, // hash (source+target+text)
  sourceLang: { type: String, required: true },
  targetLang: { type: String, required: true },
  text: { type: String, required: true },
  translatedText: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Translation', TranslationSchema);
