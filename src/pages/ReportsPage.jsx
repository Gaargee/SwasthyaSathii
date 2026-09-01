import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [areaHealth, setAreaHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('daily');

  useEffect(() => { loadReports(); }, [activeReport]);

  const loadReports = async () => {
    setLoading(true);
    try {
      if (activeReport === 'daily') {
        const data = await api.getDailyReport();
        setReport(data.summary);
      } else if (activeReport === 'area') {
        const data = await api.getAreaHealth();
        setAreaHealth(data);
      } else {
        const now = new Date();
        const data = await api.getMonthlyReport(now.getMonth() + 1, now.getFullYear());
        setReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>📊 Reports</h2>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[
          { key: 'daily', label: 'Daily Summary' },
          { key: 'monthly', label: 'Monthly Activity' },
          { key: 'area', label: 'Area Health' },
        ].map(t => (
          <button key={t.key} className={`tab ${activeReport === t.key ? 'active' : ''}`} onClick={() => setActiveReport(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <>
          {/* Daily Report */}
          {activeReport === 'daily' && report && (
            <div>
              <div className="stats-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card"><div className="stat-icon blue"><Icons.Users /></div><div className="stat-info"><h4>{report.totalVisits || 0}</h4><p>Total Visits</p></div></div>
                <div className="stat-card"><div className="stat-icon green"><Icons.User /></div><div className="stat-info"><h4>{report.uniquePatients || 0}</h4><p>Unique Patients</p></div></div>
                <div className="stat-card"><div className="stat-icon red"><Icons.AlertTriangle /></div><div className="stat-info"><h4>{report.urgentCases || 0}</h4><p>Urgent Cases</p></div></div>
              </div>
              {report.visits?.length > 0 && (
                <div className="card">
                  <div className="card-header"><h3>Today's Visits</h3></div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <table>
                      <thead><tr><th>Patient</th><th>Age</th><th>Village</th><th>Type</th><th>Time</th></tr></thead>
                      <tbody>
                        {report.visits.map(v => (
                          <tr key={v.id}>
                            <td><strong>{v.full_name}</strong></td>
                            <td>{v.age}</td>
                            <td>{v.village}</td>
                            <td><span className={`badge ${v.visit_type === 'referral' ? 'urgent' : 'normal'}`}>{v.visit_type}</span></td>
                            <td>{new Date(v.visit_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Monthly Report */}
          {activeReport === 'monthly' && report && (
            <div>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon blue"><Icons.Activity /></div><div className="stat-info"><h4>{report.totalVisits || 0}</h4><p>Monthly Visits</p></div></div>
                <div className="stat-card"><div className="stat-icon green"><Icons.Users /></div><div className="stat-info"><h4>{report.uniquePatients || 0}</h4><p>Patients Visited</p></div></div>
                <div className="stat-card"><div className="stat-icon teal"><Icons.UserPlus /></div><div className="stat-info"><h4>{report.newPatients || 0}</h4><p>New Patients</p></div></div>
                <div className="stat-card"><div className="stat-icon red"><Icons.AlertTriangle /></div><div className="stat-info"><h4>{report.urgentCases || 0}</h4><p>Urgent Cases</p></div></div>
              </div>
              {report.dailyBreakdown?.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-header"><h3>Daily Breakdown</h3></div>
                  <div className="card-body">
                    {report.dailyBreakdown.map(d => (
                      <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                        <span style={{ fontSize: 13, width: 100 }}>{new Date(d.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <div style={{ flex: 1, background: '#F5F5F5', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, d.visits * 10)}%`, height: '100%', background: 'linear-gradient(90deg, #1565C0, #42A5F5)', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, width: 30, textAlign: 'right' }}>{d.visits}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Area Health */}
          {activeReport === 'area' && areaHealth && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <div className="card-header"><h3>Area Summary</h3></div>
                <div className="card-body">
                  <div style={{ fontSize: 14, lineHeight: 2.2 }}>
                    <div><strong>District:</strong> {areaHealth.area?.assigned_district}</div>
                    <div><strong>Taluka:</strong> {areaHealth.area?.assigned_taluka}</div>
                    <div><strong>Village:</strong> {areaHealth.area?.assigned_village}</div>
                    <div><strong>Total Patients:</strong> {areaHealth.totalPatients}</div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h3>Age Distribution</h3></div>
                <div className="card-body">
                  {areaHealth.ageGroups?.map(g => (
                    <div key={g.group} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 50, fontSize: 13, fontWeight: 600 }}>{g.group}</span>
                      <div style={{ flex: 1, background: '#F5F5F5', borderRadius: 4, height: 20 }}>
                        <div style={{ width: `${areaHealth.totalPatients ? (g.count / areaHealth.totalPatients * 100) : 0}%`, height: '100%', background: '#1565C0', borderRadius: 4, minWidth: g.count > 0 ? 20 : 0 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{g.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h3>Priority Distribution</h3></div>
                <div className="card-body">
                  {areaHealth.priorityBreakdown?.map(p => (
                    <div key={p.level} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                      <span className={`badge ${p.level}`} style={{ textTransform: 'capitalize' }}>{p.level}</span>
                      <strong>{p.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h3>Gender Distribution</h3></div>
                <div className="card-body">
                  {areaHealth.genderBreakdown?.map(g => (
                    <div key={g.gender} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                      <span>{g.gender}</span>
                      <strong>{g.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
