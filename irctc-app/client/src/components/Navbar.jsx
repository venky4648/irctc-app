import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, User, LogOut, Menu, X, Ticket, Search, Home, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ background: 'var(--irctc-blue)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top strip */}
      <div style={{ background: 'var(--irctc-orange)', padding: '4px 0', fontSize: '12px', textAlign: 'center', color: 'white', fontWeight: 500 }}>
        🚂 Indian Railway Catering and Tourism Corporation (IRCTC) — Book Train Tickets Online
      </div>

      {/* Main navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            background: 'var(--irctc-orange)',
            borderRadius: '8px',
            width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Train size={22} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '20px', lineHeight: 1 }}>IRCTC</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', letterSpacing: '0.5px' }}>INDIAN RAILWAYS</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">
          {[
            { to: '/', label: 'Home', icon: <Home size={15} /> },
            { to: '/search', label: 'Book Tickets', icon: <Search size={15} /> },
            { to: '/pnr', label: 'PNR Status', icon: <Ticket size={15} /> },
          ].map(({ to, label, icon }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              color: isActive(to) ? 'white' : 'rgba(255,255,255,0.8)',
              background: isActive(to) ? 'rgba(255,255,255,0.15)' : 'transparent',
              fontSize: '14px',
              fontWeight: isActive(to) ? 600 : 400,
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}>
              {icon} {label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link to="/my-bookings" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              color: isActive('/my-bookings') ? 'white' : 'rgba(255,255,255,0.8)',
              background: isActive('/my-bookings') ? 'rgba(255,255,255,0.15)' : 'transparent',
              fontSize: '14px',
              fontWeight: isActive('/my-bookings') ? 600 : 400,
              textDecoration: 'none',
            }}>
              <Ticket size={15} /> My Bookings
            </Link>
          )}
        </nav>

        {/* Auth section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLoggedIn ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '28px', height: '28px',
                  background: 'var(--irctc-orange)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700
                }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                {user?.name?.split(' ')[0]}
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: '180px',
                  overflow: 'hidden',
                  border: '1px solid var(--irctc-gray-200)',
                  zIndex: 200,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--irctc-gray-200)', background: 'var(--irctc-gray-50)' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--irctc-gray-800)' }}>{user?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)' }}>{user?.email}</div>
                  </div>
                  <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 16px',
                    color: 'var(--irctc-gray-700)',
                    fontSize: '14px',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--irctc-gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Ticket size={15} /> My Bookings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '11px 16px',
                      color: 'var(--irctc-gray-700)',
                      fontSize: '14px',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--irctc-gray-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Train size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '11px 16px',
                    color: 'var(--irctc-red)',
                    fontSize: '14px',
                    background: 'transparent',
                    borderTop: '1px solid var(--irctc-gray-200)',
                    textAlign: 'left',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--irctc-red-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{
                padding: '8px 18px',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Login
              </Link>
              <Link to="/register" style={{
                padding: '8px 18px',
                background: 'var(--irctc-orange)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--irctc-orange-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--irctc-orange)'}
              >
                Register
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'transparent', color: 'white', display: 'none', padding: '4px' }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div style={{
          background: 'var(--irctc-blue-dark)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/search', label: 'Book Tickets' },
            { to: '/pnr', label: 'PNR Status' },
            ...(isLoggedIn ? [{ to: '/my-bookings', label: 'My Bookings' }] : []),
            ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Dashboard' }] : []),
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
              padding: '10px 14px',
              color: 'white',
              fontSize: '15px',
              borderRadius: '6px',
              textDecoration: 'none',
              background: isActive(to) ? 'rgba(255,255,255,0.15)' : 'transparent',
            }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
