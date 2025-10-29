// Dashboard.js
import React, { useEffect, useState } from 'react';

// If using Chart.js, install and import:
// import { Line } from 'react-chartjs-2';

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [topPlugs, setTopPlugs] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/usage');
      const data = await res.json();
      setStats(data);

      // Aggregate total energy
      let sum = 0;
      data.forEach(p => sum += p.totalEnergy);
      setTotalEnergy(sum);

      // Top-consuming plugs
      const sorted = [...data].sort((a, b) => b.totalEnergy - a.totalEnergy);
      setTopPlugs(sorted.slice(0, 4));
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Dummy data for chart. Replace with real API data as needed.
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3'],
    datasets: [
      {
        label: 'Energy Usage',
        data: stats.map(p => p.totalEnergy),
        backgroundColor: 'rgba(99,102,241,0.2)',
        borderColor: 'rgba(99,102,241,1)',
        pointBackgroundColor: 'rgba(99,102,241,1)',
      },
    ],
  };

  return (
    <div style={{ background: '#f2f3fd', minHeight: '100vh', padding: '20px' }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '900px',
        margin: '0 auto',
        boxShadow: '0 8px 24px rgba(44,90,255,0.08)'
      }}>
        <h2>Welcome, Damian</h2>
        {/* Cards */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
          <div style={{
            background: '#e3f6fd',
            borderRadius: '15px',
            padding: '24px',
            minWidth: '180px'
          }}>
            <h3>{stats.length} Plugs</h3>
            <p>Total plugs connected</p>
          </div>
          <div style={{
            background: '#fff0f9',
            borderRadius: '15px',
            padding: '24px',
            minWidth: '180px'
          }}>
            <h3>{totalEnergy.toFixed(2)} Wh</h3>
            <p>Total energy (last 24h)</p>
          </div>
        </div>

        {/* Energy Usage Chart (pseudo, replace comments with Chart.js or similar) */}
        <div style={{ marginBottom: '24px' }}>
          <h3>Usage Statistics</h3>
          <div style={{ background: '#f3f4fb', borderRadius: '16px', padding: '16px' }}>
            {/* Place chart library here */}
            {/* <Line data={chartData} /> */}
            <p>[Energy usage trend chart here]</p>
          </div>
        </div>

        {/* Top consuming plugs */}
        <div style={{ marginBottom: '24px' }}>
          <h3>Top Consuming Plugs</h3>
          <ul>
            {topPlugs.map(plug => (
              <li key={plug._id}>
                <strong>{plug._id}</strong>: {plug.totalEnergy.toFixed(2)} Wh
              </li>
            ))}
          </ul>
        </div>

        {/* All plug stats */}
        <div>
          <h3>All Plug Stats</h3>
          <table style={{ width: '100%', background: '#fff', borderRadius: '10px' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Avg Power (W)</th>
                <th>Total Energy (Wh)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(plug => (
                <tr key={plug._id}>
                  <td>{plug._id}</td>
                  <td>{plug.avgPower.toFixed(2)}</td>
                  <td>{plug.totalEnergy.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
