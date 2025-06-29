const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., 'traffic', 'engagement'
    value: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    data: { type: mongoose.Schema.Types.Mixed, default: {} } // for arbitrary key-value pairs
});

module.exports = mongoose.model('Metric', MetricSchema); 