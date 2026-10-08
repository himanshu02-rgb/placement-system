const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    extractedText: { type: String },
    aiAnalysis: {
      skills: [{ type: String }],
      strengths: [{ type: String }],
      missingSkills: [{ type: String }],
      suggestions: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);