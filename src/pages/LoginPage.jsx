import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../utils/icons';

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: credentials, 2: OTP
  const [identifier, setIdentifier] = useState('priya@demo.com');
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(identifier, password);
      setWorkerId(data.worker_id);
      setDemoOtp(data.otp_demo);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(identifier, otp, workerId);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <Icons.Stethoscope />
          </div>
          <h1>SwasthyaSathi</h1>
          <p>स्वास्थ्य साथी — From Registers to Smarter Rural Healthcare</p>
        </div>

        <div className="login-steps">
          <div className={`login-step ${step === 1 ? 'active' : ''}`}>
            <span className="step-num">1</span>
            Login
          </div>
          <div className={`login-step ${step === 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            OTP Verify
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email or Mobile Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter email or mobile"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 16 }}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#9E9E9E', marginTop: 16 }}>
              Demo: Use priya@demo.com / password123
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtp}>
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              <Icons.Shield />
              <span>OTP has been sent to your registered device</span>
            </div>
            {demoOtp && (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                <Icons.Bell />
                <span>Demo OTP: <strong>{demoOtp}</strong></span>
              </div>
            )}
            <div className="form-group">
              <label>Enter 6-digit OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 16 }}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => { setStep(1); setError(''); setOtp(''); }} style={{ marginTop: 8 }}>
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
