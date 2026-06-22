import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Train, Clock, ArrowRight, Users, AlertCircle, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StationInput from '../components/StationInput';
import toast from 'react-hot-toast';

const CLASS_LABELS = { general: 'General (GN)', ac3: 'AC 3 Tier (3A)', ac2: 'AC 2 Tier (2A)', ac1: 'AC First Class (1A)' };
const CLASS_COLORS = { general: '#64748b', ac3: '#2563eb', ac2: '#7c3aed', ac1: '#b45309' };

export default function SearchTrains() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [from, setFrom] = useState(params.get('from') || '');
  const [to, setTo] = useState(params.get('to') || '');
  const [date, setDate] = useState(params.get('date') || new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(params.get('class') || 'all');
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [expandedTrain, setExpandedTrain] = useState(null);

  useEffect(() => {
    if (params.get('from') && params.get('to')) {
      doSearch(params.get('from'), params.get('to'));
    }
  }, []);

  const doSearch = async (f, t) => {
    if (!f?.trim() || !t?.trim()) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const { data } = await API.get(`/trains/search?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}`);
      const normalizedTrains = (data.trains || []).map(t => {
        if (!t.classes && t.seatAvailable !== undefined) {
          return {
            ...t,
            classes: {
              general: {
                totalSeats: t.seatAvailable,
                availableSeats: t.seatAvailable,
                price: t.price || 0
              }
            }
          };
        }
        return t;
      });
      setTrains(normalizedTrains);
    } catch (err) {
      setError(err.response?.data?.message || 'No trains found');
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(from, to);
  };

  const handleBook = (train, cls) => {
    if (!isLoggedIn) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    navigate(`/book/${train._id}?class=${cls}&from=${encodeURIComponent(train.from)}&to=${encodeURIComponent(train.to)}`);
  };

  const filteredTrains = trains.filter(t => {
    if (selectedClass === 'all') return true;
    return t.classes[selectedClass]?.availableSeats > 0;
  });

  const today = new Date().toISOString().split('T')[0];

  const formatDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--irctc-gray-100)' }}>
      {/* Search Bar */}
      <div style={{ background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))', padding: '24px 16px' }}>
        <div className="container">
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
              {[
                { label: 'From', value: from, setter: setFrom, ph: 'Source station' },
                { label: 'To', value: to, setter: setTo, ph: 'Destination station' },
              ].map(({ label, value, setter, ph }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>{label}</label>
                  <StationInput value={value} onChange={setter} placeholder={ph} required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '14px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--irctc-orange)'; e.target.style.background = 'rgba(255,255,255,0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.background = 'rgba(255,255,255,0.15)'; }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Date</label>
                <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '14px' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--irctc-orange)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Class</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '14px' }}
                >
                  <option value="all" style={{ color: 'black' }}>All Classes</option>
                  {Object.entries(CLASS_LABELS).map(([k, v]) => <option key={k} value={k} style={{ color: 'black' }}>{v}</option>)}
                </select>
              </div>
              <button type="submit" style={{
                padding: '11px 24px', background: 'var(--irctc-orange)', color: 'white',
                borderRadius: '8px', fontSize: '15px', fontWeight: 700,
                boxShadow: '0 4px 12px rgba(232,119,34,0.5)',
              }}>
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 16px' }}>
        {/* Results header */}
        {searched && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--irctc-gray-800)' }}>
                {from} → {to}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--irctc-gray-500)', marginTop: '2px' }}>
                {formatDate(date)} · {filteredTrains.length} train{filteredTrains.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--irctc-gray-500)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚂</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Searching trains...</div>
          </div>
        )}

        {error && searched && !loading && (
          <div style={{
            background: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center',
            border: '1px solid var(--irctc-gray-200)',
          }}>
            <AlertCircle size={48} color="var(--irctc-gray-300)" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--irctc-gray-700)', marginBottom: '8px' }}>No Trains Found</div>
            <div style={{ color: 'var(--irctc-gray-500)', fontSize: '14px' }}>Try different stations or date</div>
          </div>
        )}

        {/* Train cards */}
        {!loading && filteredTrains.map(train => (
          <div key={train._id} style={{
            background: 'white', borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)', border: '1px solid var(--irctc-gray-200)',
            marginBottom: '16px', overflow: 'hidden',
          }}>
            {/* Train header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--irctc-gray-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Train size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--irctc-gray-800)' }}>{train.trainName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--irctc-gray-500)', marginTop: '2px' }}>#{train.trainNumber}</div>
                  </div>
                </div>

                {/* Timing */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--irctc-gray-800)' }}>{train.departureTime}</div>
                    <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', fontWeight: 600 }}>{train.from}</div>
                  </div>
                  <div style={{ textAlign: 'center', color: 'var(--irctc-gray-400)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '40px', height: '2px', background: 'var(--irctc-gray-300)' }} />
                      <ArrowRight size={16} />
                      <div style={{ width: '40px', height: '2px', background: 'var(--irctc-gray-300)' }} />
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--irctc-gray-400)' }}>
                      <Clock size={11} /> Overnight
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--irctc-gray-800)' }}>{train.arrivalTime}</div>
                    <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', fontWeight: 600 }}>{train.to}</div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedTrain(expandedTrain === train._id ? null : train._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', border: '1px solid var(--irctc-gray-300)',
                    borderRadius: '6px', background: 'white', fontSize: '13px',
                    color: 'var(--irctc-gray-600)', cursor: 'pointer',
                  }}
                >
                  <Filter size={14} /> View Classes <ChevronDown size={14} style={{ transform: expandedTrain === train._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>
            </div>

            {/* Quick class chips */}
            <div style={{ padding: '12px 24px', background: 'var(--irctc-gray-50)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(train.classes || {}).map(([cls, data]) => {
                if (data.totalSeats === 0) return null;
                const avail = data.availableSeats;
                return (
                  <div key={cls} style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: `1px solid ${CLASS_COLORS[cls]}`,
                    fontSize: '12px',
                    color: CLASS_COLORS[cls],
                    fontWeight: 600,
                    background: avail === 0 ? 'var(--irctc-gray-100)' : `${CLASS_COLORS[cls]}10`,
                    opacity: avail === 0 ? 0.6 : 1,
                  }}>
                    {CLASS_LABELS[cls]} · {avail > 0 ? `${avail} seats · ₹${data.price}` : 'UNAVAILABLE'}
                  </div>
                );
              })}
            </div>

            {/* Expanded class booking */}
            {expandedTrain === train._id && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--irctc-gray-200)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {Object.entries(train.classes || {}).map(([cls, data]) => {
                    if (data.totalSeats === 0) return null;
                    const avail = data.availableSeats;
                    const pct = (avail / data.totalSeats) * 100;
                    const status = avail === 0 ? 'NOT AVAILABLE' : avail <= 10 ? 'ALMOST FULL' : 'AVAILABLE';
                    const statusColor = avail === 0 ? 'var(--irctc-red)' : avail <= 10 ? 'var(--irctc-orange)' : 'var(--irctc-green)';

                    return (
                      <div key={cls} style={{
                        border: `2px solid ${avail > 0 ? CLASS_COLORS[cls] : 'var(--irctc-gray-200)'}`,
                        borderRadius: '10px', padding: '16px',
                        opacity: avail === 0 ? 0.6 : 1,
                        background: avail === 0 ? 'var(--irctc-gray-50)' : 'white',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--irctc-gray-800)' }}>{CLASS_LABELS[cls]}</div>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: CLASS_COLORS[cls], marginTop: '2px' }}>₹{data.price}</div>
                          </div>
                          <span style={{
                            background: statusColor + '20',
                            color: statusColor,
                            fontSize: '10px', fontWeight: 700,
                            padding: '3px 8px', borderRadius: '4px',
                          }}>
                            {status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '12px', color: 'var(--irctc-gray-500)' }}>
                          <Users size={12} />
                          {avail}/{data.totalSeats} seats available
                        </div>

                        <div style={{ height: '4px', background: 'var(--irctc-gray-200)', borderRadius: '2px', marginBottom: '14px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: statusColor, borderRadius: '2px', transition: 'width 0.3s' }} />
                        </div>

                        <button
                          disabled={avail === 0}
                          onClick={() => handleBook(train, cls)}
                          style={{
                            width: '100%', padding: '10px',
                            background: avail === 0 ? 'var(--irctc-gray-200)' : `linear-gradient(135deg, ${CLASS_COLORS[cls]}, ${CLASS_COLORS[cls]}cc)`,
                            color: avail === 0 ? 'var(--irctc-gray-400)' : 'white',
                            borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                            cursor: avail === 0 ? 'not-allowed' : 'pointer',
                            boxShadow: avail === 0 ? 'none' : `0 4px 10px ${CLASS_COLORS[cls]}40`,
                          }}
                        >
                          {avail === 0 ? 'Not Available' : 'Book Now'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {!searched && (
          <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--irctc-gray-400)' }}>
            <Train size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Enter stations above to search for trains</div>
          </div>
        )}
      </div>
    </div>
  );
}
