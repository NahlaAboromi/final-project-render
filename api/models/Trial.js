// models/Trial.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['student', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ChatStatsSchema = new mongoose.Schema({
  turns: { type: Number, default: 0 },
  studentTurns: { type: Number, default: 0 },
  aiTurns: { type: Number, default: 0 },
  durationSec: { type: Number, default: 0 },
}, { _id: false });

// ✅ רפלקציה סופית שנשמרת בעת Finish & Continue
const FinalReflectionSchema = new mongoose.Schema({
  insight:     { type: String, required: true },
  usefulness:  { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const TrialSchema = new mongoose.Schema({
  anonId:     { type: String, required: true, unique: true, index: true },
  groupType:  { type: String, enum: ['experimental', 'control'], required: true },
  group:      { type: String, enum: ['A','B','C','D'], required: true },
  scenarioId: { type: String, required: true },

  assignedAt: { type: Date, default: Date.now },
  startedAt:  { type: Date, default: null },
  endedAt:    { type: Date, default: null },

  // תשובות לסימולציה
  answers: { type: [String], default: [] },

  // ניתוח ראשוני (לגאסי טקסט חופשי)
  aiAnalysis: { type: String, default: '' },

  // ✅ ניתוח מובנה (חדש)
  aiAnalysisJson: { type: Object, default: {} },

  // צ'אט (לניסוי בלבד)
  chatLog: { type: [MessageSchema], default: [] },

  // ⭐ סיכום/משוב בסוף הצ'אט (רשות)
  aiConversationSummary: { type: String, default: '' },
  aiRecommendations:     { type: [String], default: [] },
  chatStats:             { type: ChatStatsSchema, default: undefined },

  // ✅ רפלקציה סופית של הסטודנט (נשמרת עם anonId)
  finalReflection: { type: FinalReflectionSchema, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Trial', TrialSchema);
