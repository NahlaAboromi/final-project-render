const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionKey: { type: String, required: true },
  value: { type: Number, required: true },
}, { _id: false });

const SelAssessmentSchema = new mongoose.Schema({
  anonId: { type: String, index: true, required: true },
  questionnaireKey: { type: String, default: 'casel' },
  version: { type: String, default: 'v1' },
  lang: { type: String, default: 'en' },

  phase: { type: String, enum: ['pre', 'post'], required: true, default: 'pre' },

  startedAt: { type: Date },
  endedAt:   { type: Date },

  // ✅ חדש: מסמן שהשאלון לשלב הזה הושלם וננעל
  completedAt: { type: Date },

  answers: { type: [AnswerSchema], default: [] },
}, { timestamps: true });

// ✅ חדש: מונע יותר מרשומה אחת לכל anonId+phase
SelAssessmentSchema.index({ anonId: 1, phase: 1 }, { unique: true });

module.exports = mongoose.model('SelAssessment', SelAssessmentSchema);
