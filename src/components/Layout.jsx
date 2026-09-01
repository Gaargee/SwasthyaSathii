import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../utils/icons';

const navItems = [
  { path: '/', icon: Icons.Home, label: 'Dashboard' },
  { path: '/add-patient', icon: Icons.UserPlus, label: 'Add Patient' },
  { path: '/patients', icon: Icons.Users, label: 'Patients' },
  { path: '/area', icon: Icons.Map, label: 'My Area' },
  { path: '/ai-assistant', icon: Icons.Bot, label: 'AI Assistant' },
  { path: '/sync', icon: Icons.RefreshCw, label: 'Pending Sync' },
  { path: '/reports', icon: Icons.FileText, label: 'Reports' },
  { path: '/notifications', icon: Icons.Bell, label: 'Notifications' },
  { path: '/profile', icon: Icons.User, label: 'Profile' },
];

const bottomNavItems = [
  { path: '/', icon: Icons.Home, label: 'Home' },
  { path: '/add-patient', icon: Icons.UserPlus, label: 'Add' },
  { path: '/patients', icon: Icons.Users, label: 'Patients' },
  { path: '/sync', icon: Icons.RefreshCw, label: 'Sync' },
  { path: '/notifications', icon: Icons.Bell, label: 'Alerts' },
];

export default function Layout() {
  const { user, isOnline, logout } = useAuth();
  const location = useLocation();
  const isFieldMode = location.pathname === '/field-mode';

  if (isFieldMode) return <Outlet />;

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  const pageTitle = navItems.find(n => n.path === location.pathname)?.label || 'SwasthyaSathi';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#4DB6AC"/>
              <path d="M18 6C11.4 6 6 11.4 6 18s5.4 12 12 12 12-5.4 12-12S24.6 6 18 6zm-1 17h-3v-3h3v3zm5-5h-3v-3h-2v-2h-2V9h3v3h2v2h2v5z" fill="white"/>
            </svg>
            <div>
              <h1>SwasthyaSathi</h1>
              <p>स्वास्थ्य साथी</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button className="nav-item" onClick={logout} style={{ marginTop: 'auto' }}>
            <Icons.LogOut />
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-worker-info">
            <div className="worker-avatar">{initials}</div>
            <div className="worker-details">
              <div className="name">{user?.name}</div>
              <div className="id">{user?.worker_id}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <h2>{pageTitle}</h2>
          <div className="top-bar-right">
            <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
              <span className="status-dot" />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {user && (
              <div className="sidebar-worker-info" style={{ display: 'none' }} id="topbar-user">
                <div className="worker-avatar" style={{ background: '#00897B' }}>{initials}</div>
              </div>
            )}
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>

      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {bottomNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
