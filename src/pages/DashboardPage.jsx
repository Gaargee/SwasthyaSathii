import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function DashboardPage() {
  const { user, isOnline } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

  return (
    <div>
      {/* Welcome header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Namaste, {user?.name?.split(' ')[0]} 🙏</h2>
            <p style={{ fontSize: 13, color: '#616161' }}>
              {user?.assigned_village}, {user?.assigned_district} • {user?.worker_id}
            </p>
          </div>
        </div>
      </div>

      {/* Sync alert */}
      {stats?.pendingSync > 0 && (
        <div className={`sync-banner ${isOnline ? 'pending' : 'pending'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isOnline ? <Icons.RefreshCw size={18} /> : <Icons.WifiOff size={18} />}
            <span>
              {isOnline
                ? `${stats.pendingSync} record${stats.pendingSync > 1 ? 's' : ''} ready to sync`
                : `${stats.pendingSync} record${stats.pendingSync > 1 ? 's' : ''} saved offline — waiting for connection`
              }
            </span>
          </div>
          {isOnline && stats.pendingSync > 0 && (
            <Link to="/sync" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.3)', color: 'inherit', fontWeight: 700 }}>
              Sync Now →
            </Link>
          )}
        </div>
      )}

      {/* Quick action */}
      <Link to="/add-patient" className="btn btn-primary btn-lg btn-block" style={{ marginBottom: 24, padding: '16px 24px', fontSize: 16 }}>
        <Icons.UserPlus /> Add New Patient
      </Link>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Icons.Users /></div>
          <div className="stat-info">
            <h4>{stats?.totalPatients || 0}</h4>
            <p>Total Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icons.CheckCircle /></div>
          <div className="stat-info">
            <h4>{stats?.visitedToday || 0}</h4>
            <p>Visited Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Icons.Calendar /></div>
          <div className="stat-info">
            <h4>{stats?.followUpsDue || 0}</h4>
            <p>Follow-ups Due</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Icons.AlertTriangle /></div>
          <div className="stat-info">
            <h4>{stats?.highPriority || 0}</h4>
            <p>High Priority</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><Icons.RefreshCw /></div>
          <div className="stat-info">
            <h4>{stats?.pendingSync || 0}</h4>
            <p>Pending Sync</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Urgent patients */}
        <div className="card">
          <div className="card-header">
            <h3>🚨 High Priority Cases</h3>
            <Link to="/patients?priority=urgent" className="btn btn-sm btn-ghost">View All</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats?.urgentPatients?.length > 0 ? stats.urgentPatients.map(p => (
              <Link key={p.id} to={`/patients/${p.id}`} className="notification-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="priority-dot" style={{ marginTop: 6, background: p.priority_level === 'emergency' ? '#D32F2F' : '#F57F17' }} />
                <div className="notification-content" style={{ flex: 1 }}>
                  <h4>{p.full_name}, {p.age} • {p.village}</h4>
                  <p style={{ fontSize: 12 }}>{p.symptoms?.substring(0, 60)}{p.symptoms?.length > 60 ? '...' : ''}</p>
                </div>
                <span className={`badge ${p.priority_level}`}>{p.priority_level}</span>
              </Link>
            )) : (
              <div className="empty-state" style={{ padding: 24 }}>
                <Icons.CheckCircle style={{ width: 32, height: 32, color: '#66BB6A' }} />
                <p>No urgent cases</p>
              </div>
            )}
          </div>
        </div>

        {/* Follow-ups due */}
        <div className="card">
          <div className="card-header">
            <h3>📅 Follow-ups Due</h3>
            <Link to="/patients" className="btn btn-sm btn-ghost">View All</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats?.followUpsSoon?.length > 0 ? stats.followUpsSoon.map(p => (
              <Link key={p.id} to={`/patients/${p.id}`} className="notification-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="notification-icon follow_up">
                  <Icons.Calendar style={{ width: 16, height: 16 }} />
                </div>
                <div className="notification-content" style={{ flex: 1 }}>
                  <h4>{p.full_name}, {p.age}</h4>
                  <p>Due: {new Date(p.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <span className={`badge ${p.priority_level}`}>{p.priority_level}</span>
              </Link>
            )) : (
              <div className="empty-state" style={{ padding: 24 }}>
                <Icons.Calendar style={{ width: 32, height: 32, color: '#BDBDBD' }} />
                <p>No follow-ups scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { to: '/field-mode', icon: <Icons.Zap />, label: 'Field Mode', color: '#00897B' },
          { to: '/ai-assistant', icon: <Icons.Bot />, label: 'AI Assistant', color: '#1565C0' },
          { to: '/reports', icon: <Icons.BarChart />, label: 'Reports', color: '#6A1B9A' },
          { to: '/area', icon: <Icons.MapPin />, label: 'My Area', color: '#E65100' },
        ].map(q => (
          <Link key={q.to} to={q.to} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #EEEEEE', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: q.color + '15', color: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                {React.cloneElement(q.icon, { style: { width: 20, height: 20 } })}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{q.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Connection info */}
      <div className="card" style={{ marginTop: 8 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#616161' }}>
            {isOnline ? <Icons.Wifi style={{ width: 16, height: 16, color: '#2E7D32' }} /> : <Icons.WifiOff style={{ width: 16, height: 16, color: '#D32F2F' }} />}
            {isOnline ? 'Connected — data will sync automatically' : 'Working offline — data saved locally'}
          </div>
          <span style={{ fontSize: 12, color: '#9E9E9E' }}>
            Last sync: {stats?.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleString('en-IN') : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
}
