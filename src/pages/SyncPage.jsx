import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function SyncPage() {
  const { isOnline } = useAuth();
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => { loadSyncData(); }, []);

  const loadSyncData = async () => {
    try {
      const [statusData, pendingData] = await Promise.all([api.getSyncStatus(), api.getPendingSync()]);
      setStatus(statusData);
      setPending(pendingData.records);
    } catch (err) {
      console.error('Failed to load sync data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await api.pushSync();
      setSyncResult(result);
      await loadSyncData();
    } catch (err) {
      setSyncResult({ synced: 0, failed: 0, message: err.message });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Data Synchronization</h2>

      {/* Status cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon orange"><Icons.Clock /></div>
          <div className="stat-info">
            <h4>{status?.pending || 0}</h4>
            <p>Pending Sync</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icons.CheckCircle /></div>
          <div className="stat-info">
            <h4>{status?.synced || 0}</h4>
            <p>Synced</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Icons.AlertCircle /></div>
          <div className="stat-info">
            <h4>{status?.failed || 0}</h4>
            <p>Failed</p>
          </div>
        </div>
      </div>

      {/* Sync banner */}
      <div className={`sync-banner ${isOnline ? 'pending' : 'pending'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isOnline ? <Icons.Wifi /> : <Icons.WifiOff />}
          <span>
            {!isOnline
              ? 'You are offline. Data is stored locally.'
              : status?.pending > 0
                ? `${status.pending} records waiting to sync`
                : 'All records are up to date'
            }
          </span>
        </div>
        {isOnline && (
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing || status?.pending === 0}>
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {/* Sync result */}
      {syncResult && (
        <div className={`alert ${syncResult.failed > 0 ? 'alert-warning' : 'alert-success'}`}>
          {syncResult.failed > 0 ? <Icons.AlertTriangle /> : <Icons.CheckCircle />}
          <span>{syncResult.message}</span>
        </div>
      )}

      {/* Last sync time */}
      {status?.lastSyncTime && (
        <p style={{ fontSize: 13, color: '#9E9E9E', marginBottom: 16 }}>
          Last successful sync: {new Date(status.lastSyncTime).toLocaleString('en-IN')}
        </p>
      )}

      {/* Pending records */}
      <div className="card">
        <div className="card-header">
          <h3>Pending Records ({pending.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {pending.length === 0 ? (
            <div className="empty-state">
              <Icons.CheckCircle />
              <h3>All synced!</h3>
              <p>No pending records to synchronize.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Action</th>
                  <th>Record ID</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(r => (
                  <tr key={r.id}>
                    <td><span className="badge normal">{r.record_type}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{r.action}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.record_id?.substring(0, 8)}...</td>
                    <td>{new Date(r.created_at).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${r.status === 'synced' ? 'stable' : r.status === 'failed' ? 'urgent' : 'normal'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
