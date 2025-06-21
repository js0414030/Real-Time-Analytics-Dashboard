const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., 'traffic', 'engagement'
    value: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Metric', MetricSchema); 