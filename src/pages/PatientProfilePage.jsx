import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [tab, setTab] = useState('overview');

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { loadPatient(); }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadPatient = async () => {
    try {
      const data = await api.getPatient(id);
      setPatient(data.patient);
      setVisits(data.visits || []);
      if (data.assessments?.length > 0) {
        setAssessment(data.assessments[0]);
      }
    } catch (err) {
      console.error('Failed to load patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAssessment = async () => {
    setAssessing(true);
    try {
      const data = await api.assessPatient(id);
      setAssessment(data.assessment);
    } catch (err) {
      console.error('Assessment failed:', err);
    } finally {
      setAssessing(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const data = await api.chatWithAI(id, q);
      setChatMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not process your question. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!patient) return <div className="empty-state"><h3>Patient not found</h3></div>;

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const urgencyLabels = { routine: 'Routine', needs_consultation: 'Needs Consultation', urgent: 'Urgent', emergency: 'Emergency' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><Icons.ArrowLeft style={{ width: 18, height: 18 }} /></button>
      </div>

      {/* Profile Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div className="profile-header">
            <div className={`profile-avatar ${patient.gender?.toLowerCase()}`} style={{ background: patient.gender === 'Female' ? '#AD1457' : '#1565C0' }}>
              {getInitials(patient.full_name)}
            </div>
            <div className="profile-info" style={{ flex: 1 }}>
              <h2>{patient.full_name}</h2>
              <p>Age: {patient.age} • {patient.gender} • {patient.village}, {patient.district}</p>
              <p style={{ marginTop: 4 }}>
                <span className={`badge ${patient.priority_level}`} style={{ marginRight: 8 }}>{patient.priority_level}</span>
                <span className={`badge ${patient.health_status}`}>{patient.health_status?.replace('_', ' ')}</span>
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, color: '#616161' }}>
              {patient.mobile_number && <div>📞 {patient.mobile_number}</div>}
              {patient.emergency_contact && <div>🚨 Emergency: {patient.emergency_contact}</div>}
              <div style={{ marginTop: 8, fontSize: 12, color: '#9E9E9E' }}>Registered: {new Date(patient.created_at).toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'visits', 'ai-assessment', 'chat'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? 'Overview' : t === 'visits' ? 'Visit History' : t === 'ai-assessment' ? '🤖 AI Assessment' : '💬 Ask AI'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Health Info */}
          <div className="card">
            <div className="card-header"><h3>Health Information</h3></div>
            <div className="card-body">
              <div style={{ fontSize: 14, lineHeight: 2 }}>
                <div><strong>Main Complaint:</strong> {patient.main_complaint || '—'}</div>
                <div><strong>Symptoms:</strong> {patient.symptoms || '—'}</div>
                <div><strong>Duration:</strong> {patient.symptom_duration || '—'}</div>
                <div><strong>Existing Conditions:</strong> {patient.existing_conditions || 'None recorded'}</div>
                <div><strong>Medications:</strong> {patient.current_medications || 'None'}</div>
                <div><strong>Allergies:</strong> {patient.allergies || 'None recorded'}</div>
                <div><strong>History:</strong> {patient.previous_medical_history || 'None recorded'}</div>
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="card">
            <div className="card-header"><h3>Current Vitals</h3></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Temperature', value: patient.temperature ? `${patient.temperature}°F` : '—', color: patient.temperature >= 100 ? '#D32F2F' : '#2E7D32' },
                  { label: 'Blood Pressure', value: patient.blood_pressure_systolic ? `${patient.blood_pressure_systolic}/${patient.blood_pressure_diastolic}` : '—', color: patient.blood_pressure_systolic >= 140 ? '#D32F2F' : '#2E7D32' },
                  { label: 'SpO₂', value: patient.blood_oxygen ? `${patient.blood_oxygen}%` : '—', color: patient.blood_oxygen < 94 ? '#D32F2F' : '#2E7D32' },
                  { label: 'Follow-up', value: patient.follow_up_date ? new Date(patient.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'None', color: '#1565C0' },
                ].map(v => (
                  <div key={v.label} style={{ background: '#F5F7FA', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#616161', marginBottom: 4 }}>{v.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: v.color }}>{v.value}</div>
                  </div>
                ))}
              </div>
              {patient.follow_up_notes && (
                <div className="alert alert-info" style={{ marginTop: 16 }}>
                  <Icons.Calendar />
                  <span>{patient.follow_up_notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Info */}
          <div className="card">
            <div className="card-header"><h3>Contact Information</h3></div>
            <div className="card-body" style={{ fontSize: 14, lineHeight: 2 }}>
              <div><strong>Address:</strong> {patient.address || '—'}</div>
              <div><strong>Village:</strong> {patient.village}</div>
              <div><strong>District:</strong> {patient.district}</div>
              <div><strong>PIN:</strong> {patient.pin_code || '—'}</div>
              <div><strong>Mobile:</strong> {patient.mobile_number || '—'}</div>
              <div><strong>Emergency Contact:</strong> {patient.emergency_contact_name || '—'} ({patient.emergency_contact || '—'})</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><h3>Quick Actions</h3></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button className="btn btn-primary" onClick={runAssessment} disabled={assessing}>
                  <Icons.Bot /> {assessing ? 'Assessing...' : 'Run AI Assessment'}
                </button>
                <button className="btn btn-accent" onClick={() => setTab('chat')}>
                  <Icons.Bot /> Ask AI Assistant
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/add-patient')}>
                  <Icons.UserPlus /> Add New Visit
                </button>
                <button className="btn btn-outline" onClick={() => setTab('visits')}>
                  <Icons.FileText /> View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visits Tab */}
      {tab === 'visits' && (
        <div className="card">
          <div className="card-header"><h3>Visit History ({visits.length} visits)</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {visits.length === 0 ? (
              <div className="empty-state"><p>No visit history recorded yet</p></div>
            ) : (
              visits.map((v, i) => (
                <div key={v.id} style={{ padding: 16, borderBottom: i < visits.length - 1 ? '1px solid #EEEEEE' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className={`badge ${v.visit_type === 'referral' ? 'urgent' : 'normal'}`} style={{ marginRight: 8 }}>{v.visit_type}</span>
                      <strong style={{ fontSize: 14 }}>{new Date(v.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </div>
                    {v.urgency_level && <span className={`urgency-badge ${v.urgency_level}`}>{urgencyLabels[v.urgency_level] || v.urgency_level}</span>}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#616161' }}>
                    {v.symptoms && <div><strong>Symptoms:</strong> {v.symptoms}</div>}
                    {v.notes && <div><strong>Notes:</strong> {v.notes}</div>}
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      {v.temperature && <span>🌡 {v.temperature}°F</span>}
                      {v.blood_pressure_systolic && <span>❤️ {v.blood_pressure_systolic}/{v.blood_pressure_diastolic}</span>}
                      {v.blood_oxygen && <span>💧 {v.blood_oxygen}%</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AI Assessment Tab */}
      {tab === 'ai-assessment' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>AI Clinical Decision Support</h3>
            <button className="btn btn-primary" onClick={runAssessment} disabled={assessing}>
              <Icons.Bot /> {assessing ? 'Analyzing...' : 'Re-run Assessment'}
            </button>
          </div>

          {!assessment ? (
            <div className="ai-panel">
              <div className="ai-panel-body" style={{ textAlign: 'center', padding: 40 }}>
                <Icons.Bot style={{ width: 48, height: 48, color: '#1565C0', marginBottom: 12 }} />
                <h3 style={{ marginBottom: 8 }}>No assessment yet</h3>
                <p style={{ color: '#616161', marginBottom: 16 }}>Click the button above to generate an AI health assessment for this patient.</p>
              </div>
            </div>
          ) : (
            <div className="ai-panel">
              <div className="ai-panel-header">
                <Icons.Bot />
                <h3>AI Health Assessment for {patient.full_name}</h3>
              </div>
              <div className="ai-panel-body">
                {/* Urgency Level */}
                <div className="ai-section">
                  <h4>Urgency Level</h4>
                  <span className={`urgency-badge ${assessment.urgencyLevel}`}>
                    {assessment.urgencyLevel === 'emergency' && '🚨 '}
                    {assessment.urgencyLevel === 'urgent' && '⚠️ '}
                    {urgencyLabels[assessment.urgencyLevel] || assessment.urgencyLevel}
                  </span>
                </div>

                {/* Emergency Banner */}
                {assessment.urgencyLevel === 'emergency' && (
                  <div className="emergency-banner" style={{ marginTop: 16 }}>
                    <h3>🚨 URGENT MEDICAL ATTENTION REQUIRED</h3>
                    <p>This patient shows emergency-level symptoms. Please arrange immediate medical referral.</p>
                    <button className="btn btn-danger" style={{ marginTop: 12 }}>
                      <Icons.Phone /> Call Nearest Health Centre
                    </button>
                  </div>
                )}

                {/* Red Flags */}
                {assessment.redFlags?.length > 0 && (
                  <div className="ai-section">
                    <h4>🚨 Red-Flag Symptoms</h4>
                    {assessment.redFlags.map((flag, i) => (
                      <div key={i} className="red-flag-item">{flag}</div>
                    ))}
                  </div>
                )}

                {/* Possible Conditions */}
                <div className="ai-section">
                  <h4>Possible Conditions</h4>
                  {assessment.possibleConditions?.map((c, i) => (
                    <div key={i} className="condition-item">
                      <div>
                        <div className="condition-name">{c.condition}</div>
                        <div className="condition-reason">{c.reason}</div>
                      </div>
                      <span className={`probability ${c.probability}`}>{c.probability}</span>
                    </div>
                  ))}
                </div>

                {/* Recommended Action */}
                <div className="ai-section">
                  <h4>Recommended Next Step</h4>
                  <div style={{ padding: 12, background: 'white', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                    {assessment.recommendedAction}
                  </div>
                </div>

                {/* Missing Information */}
                {assessment.missingInformation?.length > 0 && (
                  <div className="ai-section">
                    <h4>Missing Information</h4>
                    {assessment.missingInformation.map((info, i) => (
                      <div key={i} className="missing-info-item">
                        <Icons.AlertCircle style={{ width: 14, height: 14 }} />
                        {info}
                      </div>
                    ))}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="disclaimer">
                  ⚠️ {assessment.disclaimer}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {tab === 'chat' && (
        <div className="card">
          <div className="card-header">
            <h3>💬 AI Health Assistant — {patient.full_name}</h3>
          </div>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: '#9E9E9E', fontSize: 13 }}>
                  Ask questions about this patient's health information.<br />
                  Try: "What are the vital signs?" or "Is this urgent?"
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {chatLoading && (
                <div className="chat-message ai">
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-area">
              <input
                placeholder="Ask about this patient..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
              />
              <button className="btn btn-primary btn-sm" onClick={sendChat} disabled={!chatInput.trim() || chatLoading}>
                <Icons.Send style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
