//C:\Users\n0502\OneDrive\שולחן העבודה\פרויקט סוף\final_project-main\final_project-main\api\models\SelQuestion.js
const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true }
}, { _id: false });

const SelQuestionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  category: { type: String, required: true },
  text: { type: String, required: true },
  order: { type: Number, required: true },
  phase: { type: String, enum: ['pre','post','both'], default: 'both' },
  version: { type: String, default: 'v1' },
  lang: { type: String, default: 'en' },
  active: { type: Boolean, default: true },

  // ➕ הוספנו את ארבעת האפשרויות
  options: { type: [OptionSchema], default: [] }

}, { timestamps: true });

SelQuestionSchema.index({ version: 1, lang: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('SelQuestion', SelQuestionSchema);
