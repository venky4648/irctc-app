import { useState, useEffect } from 'react';
import { Train, Search, Clock, MapPin, Navigation, Calendar, Activity } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function TrainSchedule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [loading, setLoading] = useState(true);

  const { state } = useLocation();

  useEffect(() => {
    if (state?.searchResult) {
      setSelectedTrain(state.searchResult);
    }
    setLoading(false);
  }, [state]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setFilteredTrains([]);
      return;
    }

    const q = query.toLowerCase();
    const results = trains.filter(t => 
      (t.train_number && t.train_number.toLowerCase().includes(q)) || 
      (t.name && t.name.toLowerCase().includes(q))
    );
    setFilteredTrains(results);
  };

  const handleSelectTrain = (train) => {
    setSelectedTrain(train);
    setSearchQuery('');
    setFilteredTrains([]);
  };

  const formatTime12hr = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--irctc-gray-100)', padding: '32px 16px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'var(--irctc-blue)', borderRadius: '16px', marginBottom: '16px', color: 'white' }}>
            <Activity size={28} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--irctc-gray-800)', marginBottom: '8px' }}>
            Live Train Schedule
          </h1>
          <p style={{ color: 'var(--irctc-gray-500)', fontSize: '15px' }}>
            Check real-time routes, timetables, and running days for any train.
          </p>
        </div>

        {/* Search Box */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--irctc-gray-100)', borderRadius: '12px', padding: '12px 16px', border: '1px solid var(--irctc-gray-200)' }}>
            <Search size={20} color="var(--irctc-gray-400)" />
            <input 
              type="text"
              placeholder="Search by Train Number or Name (e.g., 12645, Andhra Express)"
              value={searchQuery}
              onChange={handleSearch}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '15px', outline: 'none' }}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {filteredTrains.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: '24px', right: '24px', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 10, marginTop: '8px', maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--irctc-gray-200)' }}>
              {filteredTrains.map((train, idx) => (
                <div 
                  key={train.id} 
                  onClick={() => handleSelectTrain(train)}
                  style={{ 
                    padding: '16px', 
                    borderBottom: idx < filteredTrains.length - 1 ? '1px solid var(--irctc-gray-100)' : 'none',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--irctc-gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ background: 'var(--irctc-orange-light)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                    {train.train_number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--irctc-gray-800)', fontSize: '15px' }}>{train.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--irctc-gray-500)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Status: {train.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Train Details */}
        {selectedTrain && (
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            {/* Top Card */}
            <div style={{ background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))', padding: '32px 24px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'inline-block', background: 'var(--irctc-orange)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
                    {selectedTrain.train_number}
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{selectedTrain.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Status: {selectedTrain.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Timeline */}
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--irctc-gray-800)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={18} color="var(--irctc-orange)" /> Route Map
              </h3>

              <div style={{ textAlign: 'center', padding: '40px', background: 'var(--irctc-gray-50)', borderRadius: '12px' }}>
                <Clock size={32} color="var(--irctc-gray-400)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '15px', color: 'var(--irctc-gray-600)', fontWeight: 500 }}>Detailed route map is separated into Schedule Domain.</div>
                <div style={{ fontSize: '13px', color: 'var(--irctc-gray-500)', marginTop: '4px' }}>Train information from Fleet domain does not include schedule.</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
