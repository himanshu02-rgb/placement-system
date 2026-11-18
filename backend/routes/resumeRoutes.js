const express = require('express');
const { uploadResume, getMyResume, getMyResumes } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getMyResume);        // unchanged: newest resume
router.get('/mine', protect, getMyResumes);   // new: list of all my resumes

module.exports = router;