import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      setError(result.message);
    }
  };

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
        width: '100%',
        maxWidth: '440px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))', padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'var(--irctc-orange)', borderRadius: '14px', marginBottom: '16px' }}>
            <Train size={28} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Login to IRCTC</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Book train tickets instantly</p>
        </div>

        {/* Form */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{
              background: 'var(--irctc-red-light)',
              border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'var(--irctc-red)', fontSize: '14px',
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-700)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@gmail.com"
                required
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '2px solid var(--irctc-gray-200)',
                  borderRadius: '8px', fontSize: '15px',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-700)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px',
                    border: '2px solid var(--irctc-gray-200)',
                    borderRadius: '8px', fontSize: '15px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--irctc-gray-400)', cursor: 'pointer',
                }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? 'var(--irctc-gray-300)' : 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))',
              color: 'white', borderRadius: '8px',
              fontSize: '16px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(13,78,160,0.4)',
              transition: 'all 0.2s',
            }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--irctc-gray-500)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--irctc-blue)', fontWeight: 600 }}>
              Register here
            </Link>
          </div>

          {/* Demo credentials */}
          <div style={{
            marginTop: '20px',
            background: 'var(--irctc-gray-50)',
            border: '1px dashed var(--irctc-gray-300)',
            borderRadius: '8px',
            padding: '14px',
            fontSize: '13px',
            color: 'var(--irctc-gray-600)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>🔑 Demo — Register first, then login</div>
            <div>Use any Gmail address (e.g. demo@gmail.com)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
