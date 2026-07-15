import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

import { networkApi } from '../api/networkApi';

let cachedStations = null;

export default function StationInput({ value, onChange, placeholder, style, onFocus, onBlur, required }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [stations, setStations] = useState(cachedStations || []);
  const wrapperRef = useRef(null);

  // Fetch unique stations from the backend
  useEffect(() => {
    if (!cachedStations) {
      networkApi.searchStations().then(res => {
        const uniqueStations = new Set();
        const normalize = (s) => {
          if (!s) return "";
          return s.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        };
        const stationsData = res.data.data || res.data.stations || [];
        stationsData.forEach(s => {
          if (s.name) uniqueStations.add(normalize(s.name));
        });
        const arr = Array.from(uniqueStations).filter(Boolean).sort();
        cachedStations = arr;
        setStations(arr);
      }).catch(err => console.error("Failed to fetch stations:", err));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    
    if (val.trim()) {
      const matches = stations.filter(s => s.toLowerCase().includes(val.toLowerCase()));
      setFiltered(matches);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (station) => {
    onChange(station);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        style={style}
        onFocus={(e) => {
          if (value.trim()) {
            const matches = stations.filter(s => s.toLowerCase().includes(value.toLowerCase()));
            setFiltered(matches);
            setShowDropdown(true);
          } else {
            // Show all stations when empty
            setFiltered(stations);
            setShowDropdown(true);
          }
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          if (onBlur) onBlur(e);
        }}
        autoComplete="off"
      />
      {showDropdown && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--irctc-gray-200)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          {filtered.map(station => (
            <div
              key={station}
              onClick={() => handleSelect(station)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--irctc-gray-100)',
                color: 'var(--irctc-gray-800)',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--irctc-gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={14} color="var(--irctc-gray-400)" />
              {station}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
