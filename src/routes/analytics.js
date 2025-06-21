const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.post('/', analyticsController.createMetric);
router.get('/', analyticsController.getMetrics);
router.delete('/:id', analyticsController.deleteMetric);

module.exports = router; 