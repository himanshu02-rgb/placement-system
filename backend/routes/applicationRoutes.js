const express = require('express');
const {
  getMyApplications,
  updateApplicationStatus,
  getDashboardStats,
} = require('../controllers/applicationController');
const { protect, admin,studentOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect,studentOnly, getMyApplications);
router.get('/stats', protect, getDashboardStats);
router.put('/:id', protect, admin, updateApplicationStatus);

module.exports = router;