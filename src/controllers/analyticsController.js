const Metric = require('../models/Metric');

exports.createMetric = async (req, res) => {
    try {
        const { type, value, data } = req.body;
        const metric = new Metric({ type, value, data });
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

exports.deleteMetric = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Metric.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Metric not found' });
        }
        res.json({ message: 'Metric deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 