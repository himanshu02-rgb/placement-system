const express = require('express');
const {
  uploadResume,
  getMyResume,
  getMyResumes,
  getResumeFile,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getMyResume);        // newest resume
router.get('/mine', protect, getMyResumes);   // all my resumes
router.get('/:id/file', protect, getResumeFile); // PDF, with access check

module.exports = router;