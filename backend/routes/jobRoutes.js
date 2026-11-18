const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  parseJobDescription,
} = require('../controllers/jobController');
const { applyToJob } = require('../controllers/applicationController');
const { protect, admin, studentOnly } = require('../middleware/authMiddleware');
const jdUpload = require('../middleware/jdUploadMiddleware');

const router = express.Router();

// Runs multer and turns upload errors (wrong file type, too large) into a JSON 400.
// Without this, Express would return an HTML error page.
const handleJdUpload = (req, res, next) => {
  jdUpload.single('jd')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Both students and admins can read a JD PDF, so this only needs protect.
router.post('/parse-jd', protect, handleJdUpload, parseJobDescription);

router.post('/', protect, admin, createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/:id/apply', protect, studentOnly, applyToJob);

module.exports = router;