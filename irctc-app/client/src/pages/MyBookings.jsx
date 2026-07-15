import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { Train, Ticket, AlertCircle, Calendar, MapPin, Clock, X, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../utils/socket';

const CLASS_LABELS = { general: 'General (GN)', sleeper: 'Sleeper (SL)', ac3: 'AC 3 Tier (3A)', ac2: 'AC 2 Tier (2A)', ac1: 'AC First Class (1A)' };

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();

    const onTicketConfirmed = () => {
      // Re-fetch bookings when a ticket is confirmed via socket
      fetchBookings();
    };

    socket.on('ticketConfirmed', onTicketConfirmed);

    return () => {
      socket.off('ticketConfirmed', onTicketConfirmed);
    };
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingApi.getMyBookings();
      setBookings(data.data || data.bookings || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    setCancelling(id);
    try {
      await bookingApi.cancelBooking(id);
      toast.success('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const handleCancelPassenger = async (bookingId, passengerId) => {
    if (!window.confirm('Are you sure you want to cancel this passenger? This action cannot be undone.')) return;
    setCancelling(passengerId);
    try {
      await bookingApi.cancelPassenger(bookingId, passengerId);
      toast.success('Passenger cancelled successfully.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const statusConfig = {
    confirmed: { color: 'var(--irctc-green)', bg: 'var(--irctc-green-light)', icon: <CheckCircle size={14} />, label: 'Confirmed' },
    pending: { color: 'var(--irctc-orange)', bg: '#fff3e0', icon: <Clock size={14} />, label: 'Pending' },
    cancelled: { color: 'var(--irctc-red)', bg: 'var(--irctc-red-light)', icon: <XCircle size={14} />, label: 'Cancelled' },
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--irctc-gray-500)' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎫</div>
      <div>Loading your bookings...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--irctc-gray-100)', padding: '28px 16px' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '24px', color: 'var(--irctc-gray-800)' }}>My Bookings</h1>
            <p style={{ color: 'var(--irctc-gray-500)', fontSize: '14px', marginTop: '4px' }}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={() => navigate('/search')} style={{
            padding: '10px 20px', background: 'var(--irctc-blue)', color: 'white',
            borderRadius: '8px', fontWeight: 600, fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Train size={16} /> Book New Ticket
          </button>
        </div>

        {bookings.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '64px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <Ticket size={64} color="var(--irctc-gray-300)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--irctc-gray-600)', marginBottom: '8px' }}>No Bookings Yet</h3>
            <p style={{ color: 'var(--irctc-gray-400)', fontSize: '14px', marginBottom: '24px' }}>You haven't booked any train tickets yet.</p>
            <button onClick={() => navigate('/search')} style={{
              padding: '12px 28px', background: 'var(--irctc-orange)', color: 'white',
              borderRadius: '8px', fontWeight: 700, fontSize: '15px',
            }}>
              Search & Book Trains
            </button>
          </div>
        ) : (
          bookings.map(booking => {
            const status = statusConfig[booking.bookingStatus] || statusConfig.pending;
            const isExpanded = expandedBooking === booking.id;

            return (
              <div key={booking.id} style={{
                background: 'white', borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--irctc-gray-200)',
                marginBottom: '16px', overflow: 'hidden',
              }}>
                {/* Status bar */}
                <div style={{ height: '4px', background: status.color }} />

                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    {/* Train info */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{
                        width: '44px', height: '44px',
                        background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))',
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Train size={20} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--irctc-gray-800)' }}>
                          {booking.train?.trainName || 'Unknown Train'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', marginTop: '2px' }}>
                          #{booking.train?.trainNumber} · {CLASS_LABELS[booking.travelClass]}
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 12px', borderRadius: '20px',
                        background: status.bg, color: status.color,
                        fontSize: '12px', fontWeight: 700,
                      }}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Route */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', padding: '12px', background: 'var(--irctc-gray-50)', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--irctc-gray-800)' }}>{booking.train?.departureTime || '--'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.train?.from}</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--irctc-gray-400)' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--irctc-gray-300)' }} />
                      <Train size={14} />
                      <div style={{ flex: 1, height: '1px', background: 'var(--irctc-gray-300)' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--irctc-gray-800)' }}>{booking.train?.arrivalTime || '--'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.train?.to}</div>
                    </div>
                  </div>

                  {/* Quick info row */}
                  <div style={{ display: 'flex', gap: '20px', marginTop: '14px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--irctc-gray-600)' }}>
                      <Ticket size={13} color="var(--irctc-blue)" />
                      PNR: <strong style={{ letterSpacing: '1px' }}>{booking.pnrNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--irctc-gray-600)' }}>
                      <Calendar size={13} color="var(--irctc-blue)" />
                      {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--irctc-gray-600)' }}>
                      👥 {booking.totalSeats} passenger{booking.totalSeats !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--irctc-blue)', marginLeft: 'auto' }}>
                      ₹{booking.totalAmount?.toLocaleString()}
                    </div>
                  </div>

                  {/* Expand / actions */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--irctc-gray-100)' }}>
                    <button onClick={() => setExpandedBooking(isExpanded ? null : booking.id)} style={{
                      padding: '8px 16px', border: '1px solid var(--irctc-gray-300)',
                      borderRadius: '6px', background: 'white',
                      fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-700)', cursor: 'pointer',
                    }}>
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>

                    {booking.bookingStatus === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid var(--irctc-red)',
                          borderRadius: '6px',
                          background: 'white',
                          fontSize: '13px', fontWeight: 600,
                          color: 'var(--irctc-red)',
                          cursor: cancelling === booking.id ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          opacity: cancelling === booking.id ? 0.7 : 1,
                        }}
                      >
                        <X size={13} />
                        {cancelling === booking.id ? 'Cancelling...' : 'Cancel Ticket'}
                      </button>
                    )}
                  </div>

                  {/* Expanded passenger details */}
                  {isExpanded && (
                    <div style={{ marginTop: '16px', background: 'var(--irctc-gray-50)', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--irctc-gray-700)', marginBottom: '12px' }}>
                        PASSENGER DETAILS
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ background: 'var(--irctc-gray-100)', color: 'var(--irctc-gray-600)', fontSize: '12px', textAlign: 'left' }}>
                            <th style={{ padding: '10px 12px', fontWeight: 600 }}>Name</th>
                            <th style={{ padding: '10px 12px', fontWeight: 600 }}>Age/Gender</th>
                            <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '10px 12px', fontWeight: 600 }}>Coach</th>
                            <th style={{ padding: '10px 12px', fontWeight: 600 }}>Seat</th>
                            <th style={{ padding: '10px 12px', fontWeight: 600 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {booking.passengers?.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--irctc-gray-100)', fontSize: '13px' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 500 }}>{p.name}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--irctc-gray-500)' }}>{p.age} / {p.gender[0].toUpperCase()}</td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{
                                  padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                                  background: p.status === 'CNF' ? 'var(--irctc-green-light)' : (p.status === 'CANCELLED' ? 'var(--irctc-red-light)' : 'var(--irctc-orange-light)'),
                                  color: p.status === 'CNF' ? 'var(--irctc-green)' : (p.status === 'CANCELLED' ? 'var(--irctc-red)' : 'var(--irctc-orange)')
                                }}>
                                  {p.status} {p.status === 'WL' ? p.waitingListNumber : ''}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', color: 'var(--irctc-gray-600)' }}>{p.coach || '-'}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--irctc-gray-600)' }}>{p.seatNumber || '-'}</td>
                              <td style={{ padding: '10px 12px' }}>
                                {p.status !== 'CANCELLED' && booking.bookingStatus !== 'cancelled' && (
                                  <button
                                    onClick={() => handleCancelPassenger(booking.id, p.id)}
                                    disabled={cancelling === p.id}
                                    style={{
                                      padding: '4px 8px', fontSize: '11px', fontWeight: 600,
                                      color: 'var(--irctc-red)', background: 'transparent',
                                      border: '1px solid var(--irctc-red)', borderRadius: '4px',
                                      cursor: cancelling === p.id ? 'not-allowed' : 'pointer',
                                      opacity: cancelling === p.id ? 0.5 : 1
                                    }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--irctc-gray-500)', display: 'flex', gap: '20px' }}>
                        <span>Payment: <strong style={{ color: booking.paymentStatus === 'completed' ? 'var(--irctc-green)' : 'var(--irctc-orange)' }}>{booking.paymentStatus?.toUpperCase()}</strong></span>
                        {booking.paymentId && <span>Txn ID: <strong>{booking.paymentId}</strong></span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
