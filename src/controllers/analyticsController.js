const Metric = require('../models/Metric');

exports.createMetric = async (req, res) => {
    try {
        const metric = new Metric(req.body);
        await metric.save();
        res.status(201).json(metric);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getMetrics = async (req, res) => {
    try {
        const metrics = await Metric.find().sort({ timestamp: -1 }).limit(100);
        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 