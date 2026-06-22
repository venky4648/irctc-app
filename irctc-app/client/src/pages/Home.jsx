import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Shield, Clock, Headphones, ChevronRight, Smartphone, CreditCard, Star } from 'lucide-react';
import StationInput from '../components/StationInput';

const POPULAR_ROUTES = [
  { from: 'New Delhi', to: 'Mumbai Central' },
  { from: 'New Delhi', to: 'Howrah' },
  { from: 'New Delhi', to: 'Bangalore' },
  { from: 'Mumbai Central', to: 'Howrah' },
  { from: 'New Delhi', to: 'Chennai Central' },
  { from: 'New Delhi', to: 'Trivandrum' },
];

const TRAIN_CLASSES = [
  { value: 'all', label: 'All Classes' },
  { value: 'general', label: 'General (GN)' },
  { value: 'ac3', label: 'AC 3 Tier (3A)' },
  { value: 'ac2', label: 'AC 2 Tier (2A)' },
  { value: 'ac1', label: 'AC First Class (1A)' },
];

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: '', to: '', date: new Date().toISOString().split('T')[0], travelClass: 'all'
  });

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.from.trim() || !form.to.trim()) return;
    navigate(`/search?from=${encodeURIComponent(form.from)}&to=${encodeURIComponent(form.to)}&date=${form.date}&class=${form.travelClass}`);
  };

  const setRoute = (from, to) => {
    setForm(f => ({ ...f, from, to }));
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--irctc-blue) 0%, var(--irctc-blue-dark) 60%, #061e42 100%)',
        padding: '48px 16px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 16px', marginBottom: '16px' }}>
              <Train size={14} color="var(--irctc-orange-light)" />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500 }}>India's Official Rail Booking Platform</span>
            </div>
            <h1 style={{ color: 'white', fontSize: '36px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>
              Book Train Tickets <span style={{ color: 'var(--irctc-orange-light)' }}>Instantly</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>Search trains, check availability, and confirm your journey in minutes</p>
          </div>

          {/* Search Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            padding: '28px',
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid var(--irctc-gray-200)', paddingBottom: '16px' }}>
              {['Book Ticket', 'PNR Status', 'Train Schedule'].map((tab, i) => (
                <button key={tab} onClick={() => i === 1 && navigate('/pnr')} style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: i === 0 ? 'var(--irctc-blue)' : 'var(--irctc-gray-100)',
                  color: i === 0 ? 'white' : 'var(--irctc-gray-600)',
                  fontWeight: i === 0 ? 600 : 400,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}>
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                {/* From */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    From Station
                  </label>
                  <StationInput
                    value={form.from}
                    onChange={(val) => setForm(f => ({ ...f, from: val }))}
                    placeholder="e.g. New Delhi"
                    required
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '2px solid var(--irctc-gray-200)',
                      borderRadius: '8px', fontSize: '15px',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                  />
                </div>

                {/* To */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    To Station
                  </label>
                  <StationInput
                    value={form.to}
                    onChange={(val) => setForm(f => ({ ...f, to: val }))}
                    placeholder="e.g. Mumbai Central"
                    required
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '2px solid var(--irctc-gray-200)',
                      borderRadius: '8px', fontSize: '15px',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                  />
                </div>

                {/* Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Journey Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={today}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '2px solid var(--irctc-gray-200)',
                      borderRadius: '8px', fontSize: '15px',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                  />
                </div>

                {/* Class */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Travel Class
                  </label>
                  <select
                    value={form.travelClass}
                    onChange={e => setForm(f => ({ ...f, travelClass: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '2px solid var(--irctc-gray-200)',
                      borderRadius: '8px', fontSize: '15px',
                      background: 'white',
                    }}
                  >
                    {TRAIN_CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* Search Button */}
                <button type="submit" style={{
                  background: 'linear-gradient(135deg, var(--irctc-orange), var(--irctc-orange-dark))',
                  color: 'white', padding: '13px 28px',
                  borderRadius: '8px', fontSize: '15px',
                  fontWeight: 700, whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(232,119,34,0.4)',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🔍 Search
                </button>
              </div>
            </form>

            {/* Popular Routes */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--irctc-gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Popular Routes
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {POPULAR_ROUTES.map(({ from, to }) => (
                  <button
                    key={`${from}-${to}`}
                    onClick={() => setRoute(from, to)}
                    style={{
                      padding: '5px 12px',
                      border: '1px solid var(--irctc-gray-300)',
                      borderRadius: '20px',
                      background: 'white',
                      fontSize: '13px',
                      color: 'var(--irctc-blue)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--irctc-blue)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--irctc-blue)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--irctc-blue)'; e.currentTarget.style.borderColor = 'var(--irctc-gray-300)'; }}
                  >
                    <Train size={11} /> {from} → {to}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ background: 'var(--irctc-orange)', padding: '20px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
            {[
              { value: '13,000+', label: 'Daily Trains' },
              { value: '8 Million+', label: 'Daily Passengers' },
              { value: '7,349', label: 'Stations' },
              { value: '99.9%', label: 'Service Uptime' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '22px' }}>{value}</div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '64px 16px', background: 'var(--irctc-gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--irctc-gray-800)', marginBottom: '8px' }}>
              Why Book with IRCTC?
            </h2>
            <p style={{ color: 'var(--irctc-gray-500)', fontSize: '16px' }}>Trusted by millions of Indian railway passengers</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { icon: <Shield size={28} color="var(--irctc-blue)" />, title: 'Secure Booking', desc: 'End-to-end encrypted transactions with PCI DSS compliance and secure payment gateway.' },
              { icon: <Clock size={28} color="var(--irctc-orange)" />, title: 'Real-time Availability', desc: 'Live seat availability updates across all classes — General, AC 3-Tier, AC 2-Tier, and First Class.' },
              { icon: <Headphones size={28} color="var(--irctc-green)" />, title: '24/7 Support', desc: 'Round-the-clock customer support for cancellations, refunds, and travel queries.' },
              { icon: <CreditCard size={28} color="var(--irctc-blue)" />, title: 'Easy Payments', desc: 'Pay via UPI, Net Banking, Debit/Credit Cards, or IRCTC Wallet — your choice.' },
              { icon: <Smartphone size={28} color="var(--irctc-orange)" />, title: 'Instant e-Tickets', desc: 'Download your PNR e-ticket immediately after booking. No printing required.' },
              { icon: <Star size={28} color="var(--irctc-yellow)" />, title: 'Tatkal Booking', desc: 'Emergency travel sorted. Book Tatkal tickets up to 1 day before departure.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '28px 24px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--irctc-gray-200)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{ marginBottom: '16px', width: '52px', height: '52px', borderRadius: '12px', background: 'var(--irctc-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: 'var(--irctc-gray-800)' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--irctc-gray-500)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '64px 16px', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--irctc-gray-800)', marginBottom: '8px' }}>How to Book</h2>
            <p style={{ color: 'var(--irctc-gray-500)' }}>Your ticket confirmed in 4 simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', position: 'relative' }}>
            {[
              { step: '01', title: 'Search Trains', desc: 'Enter source, destination, and travel date', color: 'var(--irctc-blue)' },
              { step: '02', title: 'Choose Train & Class', desc: 'Pick the best train and class for your journey', color: 'var(--irctc-orange)' },
              { step: '03', title: 'Add Passengers', desc: 'Fill passenger details and berth preferences', color: 'var(--irctc-green)' },
              { step: '04', title: 'Pay & Confirm', desc: 'Secure payment and get your PNR instantly', color: 'var(--irctc-blue)' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px',
                  background: color, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '22px', fontWeight: 800, color: 'white',
                }}>
                  {step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: 'var(--irctc-gray-800)' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--irctc-gray-500)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--irctc-gray-900)', color: 'rgba(255,255,255,0.7)', padding: '48px 16px 24px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Train size={20} color="var(--irctc-orange)" />
                <span style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}>IRCTC</span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.7 }}>
                Indian Railway Catering and Tourism Corporation Ltd. A Government of India Enterprise.
              </p>
            </div>
            {[
              { title: 'Quick Links', links: ['Book Ticket', 'PNR Status', 'Train Schedule', 'Seat Availability'] },
              { title: 'Services', links: ['E-Catering', 'Tourism', 'Tatkal Quota', 'Senior Citizen Quota'] },
              { title: 'Help', links: ['Contact Us', 'FAQ', 'Refund Rules', 'Cancellation Policy'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{ color: 'white', fontWeight: 600, marginBottom: '12px' }}>{title}</div>
                {links.map(l => (
                  <div key={l} style={{ fontSize: '13px', marginBottom: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--irctc-orange-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center', fontSize: '13px' }}>
            © 2025 IRCTC (Simulation). All rights reserved. | A Government of India Enterprise
          </div>
        </div>
      </footer>
    </div>
  );
}
