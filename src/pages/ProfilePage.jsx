import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    api.getProfile().then(d => setProfile(d.worker)).catch(() => {});
    api.getSyncStatus().then(d => setSyncStatus(d)).catch(() => {});
  }, []);

  const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>My Profile</h2>

      {/* Avatar & Name */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 28, margin: '0 auto 16px' }}>
            {initials}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{profile?.name}</h2>
          <p style={{ color: '#616161', marginTop: 4 }}>{profile?.worker_id}</p>
          <span className="badge stable" style={{ marginTop: 8 }}>ASHA Worker</span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Contact Information</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icons.User style={{ width: 18, height: 18, color: '#1565C0' }} />
              <div><strong>Email:</strong> {profile?.email}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icons.Phone style={{ width: 18, height: 18, color: '#1565C0' }} />
              <div><strong>Phone:</strong> {profile?.phone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Area */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Assigned Area</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
            <div><strong>State:</strong> {profile?.assigned_state || '—'}</div>
            <div><strong>District:</strong> {profile?.assigned_district || '—'}</div>
            <div><strong>Taluka/Block:</strong> {profile?.assigned_taluka || '—'}</div>
            <div><strong>Village:</strong> {profile?.assigned_village || '—'}</div>
            <div><strong>PIN Code:</strong> {profile?.assigned_pin || '—'}</div>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      {syncStatus && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>Sync Status</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 14 }}>
              <div style={{ textAlign: 'center' }}><strong>{syncStatus.pending}</strong><br /><span style={{ color: '#616161', fontSize: 12 }}>Pending</span></div>
              <div style={{ textAlign: 'center' }}><strong>{syncStatus.synced}</strong><br /><span style={{ color: '#616161', fontSize: 12 }}>Synced</span></div>
              <div style={{ textAlign: 'center' }}><strong>{syncStatus.failed}</strong><br /><span style={{ color: '#616161', fontSize: 12 }}>Failed</span></div>
            </div>
            {syncStatus.lastSyncTime && (
              <div style={{ marginTop: 12, fontSize: 13, color: '#9E9E9E', textAlign: 'center' }}>
                Last sync: {new Date(syncStatus.lastSyncTime).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Security & Privacy</h3></div>
        <div className="card-body">
          <div style={{ fontSize: 13, lineHeight: 2, color: '#616161' }}>
            <div>✓ Session timeout: 8 hours</div>
            <div>✓ Data encrypted in transit</div>
            <div>✓ Role-based access control active</div>
            <div>✓ Audit logging enabled</div>
          </div>
        </div>
      </div>

      <button className="btn btn-danger btn-block" onClick={logout}>
        <Icons.LogOut /> Logout
      </button>
    </div>
  );
}
