import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import './App.css';

function App() {
  const [metrics, setMetrics] = useState([]);
  const [type, setType] = useState('');
  const [value, setValue] = useState('');

  const fetchMetrics = async () => {
    const res = await axios.get('/api/metrics');
    setMetrics(res.data);
  };

  useEffect(() => {
    fetchMetrics();
    // Poll every 2 seconds for real-time updates
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddMetric = async (e) => {
    e.preventDefault();
    if (!type || !value) return;
    await axios.post('/api/metrics', { type, value: Number(value) });
    setType('');
    setValue('');
    fetchMetrics();
  };

  // Aggregate data for the chart (sum values by type)
  const chartData = Object.values(
    metrics.reduce((acc, m) => {
      acc[m.type] = acc[m.type] || { type: m.type, value: 0 };
      acc[m.type].value += m.value;
      return acc;
    }, {})
  );

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Real-Time Analytics Dashboard</h1>
      <form onSubmit={handleAddMetric} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Type (e.g. traffic)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          style={{ marginRight: 8 }}
        />
        <input
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          style={{ marginRight: 8 }}
        />
        <button type="submit">Add Metric</button>
      </form>
      <h2>Metrics by Type</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <h2>Latest Metrics (Table)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Value</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m._id}>
              <td>{m.type}</td>
              <td>{m.value}</td>
              <td>{new Date(m.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
