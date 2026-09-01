import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const generateReminders = async () => {
    try {
      await api.generateFollowups();
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Notifications</h2>
          {unreadCount > 0 && <span style={{ fontSize: 13, color: '#1565C0' }}>{unreadCount} unread</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={generateReminders}>
            <Icons.Bell /> Generate Reminders
          </button>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark All Read</button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {notifications.length === 0 ? (
            <div className="empty-state">
              <Icons.Bell />
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.is_read ? '' : 'unread'}`} onClick={() => markRead(n.id)}>
                <div className={`notification-icon ${n.type}`}>
                  {n.type === 'follow_up' && <Icons.Calendar style={{ width: 16, height: 16 }} />}
                  {n.type === 'alert' && <Icons.AlertTriangle style={{ width: 16, height: 16 }} />}
                  {n.type === 'reminder' && <Icons.Bell style={{ width: 16, height: 16 }} />}
                  {n.type === 'info' && <Icons.CheckCircle style={{ width: 16, height: 16 }} />}
                </div>
                <div className="notification-content" style={{ flex: 1 }}>
                  <h4>{n.title}</h4>
                  <p>{n.message}</p>
                  <div className="time">{new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {n.patient_id && (
                  <Link to={`/patients/${n.patient_id}`} className="btn btn-sm btn-ghost" onClick={e => e.stopPropagation()}>
                    View Patient
                  </Link>
                )}
                {n.priority === 'high' && <span className="badge urgent">High</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
