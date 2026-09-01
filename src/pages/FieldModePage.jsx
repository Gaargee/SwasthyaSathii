import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function FieldModePage() {
  const { user, isOnline } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.getPatients().then(d => { setPatients(d.patients); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const current = patients[currentIdx];

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input not supported. Type symptoms instead.'); return; }
    const recognition = new SR();
    recognition.lang = 'hi-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = '';
    recognition.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
      }
      if (finalText) setSymptoms(prev => prev + (prev ? ' ' : '') + finalText);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };

  const stopVoice = () => recognitionRef.current?.stop();

  const saveVisit = async () => {
    if (!current) return;
    try {
      await api.updatePatient(current.id, {
        symptoms: symptoms || current.symptoms,
        temperature: temp ? parseFloat(temp) : current.temperature,
        bloodOxygen: spo2 ? parseInt(spo2) : current.blood_oxygen,
        bloodPressureSystolic: bpSys ? parseInt(bpSys) : current.blood_pressure_systolic,
        bloodPressureDiastolic: bpDia ? parseInt(bpDia) : current.blood_pressure_diastolic,
      });
      await api.addVisit({
        patientId: current.id,
        symptoms: symptoms || current.symptoms,
        temperature: temp ? parseFloat(temp) : null,
        bloodOxygen: spo2 ? parseInt(spo2) : null,
        bloodPressureSystolic: bpSys ? parseInt(bpSys) : null,
        bloodPressureDiastolic: bpDia ? parseInt(bpDia) : null,
        notes,
        visitType: 'field_visit',
        isFollowUp: false
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setSymptoms(''); setTemp(''); setSpo2(''); setBpSys(''); setBpDia(''); setNotes('');
        if (currentIdx < patients.length - 1) setCurrentIdx(currentIdx + 1);
      }, 2000);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };

  if (loading) return <div className="field-mode"><div className="page-content"><div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', margin: '100px auto' }} /></div></div>;

  if (!current) return (
    <div className="field-mode">
      <header className="top-bar">
        <h2>⚡ Field Mode</h2>
        <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={() => navigate('/')}>
          <Icons.ArrowLeft /> Exit Field Mode
        </button>
      </header>
      <div className="page-content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Icons.Users style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18 }}>No patients in your assigned area</h3>
          <p style={{ opacity: 0.7, marginTop: 8 }}>Add patients first to use Field Mode</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="field-mode">
      <header className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2>⚡ Field Mode</h2>
          <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
            <span className="status-dot" />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>{currentIdx + 1} of {patients.length}</span>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={() => navigate('/')}>
            Exit
          </button>
        </div>
      </header>

      <div className="page-content">
        {/* Patient Card */}
        <div className="field-patient-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>{current.full_name}</h3>
              <p>{current.age} yrs • {current.gender} • {current.village}</p>
              {current.main_complaint && <p style={{ marginTop: 4 }}>🩺 {current.main_complaint}</p>}
            </div>
            <span className={`badge ${current.priority_level}`} style={{ fontSize: 12 }}>{current.priority_level}</span>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="field-vitals-grid">
          <div className="field-vital">
            <label>🌡 Temp (°F)</label>
            <input type="number" step="0.1" placeholder="98.6" value={temp} onChange={e => setTemp(e.target.value)} />
          </div>
          <div className="field-vital">
            <label>💧 SpO₂ (%)</label>
            <input type="number" placeholder="98" value={spo2} onChange={e => setSpo2(e.target.value)} />
          </div>
          <div className="field-vital">
            <label>❤️ BP (Sys)</label>
            <input type="number" placeholder="120" value={bpSys} onChange={e => setBpSys(e.target.value)} />
          </div>
        </div>

        {/* Voice Input */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Tap to speak symptoms (हिंदी/मराठी)</p>
          <button
            className={`field-mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={() => isRecording ? stopVoice() : startVoice()}
          >
            {isRecording ? <Icons.MicOff /> : <Icons.Mic />}
          </button>
          {isRecording && <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>🔴 Listening... Tap to stop</p>}
        </div>

        {/* Symptoms text area */}
        <div style={{ marginBottom: 16 }}>
          <textarea
            className="form-input"
            placeholder="Symptoms will appear here, or type manually..."
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            rows={3}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 10 }}
          />
        </div>

        {/* Notes */}
        <input
          className="form-input"
          placeholder="Quick notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 10, marginBottom: 16 }}
        />

        {/* Save Button */}
        {saved ? (
          <div style={{ padding: 16, background: 'rgba(46,125,50,0.3)', borderRadius: 12, textAlign: 'center', marginBottom: 16 }}>
            <Icons.CheckCircle style={{ width: 32, height: 32, color: '#66BB6A', marginBottom: 4 }} />
            <div style={{ fontWeight: 700 }}>✓ Visit Saved Successfully!</div>
          </div>
        ) : (
          <button className="btn btn-accent btn-block btn-lg" onClick={saveVisit} style={{ marginBottom: 16, padding: 16 }}>
            ✓ Save Visit & Move to Next
          </button>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-block"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
            onClick={() => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); }}
            disabled={currentIdx === 0}
          >
            ← Previous Patient
          </button>
          <Link to={`/patients/${current.id}`} className="btn btn-block" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', textAlign: 'center' }}>
            View Full Profile →
          </Link>
        </div>

        {/* Quick patient list */}
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, opacity: 0.8 }}>All Patients</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {patients.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setCurrentIdx(i); setSymptoms(''); setTemp(''); setSpo2(''); setBpSys(''); setBpDia(''); setNotes(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: i === currentIdx ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: i === currentIdx ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: 'white', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font)', fontSize: 14
                }}
              >
                <div className={`patient-avatar ${p.gender?.toLowerCase()}`} style={{ width: 32, height: 32, fontSize: 12 }}>
                  {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{p.age} yrs • {p.village}</div>
                </div>
                <span className={`badge ${p.priority_level}`} style={{ fontSize: 10 }}>{p.priority_level}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
