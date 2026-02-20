const mongoose = require('mongoose');

const UeqAssessmentSchema = new mongoose.Schema(
  {
    anonId: { type: String, required: false },
    groupType: { type: String, required: false },
    lang: { type: String, default: 'he' },

    responses: {
      type: Map,
      of: Number, // ערכי 1-7
      required: true,
    },

    scores: {
      pragmaticScore: Number,
      hedonicScore: Number,
      overallScore: Number,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.UeqAssessment ||
  mongoose.model('UeqAssessment', UeqAssessmentSchema);
