import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function AIAssistantPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [assessing, setAssessing] = useState(false);

  useEffect(() => {
    api.getPatients().then(d => { setPatients(d.patients); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const runAssessment = async () => {
    if (!selectedId) return;
    setAssessing(true);
    setAssessment(null);
    try {
      const data = await api.assessPatient(selectedId);
      setAssessment(data.assessment);
    } catch (err) {
      console.error(err);
    } finally {
      setAssessing(false);
    }
  };

  const selected = patients.find(p => p.id === selectedId);
  const urgencyLabels = { routine: 'Routine', needs_consultation: 'Needs Consultation', urgent: 'Urgent', emergency: 'Emergency' };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>🤖 AI Health Assistant</h2>
        <p style={{ fontSize: 14, color: '#616161', marginTop: 4 }}>
          Select a patient to get AI-powered clinical decision support
        </p>
      </div>

      {/* Disclaimer */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <Icons.Shield />
        <span>AI guidance is for decision support only and does not replace professional medical judgment.</span>
      </div>

      {/* Patient selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Select Patient</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Choose a patient to assess</label>
            <select className="form-input" value={selectedId} onChange={e => { setSelectedId(e.target.value); setAssessment(null); }}>
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.age} yrs, {p.village}) — {p.main_complaint || 'No complaint recorded'}</option>
              ))}
            </select>
          </div>
          {selected && (
            <div style={{ padding: 14, background: '#F5F7FA', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              <div><strong>Symptoms:</strong> {selected.symptoms || 'Not recorded'}</div>
              <div style={{ marginTop: 4 }}><strong>Vitals:</strong>
                {selected.temperature ? ` Temp: ${selected.temperature}°F` : ''}
                {selected.blood_pressure_systolic ? ` | BP: ${selected.blood_pressure_systolic}/${selected.blood_pressure_diastolic}` : ''}
                {selected.blood_oxygen ? ` | SpO₂: ${selected.blood_oxygen}%` : ''}
                {!selected.temperature && !selected.blood_pressure_systolic && !selected.blood_oxygen ? ' Not recorded' : ''}
              </div>
              <div style={{ marginTop: 4 }}>
                <Link to={`/patients/${selected.id}`} style={{ color: '#1565C0', fontSize: 13 }}>View full profile →</Link>
              </div>
            </div>
          )}
          <button className="btn btn-primary btn-lg" onClick={runAssessment} disabled={!selectedId || assessing}>
            <Icons.Bot /> {assessing ? 'Analyzing Patient Data...' : 'Run AI Assessment'}
          </button>
        </div>
      </div>

      {/* Assessment Results */}
      {assessment && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <Icons.Bot />
            <h3>Assessment Results — {selected?.full_name}</h3>
          </div>
          <div className="ai-panel-body">
            <div className="ai-section">
              <h4>Urgency Level</h4>
              <span className={`urgency-badge ${assessment.urgencyLevel}`}>
                {assessment.urgencyLevel === 'emergency' && '🚨 '}
                {assessment.urgencyLevel === 'urgent' && '⚠️ '}
                {urgencyLabels[assessment.urgencyLevel] || assessment.urgencyLevel}
              </span>
            </div>

            {assessment.urgencyLevel === 'emergency' && (
              <div className="emergency-banner">
                <h3>🚨 URGENT MEDICAL ATTENTION REQUIRED</h3>
                <p>Arrange immediate referral to nearest health facility. Do not delay.</p>
                <button className="btn btn-danger" style={{ marginTop: 12 }}><Icons.Phone /> Emergency Referral</button>
              </div>
            )}

            {assessment.redFlags?.length > 0 && (
              <div className="ai-section">
                <h4>Red-Flag Symptoms</h4>
                {assessment.redFlags.map((flag, i) => <div key={i} className="red-flag-item">{flag}</div>)}
              </div>
            )}

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

            <div className="ai-section">
              <h4>Recommended Next Step</h4>
              <div style={{ padding: 12, background: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                {assessment.recommendedAction}
              </div>
            </div>

            {assessment.missingInformation?.length > 0 && (
              <div className="ai-section">
                <h4>Missing Information</h4>
                {assessment.missingInformation.map((info, i) => (
                  <div key={i} className="missing-info-item"><Icons.AlertCircle style={{ width: 14, height: 14 }} />{info}</div>
                ))}
              </div>
            )}

            <div className="disclaimer">⚠️ {assessment.disclaimer}</div>
          </div>
        </div>
      )}
    </div>
  );
}
