const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  resumeAnalysis,
  jobMatch,
  interviewGenerate,
  interviewEvaluate,
  interviewSampleAnswer,
} = require('../controllers/aiController');

router.post('/resume-analysis', protect, resumeAnalysis);
router.post('/job-match', protect, jobMatch);
router.post('/interview/generate', protect, interviewGenerate);
router.post('/interview/evaluate', protect, interviewEvaluate);
router.post('/interview/sample', protect, interviewSampleAnswer);

module.exports = router;