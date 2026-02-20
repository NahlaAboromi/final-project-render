// models/Scenario.js
const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  scenarioId: { type: String, required: true, unique: true, index: true }, // S1 / S3 / S10 / S14
  title: { type: String, required: true },
  text: { type: String, required: true },           // גוף הסנריו
  reflection: { type: [String], default: [] },      // שאלות רפלקציה
  selTags: { type: [String], default: [] },         // תכונות SEL הנמדדות
  assignedGroupType: {                               // לאיזו קטגוריה הסנריו מיועד
    type: String,
    enum: ['experimental', 'control'],
    required: true
  },
  active: { type: Boolean, default: true },
  version: { type: String, default: 'v1' },
  sourceType: { type: String, default: 'real_case' }
}, { timestamps: true });

module.exports = mongoose.model('Scenario', ScenarioSchema);
