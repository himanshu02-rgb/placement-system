const mongoose = require('mongoose');

// Hiring stages, in order. "Rejected" can be set at any stage.
const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    // The resume the student sent with this application.
    // Optional, because applications made before this change have no resume.
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    status: {
      type: String,
      enum: STAGES,
      default: 'Applied',
    },
  },
  { timestamps: true }
);

const Application = mongoose.model('Application', applicationSchema);

// Attach the list so controllers can validate against the same source as the schema.
Application.STAGES = STAGES;

module.exports = Application;