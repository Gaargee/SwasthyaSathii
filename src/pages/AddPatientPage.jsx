import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Icons } from '../utils/icons';

export default function AddPatientPage() {
  const { user, isOnline } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: '', age: '', gender: '', mobileNumber: '', address: '',
    village: user?.assigned_village || '', district: user?.assigned_district || '',
    pinCode: user?.assigned_pin || '', assignedArea: user?.assigned_village || '',
    emergencyContact: '', emergencyContactName: '',
    mainComplaint: '', symptoms: '', symptomDuration: '',
    temperature: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
    bloodOxygen: '', existingConditions: '', currentMedications: '',
    allergies: '', previousMedicalHistory: '',
    priorityLevel: 'normal', healthStatus: 'stable',
    followUpDate: '', followUpNotes: ''
  });

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceField, setVoiceField] = useState('');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const startVoiceInput = useCallback((fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type the symptoms instead.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi by default, can switch to mr-IN for Marathi
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (transcript) {
        setField(fieldName, (form[fieldName] ? form[fieldName] + ' ' : '') + transcript);
        setTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      }
    };

    recognitionRef.current = recognition;
    setVoiceField(fieldName);
    setIsRecording(true);
    setTranscript('');
    recognition.start();
  }, [form, transcript]);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await api.createPatient(form);
      setShowConfirm(false);
      navigate(`/patients/${data.patient.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const VoiceInput = ({ fieldName, placeholder }) => (
    <div className="voice-input-area">
      <button
        type="button"
        className={`mic-btn ${isRecording && voiceField === fieldName ? 'recording' : ''}`}
        onClick={() => isRecording && voiceField === fieldName ? stopVoiceInput() : startVoiceInput(fieldName)}
        title={isRecording && voiceField === fieldName ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording && voiceField === fieldName ? <Icons.MicOff /> : <Icons.Mic />}
      </button>
      <div style={{ flex: 1 }}>
        <textarea
          className="form-input"
          placeholder={placeholder}
          value={form[fieldName]}
          onChange={(e) => setField(fieldName, e.target.value)}
          rows={3}
        />
        {isRecording && voiceField === fieldName && transcript && (
          <div style={{ marginTop: 6, padding: 8, background: '#E3F2FD', borderRadius: 6, fontSize: 13, color: '#1565C0' }}>
            <Icons.Mic style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {transcript}
          </div>
        )}
      </div>
    </div>
  );

  const sections = [
    { num: 1, label: 'Personal' },
    { num: 2, label: 'Health' },
    { num: 3, label: 'Vitals' },
    { num: 4, label: 'Review' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><Icons.ArrowLeft style={{ width: 18, height: 18 }} /></button>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Add New Patient</h2>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {sections.map(s => (
          <div key={s.num} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: step >= s.num ? '#E3F2FD' : '#F5F5F5', textAlign: 'center', cursor: 'pointer' }} onClick={() => s.num < step && setStep(s.num)}>
            <div style={{ fontSize: 11, fontWeight: 700, color: step >= s.num ? '#1565C0' : '#9E9E9E' }}>Step {s.num}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: step >= s.num ? '#0D47A1' : '#BDBDBD' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="card">
          <div className="card-header"><h3>Personal Information</h3></div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-input" placeholder="e.g. Ramesh Gaikwad" value={form.fullName} onChange={e => setField('fullName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input className="form-input" type="number" placeholder="e.g. 45" value={form.age} onChange={e => setField('age', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select className="form-input" value={form.gender} onChange={e => setField('gender', e.target.value)} required>
                  <option value="">Select gender</option>
                  <option value="Male">Male (पुरुष)</option>
                  <option value="Female">Female (महिला)</option>
                  <option value="Other">Other (अन्य)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input className="form-input" placeholder="e.g. 9876543210" value={form.mobileNumber} onChange={e => setField('mobileNumber', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="form-input" placeholder="House number, street, landmark" value={form.address} onChange={e => setField('address', e.target.value)} />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label>Village/Town</label>
                <input className="form-input" placeholder="Village" value={form.village} onChange={e => setField('village', e.target.value)} />
              </div>
              <div className="form-group">
                <label>District</label>
                <input className="form-input" placeholder="District" value={form.district} onChange={e => setField('district', e.target.value)} />
              </div>
              <div className="form-group">
                <label>PIN Code</label>
                <input className="form-input" placeholder="PIN" value={form.pinCode} onChange={e => setField('pinCode', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact</label>
                <input className="form-input" placeholder="Emergency phone number" value={form.emergencyContact} onChange={e => setField('emergencyContact', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input className="form-input" placeholder="Contact person name" value={form.emergencyContactName} onChange={e => setField('emergencyContactName', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-primary" onClick={() => { if (form.fullName && form.age && form.gender) setStep(2); else setError('Please fill required fields (Name, Age, Gender)'); }}>
                Next: Health Info →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Health Information */}
      {step === 2 && (
        <div className="card">
          <div className="card-header"><h3>Health Information</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label>Main Complaint</label>
              <input className="form-input" placeholder="e.g. Fever and cough for 3 days" value={form.mainComplaint} onChange={e => setField('mainComplaint', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Describe Symptoms (type or speak in Hindi/Marathi)</label>
              <VoiceInput fieldName="symptoms" placeholder="Type symptoms or use the microphone to speak... लक्षण बोलें या टाइप करें" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Duration of Symptoms</label>
                <select className="form-input" value={form.symptomDuration} onChange={e => setField('symptomDuration', e.target.value)}>
                  <option value="">Select duration</option>
                  <option value="Today">Today</option>
                  <option value="1-2 days">1-2 days</option>
                  <option value="3-5 days">3-5 days</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="More than 1 month">More than 1 month</option>
                  <option value="Ongoing">Ongoing / Chronic</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority Level</label>
                <select className="form-input" value={form.priorityLevel} onChange={e => setField('priorityLevel', e.target.value)}>
                  <option value="normal">Normal (सामान्य)</option>
                  <option value="urgent">Urgent (जरूरी)</option>
                  <option value="emergency">Emergency (आपातकाल)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Existing Conditions</label>
              <input className="form-input" placeholder="e.g. Diabetes, Hypertension" value={form.existingConditions} onChange={e => setField('existingConditions', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Current Medications</label>
                <input className="form-input" placeholder="Current medicines" value={form.currentMedications} onChange={e => setField('currentMedications', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Allergies</label>
                <input className="form-input" placeholder="Known allergies" value={form.allergies} onChange={e => setField('allergies', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Previous Medical History</label>
              <textarea className="form-input" placeholder="Past surgeries, hospitalizations, chronic conditions" value={form.previousMedicalHistory} onChange={e => setField('previousMedicalHistory', e.target.value)} rows={2} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Vitals →</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Vitals */}
      {step === 3 && (
        <div className="card">
          <div className="card-header"><h3>Vital Signs</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { key: 'temperature', label: 'Temperature (°F)', icon: <Icons.Thermometer />, placeholder: '98.6' },
                { key: 'bloodPressureSystolic', label: 'BP Systolic (mmHg)', icon: <Icons.Heart />, placeholder: '120' },
                { key: 'bloodPressureDiastolic', label: 'BP Diastolic (mmHg)', icon: <Icons.Heart />, placeholder: '80' },
                { key: 'bloodOxygen', label: 'SpO₂ (%)', icon: <Icons.Activity />, placeholder: '98' },
              ].map(v => (
                <div key={v.key} style={{ background: '#F5F7FA', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ color: '#1565C0', marginBottom: 8 }}>{React.cloneElement(v.icon, { style: { width: 28, height: 28 } })}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#616161', marginBottom: 8 }}>{v.label}</div>
                  <input
                    className="form-input"
                    type="number"
                    step="0.1"
                    placeholder={v.placeholder}
                    value={form[v.key]}
                    onChange={e => setField(v.key, e.target.value)}
                    style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '12px 8px' }}
                  />
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: 20 }}>
              <label>Follow-up Date</label>
              <input className="form-input" type="date" value={form.followUpDate} onChange={e => setField('followUpDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Follow-up Notes</label>
              <input className="form-input" placeholder="What to check during follow-up" value={form.followUpNotes} onChange={e => setField('followUpNotes', e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Review & Save →</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div>
          <div className="card">
            <div className="card-header"><h3>Review Patient Information</h3></div>
            <div className="card-body">
              <div className="form-section">
                <h3>Personal Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                  <div><strong>Name:</strong> {form.fullName}</div>
                  <div><strong>Age:</strong> {form.age} years</div>
                  <div><strong>Gender:</strong> {form.gender}</div>
                  <div><strong>Mobile:</strong> {form.mobileNumber || 'Not provided'}</div>
                  <div><strong>Village:</strong> {form.village}</div>
                  <div><strong>District:</strong> {form.district}</div>
                </div>
              </div>
              <div className="form-section">
                <h3>Health Information</h3>
                <div style={{ fontSize: 14 }}>
                  <div><strong>Main Complaint:</strong> {form.mainComplaint || 'Not provided'}</div>
                  <div style={{ marginTop: 8 }}><strong>Symptoms:</strong> {form.symptoms || 'Not provided'}</div>
                  <div style={{ marginTop: 8 }}><strong>Duration:</strong> {form.symptomDuration || 'Not provided'}</div>
                  <div style={{ marginTop: 8 }}><strong>Priority:</strong> <span className={`badge ${form.priorityLevel}`}>{form.priorityLevel}</span></div>
                  {form.existingConditions && <div style={{ marginTop: 8 }}><strong>Existing Conditions:</strong> {form.existingConditions}</div>}
                  {form.allergies && <div style={{ marginTop: 8 }}><strong>Allergies:</strong> {form.allergies}</div>}
                </div>
              </div>
              <div className="form-section">
                <h3>Vital Signs</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 14 }}>
                  <div style={{ textAlign: 'center' }}><strong>Temp:</strong><br />{form.temperature ? `${form.temperature}°F` : '—'}</div>
                  <div style={{ textAlign: 'center' }}><strong>BP:</strong><br />{form.bloodPressureSystolic ? `${form.bloodPressureSystolic}/${form.bloodPressureDiastolic}` : '—'}</div>
                  <div style={{ textAlign: 'center' }}><strong>SpO₂:</strong><br />{form.bloodOxygen ? `${form.bloodOxygen}%` : '—'}</div>
                  <div style={{ textAlign: 'center' }}><strong>Follow-up:</strong><br />{form.followUpDate || '—'}</div>
                </div>
              </div>

              {!isOnline && (
                <div className="alert alert-warning">
                  <Icons.WifiOff />
                  <span>You are offline. Record will be saved locally and synced when connection is restored.</span>
                </div>
              )}

              {error && <div className="alert alert-danger">{error}</div>}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : '✓ Save Patient Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
