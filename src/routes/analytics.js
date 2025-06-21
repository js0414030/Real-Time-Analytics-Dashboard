const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.post('/', analyticsController.createMetric);
router.get('/', analyticsController.getMetrics);

module.exports = router; 