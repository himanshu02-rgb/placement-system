const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { resumeAnalysis, jobMatch, interviewGenerate, interviewEvaluate } = require('../controllers/aiController');

router.post('/resume-analysis', protect, resumeAnalysis);
router.post('/job-match', protect, jobMatch);
router.post('/interview/generate', protect, interviewGenerate);
router.post('/interview/evaluate', protect, interviewEvaluate);

module.exports = router;