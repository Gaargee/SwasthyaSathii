import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [village, setVillage] = useState(searchParams.get('village') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');

  useEffect(() => {
    loadPatients();
  }, [search, village, priority]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (village) params.village = village;
      if (priority) params.priority = priority;
      const data = await api.getPatients(params);
      setPatients(data.patients);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const villages = [...new Set(patients.map(p => p.village).filter(Boolean))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Patients ({patients.length})</h2>
        <Link to="/add-patient" className="btn btn-primary">
          <Icons.UserPlus /> Add Patient
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Icons.Search />
          <input
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ width: 160 }} value={village} onChange={e => setVillage(e.target.value)}>
          <option value="">All Villages</option>
          {villages.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className="form-input" style={{ width: 160 }} value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Patient List */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <Icons.Users />
          <h3>No patients found</h3>
          <p>{search || village || priority ? 'Try adjusting your filters' : 'Start by adding your first patient'}</p>
          <Link to="/add-patient" className="btn btn-primary" style={{ marginTop: 16 }}>Add First Patient</Link>
        </div>
      ) : (
        <div className="patient-list">
          {patients.map(p => (
            <Link key={p.id} to={`/patients/${p.id}`} className="patient-card">
              <div className={`patient-avatar ${p.gender?.toLowerCase()}`}>
                {getInitials(p.full_name)}
              </div>
              <div className="patient-info">
                <div className="name">{p.full_name}</div>
                <div className="meta">
                  <span>{p.age} yrs • {p.gender}</span>
                  <span>📍 {p.village || p.address}</span>
                  {p.mobile_number && <span>📞 {p.mobile_number}</span>}
                </div>
                {p.main_complaint && (
                  <div className="complaint">🩺 {p.main_complaint}</div>
                )}
                {p.follow_up_date && (
                  <div style={{ fontSize: 12, color: '#1565C0', marginTop: 4 }}>
                    📅 Follow-up: {new Date(p.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
              <div className="patient-badges">
                <span className={`badge ${p.priority_level}`}>{p.priority_level}</span>
                <span className={`badge ${p.health_status}`}>{p.health_status?.replace('_', ' ')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
