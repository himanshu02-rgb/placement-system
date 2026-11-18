const express = require('express');
const {
  getMyApplications,
  updateApplicationStatus,
  getDashboardStats,
} = require('../controllers/applicationController');
const { protect, admin, studentOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, studentOnly, getMyApplications);
router.get('/stats', protect, getDashboardStats);

// Recruiter moves an application to a new stage.
// Replaces the old PUT /:id route, which allowed any admin to change any application.
router.patch('/:id/status', protect, admin, updateApplicationStatus);

module.exports = router;