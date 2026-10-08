const express = require('express');
const { createJob, getJobs, getJobById } = require('../controllers/jobController');
const { applyToJob } = require('../controllers/applicationController');
const { protect, admin, studentOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, admin, createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/:id/apply', protect, studentOnly, applyToJob);

module.exports = router;