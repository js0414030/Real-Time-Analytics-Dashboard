const express = require('express');
const cors = require('cors');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/metrics', analyticsRoutes);

module.exports = app; 