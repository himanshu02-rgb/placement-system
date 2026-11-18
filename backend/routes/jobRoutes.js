const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getJobApplicants,
  parseJobDescription,
} = require('../controllers/jobController');
const { applyToJob } = require('../controllers/applicationController');
const { protect, admin, studentOnly } = require('../middleware/authMiddleware');
const jdUpload = require('../middleware/jdUploadMiddleware');

const router = express.Router();

// Runs multer and turns upload errors (wrong file type, too large) into a JSON 400.
const handleJdUpload = (req, res, next) => {
  jdUpload.single('jd')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Order matters: "/mine" must come before "/:id", or Express treats "mine" as a job id.
router.post('/parse-jd', protect, handleJdUpload, parseJobDescription);
router.post('/', protect, admin, createJob);
router.get('/mine', protect, admin, getMyJobs);
router.get('/', getJobs);
router.get('/:id/applicants', protect, admin, getJobApplicants);
router.get('/:id', getJobById);
router.post('/:id/apply', protect, studentOnly, applyToJob);

module.exports = router;