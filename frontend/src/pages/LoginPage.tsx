import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '16px', marginBottom: '16px' }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>O</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>OnIts</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>I'm on it! — Sign in to continue</p>
        </div>

        {/* Card */}
        <div style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '32px' }}>

          {/* Error */}
          {error && (
            <div style={{ background: '#2d1515', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#9ca3af' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', fontSize: '14px', color: 'white', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#9ca3af' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', fontSize: '14px', color: 'white', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#4c1d95' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.3px' }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', marginTop: '24px' }}>
          OnIts Task Management System
        </p>
      </div>
    </div>
  );
}
