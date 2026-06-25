import { useState } from 'react';
import API from '../utils/api';
import { Search, Train, CheckCircle, XCircle, Clock, Ticket, Users } from 'lucide-react';

const CLASS_LABELS = { general: 'General (GN)', sleeper: 'Sleeper (SL)', ac3: 'AC 3 Tier (3A)', ac2: 'AC 2 Tier (2A)', ac1: 'AC First Class (1A)' };

export default function PNRStatus() {
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await API.get(`/bookings/pnr/${pnr.trim()}`);
      setResult(data.bookingDetails);
    } catch (err) {
      setError(err.response?.data?.message || 'PNR not found');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    confirmed: { color: 'var(--irctc-green)', bg: 'var(--irctc-green-light)', icon: <CheckCircle size={18} />, label: 'CONFIRMED' },
    pending:   { color: 'var(--irctc-orange)', bg: '#fff3e0',                  icon: <Clock size={18} />,        label: 'PENDING'   },
    cancelled: { color: 'var(--irctc-red)',   bg: 'var(--irctc-red-light)',    icon: <XCircle size={18} />,      label: 'CANCELLED' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--irctc-gray-100)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))', padding: '48px 16px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Ticket size={48} color="rgba(255,255,255,0.8)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>PNR Status</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '32px' }}>
            Enter your 10-digit PNR number to check booking status
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '480px', margin: '0 auto' }}>
            <input
              value={pnr}
              onChange={e => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit PNR number"
              maxLength={10}
              required
              style={{
                flex: 1, padding: '14px 18px',
                borderRadius: '10px', border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                fontSize: '16px', letterSpacing: '2px', fontWeight: 600,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--irctc-orange)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
            />
            <button type="submit" disabled={loading} style={{
              padding: '14px 24px',
              background: 'var(--irctc-orange)', color: 'white',
              borderRadius: '10px', fontSize: '15px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(232,119,34,0.5)',
            }}>
              <Search size={18} /> {loading ? 'Checking...' : 'Check'}
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '700px', padding: '32px 16px' }}>
        {error && (
          <div style={{
            background: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center',
            boxShadow: 'var(--shadow-sm)', border: '1px solid var(--irctc-gray-200)',
          }}>
            <XCircle size={48} color="var(--irctc-gray-300)" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--irctc-gray-700)', marginBottom: '8px' }}>PNR Not Found</div>
            <div style={{ color: 'var(--irctc-gray-500)', fontSize: '14px' }}>{error}</div>
          </div>
        )}

        {result && (() => {
          const st = statusConfig[result.bookingStatus] || statusConfig.pending;
          return (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
              {/* Status header */}
              <div style={{ background: st.bg, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `3px solid ${st.color}` }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>PNR Number</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '3px', color: 'var(--irctc-gray-800)', fontFamily: 'monospace' }}>{result.pnrNumber}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: st.color, color: 'white', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '15px' }}>
                  {st.icon} {st.label}
                </div>
              </div>

              {/* Train info */}
              <div style={{ padding: '24px', borderBottom: '1px solid var(--irctc-gray-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--irctc-blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Train size={22} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{result.train?.trainName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--irctc-gray-500)' }}>#{result.train?.trainNumber} · {CLASS_LABELS[result.travelClass]}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--irctc-gray-50)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800 }}>{result.train?.departureTime}</div>
                    <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', fontWeight: 600 }}>{result.train?.from}</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--irctc-gray-400)' }}>
                    <div style={{ flex: 1, height: '2px', background: 'var(--irctc-gray-300)' }} />
                    <Train size={14} />
                    <div style={{ flex: 1, height: '2px', background: 'var(--irctc-gray-300)' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800 }}>{result.train?.arrivalTime}</div>
                    <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', fontWeight: 600 }}>{result.train?.to}</div>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div style={{ padding: '24px', borderBottom: '1px solid var(--irctc-gray-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontWeight: 700, fontSize: '14px', color: 'var(--irctc-gray-700)' }}>
                  <Users size={16} color="var(--irctc-blue)" /> Passenger Details ({result.totalSeats})
                </div>
                {result.passengerDetails?.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'var(--irctc-gray-50)', borderRadius: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ width: '30px', height: '30px', background: 'var(--irctc-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)' }}>{p.age} yrs · {p.gender} · {p.berthPreference}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Amount */}
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--irctc-gray-50)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', fontWeight: 600 }}>TOTAL AMOUNT</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--irctc-blue)' }}>₹{result.totalAmount?.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)' }}>Booked on</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{new Date(result.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          );
        })()}

        {!result && !error && !loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--irctc-gray-400)' }}>
            <Ticket size={56} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Enter a PNR number above to check status</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>PNR numbers are generated after successful booking</div>
          </div>
        )}
      </div>
    </div>
  );
}
