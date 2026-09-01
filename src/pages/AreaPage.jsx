import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function AreaPage() {
  const [areaStats, setAreaStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAreaStats().then(d => setAreaStats(d)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const area = areaStats?.area || {};

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>📍 My Assigned Area</h2>

      {/* Area Location */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Area Information</h3>
          <Icons.MapPin style={{ width: 20, height: 20, color: '#E65100' }} />
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'State', value: area.assigned_state, icon: '🏛' },
              { label: 'District', value: area.assigned_district, icon: '🏘' },
              { label: 'Taluka/Block', value: area.assigned_taluka, icon: '🏗' },
              { label: 'Village', value: area.assigned_village, icon: '🏡' },
              { label: 'PIN Code', value: area.assigned_pin, icon: '📮' },
            ].map(item => (
              <div key={item.label} style={{ padding: 14, background: '#F5F7FA', borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: '#616161', marginBottom: 4 }}>{item.icon} {item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{item.value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><Icons.Users /></div>
          <div className="stat-info">
            <h4>{areaStats?.totalPatients || 0}</h4>
            <p>Registered Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icons.CheckCircle /></div>
          <div className="stat-info">
            <h4>{areaStats?.visitsThisMonth || 0}</h4>
            <p>Visits This Month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Icons.Calendar /></div>
          <div className="stat-info">
            <h4>{areaStats?.pendingFollowUps || 0}</h4>
            <p>Pending Follow-ups</p>
          </div>
        </div>
      </div>

      {/* Village breakdown */}
      <div className="card">
        <div className="card-header"><h3>Village-wise Patient Distribution</h3></div>
        <div className="card-body">
          {areaStats?.villageBreakdown?.length > 0 ? (
            areaStats.villageBreakdown.map(v => (
              <div key={v.village} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
                <Icons.MapPin style={{ width: 16, height: 16, color: '#E65100' }} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{v.village}</span>
                <div style={{ width: 120, background: '#F5F5F5', borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${(v.patient_count / (areaStats.totalPatients || 1)) * 100}%`, height: '100%', background: '#1565C0', borderRadius: 4 }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, width: 40, textAlign: 'right' }}>{v.patient_count}</span>
              </div>
            ))
          ) : (
            <div className="empty-state"><p>No village data available</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
