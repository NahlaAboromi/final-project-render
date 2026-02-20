// api/models/Scenario.he.js
const mongoose = require('mongoose');

const ScenarioHeSchema = new mongoose.Schema({
  scenarioId: { type: String, required: true, unique: true, index: true }, // S1 / S3 / ...
  title: { type: String, required: true },        // בעברית ב-seed
  text: { type: String, required: true },         // בעברית ב-seed
  reflection: { type: [String], default: [] },    // בעברית ב-seed
  selTags: { type: [String], default: [] },       // בעברית ב-seed (או אנגלית אם תרצי עקביות עם קוד לקוח)
  assignedGroupType: {
    type: String,
    enum: ['experimental', 'control'],
    required: true
  },
  active: { type: Boolean, default: true },
  version: { type: String, default: 'v1' },
  sourceType: { type: String, default: 'real_case' }
}, {
  timestamps: true,
  collection: 'scenarios_he' // קולקציה נפרדת לעברית
});

// ייחודיות בתוך קולקציית העברית
// (אם תרצי לפי גרסה: בטלי unique למעלה והשתמשי בזה:)
// ScenarioHeSchema.index({ scenarioId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('ScenarioHe', ScenarioHeSchema);
