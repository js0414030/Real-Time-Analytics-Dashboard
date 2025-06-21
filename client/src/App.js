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
  const [extraFields, setExtraFields] = useState([{ key: '', value: '' }]);

  const fetchMetrics = async () => {
    const res = await axios.get('/api/metrics');
    console.log('API response:', res.data); // Debug log
    setMetrics(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchMetrics();
    // Poll every 2 seconds for real-time updates
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleExtraFieldChange = (idx, field, val) => {
    const updated = [...extraFields];
    updated[idx][field] = val;
    setExtraFields(updated);
  };

  const handleAddExtraField = () => {
    setExtraFields([...extraFields, { key: '', value: '' }]);
  };

  const handleRemoveExtraField = (idx) => {
    setExtraFields(extraFields.filter((_, i) => i !== idx));
  };

  const handleAddMetric = async (e) => {
    e.preventDefault();
    if (!type || !value) return;
    const data = {};
    extraFields.forEach(f => {
      if (f.key) data[f.key] = f.value;
    });
    await axios.post('/api/metrics', { type, value: Number(value), data });
    setType('');
    setValue('');
    setExtraFields([{ key: '', value: '' }]);
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

  // Aggregate live metrics
  const totalPageViews = metrics.filter(m => m.type === 'page_view').length;
  const totalClicks = metrics.filter(m => m.type === 'button_click').length;
  const totalConversions = metrics.filter(m => m.type === 'conversion').length;
  const conversionRate = totalPageViews > 0 ? (totalConversions / totalPageViews) * 100 : 0;

  // Analytics event tracker
  const trackEvent = async (type, data = {}) => {
    try {
      await axios.post('/api/metrics', { type, value: 1, data });
      fetchMetrics(); // update dashboard after event
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    // Track page view on load/refresh
    trackEvent('page_view', { path: window.location.pathname });
    // Track engagement: any click on the page
    const handleClick = (e) => {
      trackEvent('button_click', { tag: e.target.tagName, id: e.target.id || undefined });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Real-Time Analytics Dashboard</h1>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <h3>Traffic</h3>
          <p style={{ fontSize: 24, margin: 0 }}>{totalPageViews}</p>
          <span style={{ color: '#888' }}>Page Views</span>
        </div>
        <div style={{ flex: 1, background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <h3>Engagement</h3>
          <p style={{ fontSize: 24, margin: 0 }}>{totalClicks}</p>
          <span style={{ color: '#888' }}>Button Clicks</span>
        </div>
        <div style={{ flex: 1, background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <h3>Conversions</h3>
          <p style={{ fontSize: 24, margin: 0 }}>{totalConversions}</p>
          <span style={{ color: '#888' }}>Conversions</span>
          <div style={{ marginTop: 8 }}>
            <b>Conversion Rate:</b> {conversionRate.toFixed(2)}%
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => trackEvent('conversion', { path: window.location.pathname })} style={{ background: '#4caf50', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Simulate Conversion
        </button>
      </div>
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
        {extraFields.map((field, idx) => (
          <span key={idx} style={{ marginRight: 8 }}>
            <input
              type="text"
              placeholder="Key"
              value={field.key}
              onChange={e => handleExtraFieldChange(idx, 'key', e.target.value)}
              style={{ width: 80, marginRight: 4 }}
            />
            <input
              type="text"
              placeholder="Value"
              value={field.value}
              onChange={e => handleExtraFieldChange(idx, 'value', e.target.value)}
              style={{ width: 80, marginRight: 4 }}
            />
            <button type="button" onClick={() => handleRemoveExtraField(idx)} disabled={extraFields.length === 1}>-</button>
          </span>
        ))}
        <button type="button" onClick={handleAddExtraField} style={{ marginRight: 8 }}>+</button>
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
            <th>Extra Fields</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {metrics.filter(m => !['page_view', 'button_click', 'conversion'].includes(m.type)).map((m) => (
            <tr key={m._id}>
              <td>{m.type}</td>
              <td>{m.value}</td>
              <td>{new Date(m.timestamp).toLocaleString()}</td>
              <td>
                {m.data && typeof m.data === 'object' && Object.keys(m.data).length > 0 ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {Object.entries(m.data).map(([k, v]) => (
                      <li key={k}><b>{k}:</b> {v}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: '#888' }}>-</span>
                )}
              </td>
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
