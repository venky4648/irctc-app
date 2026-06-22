import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const passStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', color: 'var(--irctc-red)', width: '33%' };
    if (p.length < 10) return { label: 'Medium', color: 'var(--irctc-yellow)', width: '66%' };
    return { label: 'Strong', color: 'var(--irctc-green)', width: '100%' };
  };
  const strength = passStrength();

  return (
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      background: 'linear-gradient(135deg, var(--irctc-blue) 0%, #061e42 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: '480px',
        overflow: 'hidden',
      }}>
        <div style={{ background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))', padding: '28px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', background: 'var(--irctc-orange)', borderRadius: '14px', marginBottom: '12px' }}>
            <Train size={26} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Create Account</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Join IRCTC for seamless ticket booking</p>
        </div>

        <div style={{ padding: '28px' }}>
          {error && (
            <div style={{
              background: 'var(--irctc-red-light)', border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: '8px', padding: '12px 16px', marginBottom: '18px',
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'var(--irctc-red)', fontSize: '14px',
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-700)', marginBottom: '6px' }}>Full Name</label>
                <input
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name" required
                  style={{ width: '100%', padding: '11px 12px', border: '2px solid var(--irctc-gray-200)', borderRadius: '8px', fontSize: '14px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-700)', marginBottom: '6px' }}>Phone Number</label>
                <input
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit number" required maxLength={10}
                  style={{ width: '100%', padding: '11px 12px', border: '2px solid var(--irctc-gray-200)', borderRadius: '8px', fontSize: '14px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-700)', marginBottom: '6px' }}>Email Address (Gmail)</label>
              <input
                type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@gmail.com" required
                style={{ width: '100%', padding: '11px 12px', border: '2px solid var(--irctc-gray-200)', borderRadius: '8px', fontSize: '14px' }}
                onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-700)', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters" required
                  style={{ width: '100%', padding: '11px 44px 11px 12px', border: '2px solid var(--irctc-gray-200)', borderRadius: '8px', fontSize: '14px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--irctc-gray-400)', cursor: 'pointer',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', background: 'var(--irctc-gray-200)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: strength.color, fontWeight: 600 }}>{strength.label} password</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-700)', marginBottom: '6px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password" required
                  style={{ width: '100%', padding: '11px 44px 11px 12px', border: '2px solid var(--irctc-gray-200)', borderRadius: '8px', fontSize: '14px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle size={16} color="var(--irctc-green)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? 'var(--irctc-gray-300)' : 'linear-gradient(135deg, var(--irctc-orange), var(--irctc-orange-dark))',
              color: 'white', borderRadius: '8px',
              fontSize: '16px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(232,119,34,0.4)',
            }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: 'var(--irctc-gray-500)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--irctc-blue)', fontWeight: 600 }}>Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
