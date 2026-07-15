import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchApi } from '../api/searchApi';
import { socket } from '../utils/socket';
import { Train, Clock, ArrowRight, Users, AlertCircle, Filter, ChevronDown, MapPin, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StationInput from '../components/StationInput';
import toast from 'react-hot-toast';

const CLASS_LABELS = { general: 'General (GN)', sleeper: 'Sleeper (SL)', ac3: 'AC 3 Tier (3A)', ac2: 'AC 2 Tier (2A)', ac1: 'AC First Class (1A)' };
const CLASS_COLORS = { general: '#64748b', sleeper: '#10b981', ac3: '#2563eb', ac2: '#7c3aed', ac1: '#b45309' };

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
  const [routeModalTrain, setRouteModalTrain] = useState(null);

  const doSearch = async (f, t, d) => {
    if (!f?.trim() || !t?.trim()) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const { data } = await searchApi.searchTrains(f, t, d, selectedClass !== 'all' ? selectedClass : null, null);
      setTrains(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No trains found');
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onAvailabilityChanged = (payload) => {
      if (payload.journeyDate === date) {
        doSearch(from, to, date);
      }
    };
    
    socket.on('availabilityChanged', onAvailabilityChanged);
    
    const delayDebounceFn = setTimeout(() => {
      if (from?.trim() && to?.trim()) {
        doSearch(from, to, date);
      } else {
        setTrains([]);
        setSearched(false);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      socket.off('availabilityChanged', onAvailabilityChanged);
    };
  }, [from, to, date]);

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(from, to, date);
  };

  const handleBook = (train, cls) => {
    if (!isLoggedIn) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    navigate('/book', {
      state: {
        searchResult: train,
        selectedClass: cls,
        passengersFrom: from,
        passengersTo: to,
        journeyDate: date
      }
    });
  };

  const filteredTrains = trains.filter(t => {
    if (selectedClass === 'all') return true;
    return t.classes[selectedClass] && t.classes[selectedClass].totalSeats > 0;
  });

  const today = new Date().toISOString().split('T')[0];

  const formatDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime12hr = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const formatDateTime = (time, dayIndex, baseDateStr) => {
    if (!time || !baseDateStr) return formatTime12hr(time);
    const baseDate = new Date(baseDateStr);
    baseDate.setDate(baseDate.getDate() + ((dayIndex || 1) - 1));
    const options = { month: 'short', day: 'numeric' };
    return `${baseDate.toLocaleDateString('en-IN', options)}, ${formatTime12hr(time)}`;
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
          <div key={train.trainId} style={{
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
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--irctc-blue)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {train.trainName} <span style={{ fontSize: '14px', color: 'var(--irctc-gray-500)', fontWeight: 600 }}>({train.trainNumber})</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', fontWeight: 600 }}>
                      Status: <span style={{ color: 'var(--irctc-orange)' }}>
                        {train.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--irctc-gray-50)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--irctc-gray-200)' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--irctc-gray-900)' }}>{train.fromStation?.departureTime || 'N/A'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--irctc-gray-500)', fontWeight: 500, marginTop: '2px' }}>{train.fromStation?.name || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--irctc-gray-400)', marginBottom: '4px', fontWeight: 600 }}>N/A</div>
                    <div style={{ width: '100%', height: '2px', background: 'var(--irctc-gray-300)', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-4px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--irctc-gray-300)' }}></div>
                      <div style={{ position: 'absolute', right: '-4px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--irctc-gray-300)' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--irctc-gray-800)' }}>{train.toStation?.arrivalTime || 'N/A'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--irctc-gray-500)', fontWeight: 500, marginTop: '2px' }}>{train.toStation?.name || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setExpandedTrain(expandedTrain === train.trainId ? null : train.trainId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', border: '1px solid var(--irctc-gray-300)',
                      borderRadius: '6px', background: 'white', fontSize: '13px',
                      color: 'var(--irctc-gray-600)', cursor: 'pointer',
                    }}
                  >
                    <Filter size={14} /> View Classes <ChevronDown size={14} style={{ transform: expandedTrain === train.trainId ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick class chips */}
            <div style={{ padding: '12px 24px', background: 'var(--irctc-gray-50)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(train.classes || {}).map(([cls, data]) => {
                if (data.totalSeats === 0) return null;
                const msg = data.statusMsg || 'Available';
                const count = data.statusCount !== undefined ? data.statusCount : data.availableSeats;
                const statusStr = msg === 'Available' ? `${count} seats` : `${msg} ${count}`;
                return (
                  <div key={cls} style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: `1px solid ${CLASS_COLORS[cls]}`,
                    fontSize: '12px',
                    color: CLASS_COLORS[cls],
                    fontWeight: 600,
                    background: `${CLASS_COLORS[cls]}10`,
                  }}>
                    {CLASS_LABELS[cls]} · {statusStr} · ₹{data.price}
                  </div>
                );
              })}
            </div>

            {/* Expanded class booking */}
            {expandedTrain === train.trainId && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--irctc-gray-200)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {Object.entries(train.classes || {}).map(([cls, data]) => {
                    if (data.totalSeats === 0) return null;
                    const msg = data.statusMsg || 'Available';
                    const displayCount = data.statusCount !== undefined ? data.statusCount : data.availableSeats;
                    const statusStr = msg === 'Available' ? 'AVAILABLE' : 'WL';
                    const statusColor = msg === 'Available' ? 'var(--irctc-green)' : 'var(--irctc-red)';

                    return (
                      <div key={cls} style={{
                        border: `2px solid ${CLASS_COLORS[cls]}`,
                        borderRadius: '10px', padding: '16px',
                        background: 'white',
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
                            {statusStr}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '12px', color: 'var(--irctc-gray-500)' }}>
                          <Users size={12} />
                          {msg === 'Available' ? `${displayCount}/${data.totalSeats} seats available` : `${statusStr} ${displayCount}`}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--irctc-gray-400)', marginBottom: '12px', marginLeft: '18px' }}>
                          Coaches: {data.coachCount || 0}
                        </div>

                        <button
                          onClick={() => handleBook(train, cls)}
                          style={{
                            width: '100%', padding: '10px',
                            background: `linear-gradient(135deg, ${CLASS_COLORS[cls]}, ${CLASS_COLORS[cls]}cc)`,
                            color: 'white',
                            borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: `0 4px 10px ${CLASS_COLORS[cls]}40`,
                          }}
                        >
                          Book Now
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

      {/* Route Modal */}
      {routeModalTrain && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px',
            maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--irctc-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--irctc-blue)', color: 'white' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{routeModalTrain.name}</h3>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>Train Route Schedule</div>
              </div>
              <button onClick={() => setRouteModalTrain(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', bottom: '16px', left: '16px', width: '2px', background: 'var(--irctc-gray-300)' }} />
                
                {routeModalTrain.route.map((station, index) => (
                  <div key={index} style={{ display: 'flex', gap: '24px', marginBottom: index !== routeModalTrain.route.length - 1 ? '32px' : 0, position: 'relative' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%', background: 'white',
                      border: `3px solid ${index === 0 ? 'var(--irctc-green)' : index === routeModalTrain.route.length - 1 ? 'var(--irctc-red)' : 'var(--irctc-orange)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                    }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: index === 0 ? 'var(--irctc-green)' : index === routeModalTrain.route.length - 1 ? 'var(--irctc-red)' : 'var(--irctc-orange)' }} />
                    </div>
                    <div style={{ flex: 1, paddingBottom: '16px', borderBottom: index !== routeModalTrain.route.length - 1 ? '1px solid var(--irctc-gray-100)' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--irctc-gray-800)', marginBottom: '4px' }}>
                        {station.stationName}
                      </div>
                      <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--irctc-gray-500)' }}>
                        <div><span style={{ fontWeight: 600 }}>Arr:</span> {formatDateTime(station.arrivalTime, station.arrivalDay, date)}</div>
                        <div><span style={{ fontWeight: 600 }}>Dep:</span> {formatDateTime(station.departureTime, station.departureDay, date)}</div>
                        <div><span style={{ fontWeight: 600 }}>Dist:</span> {station.distanceFromSource} km</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
