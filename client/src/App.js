import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import './App.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

  const handleDeleteMetric = async (id) => {
    await axios.delete(`/api/metrics/${id}`);
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
    <div style={{ maxWidth: 1000, margin: '2rem auto', fontFamily: 'sans-serif' }}>
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
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2>Bar Chart</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Pie Chart</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <h2>Latest Metrics (Table)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Value</th>
            <th>Timestamp</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m._id}>
              <td>{m.type}</td>
              <td>{m.value}</td>
              <td>{new Date(m.timestamp).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDeleteMetric(m._id)} style={{ color: 'red' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
