import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  }, []);

  const handleAddMetric = async (e) => {
    e.preventDefault();
    if (!type || !value) return;
    await axios.post('/api/metrics', { type, value: Number(value) });
    setType('');
    setValue('');
    fetchMetrics();
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
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
      <h2>Latest Metrics</h2>
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
