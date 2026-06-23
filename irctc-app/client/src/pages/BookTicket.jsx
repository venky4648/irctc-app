import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Train, User, Plus, Trash2, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CLASS_LABELS = { general: 'General (GN)', ac3: 'AC 3 Tier (3A)', ac2: 'AC 2 Tier (2A)', ac1: 'AC First Class (1A)' };
const BERTHS = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];

const emptyPassenger = () => ({ name: '', age: '', gender: 'male', berthPreference: 'Lower' });

export default function BookTicket() {
  const { trainId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const selectedClass = params.get('class') || 'ac3';
  const fromStation = params.get('from') || '';
  const toStation = params.get('to') || '';
  const searchDate = params.get('date') || new Date().toISOString().split('T')[0];

  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [step, setStep] = useState(1); // 1: passengers, 2: payment, 3: confirm
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [booking, setBooking] = useState(null);
  const [booking_loading, setBookingLoading] = useState(false);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const { data } = await API.get('/trains/all');
        let found = data.trains?.find(t => t._id === trainId);
        if (found && !found.classes && found.seatAvailable !== undefined) {
          found = {
            ...found,
            classes: {
              general: {
                totalSeats: found.seatAvailable,
                availableSeats: found.seatAvailable,
                price: found.price || 0
              }
            }
          };
        }
        setTrain(found);
      } catch (err) {
        toast.error('Failed to load train details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrains();
  }, [trainId]);

  const classData = train?.classes?.[selectedClass];
  const price = classData?.price || 0;
  const totalAmount = price * passengers.length;

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

  let journeyFrom = train?.from;
  let journeyTo = train?.to;
  let journeyDep = train?.departureTime;
  let journeyArr = train?.arrivalTime;

  let journeyDepDay = 1;
  let journeyArrDay = 1;

  let arrivalDayOffset = 0;

  if (train?.route && train.route.length > 0 && fromStation && toStation) {
    const fromStationObj = train.route.find(s => s.stationName.toLowerCase().includes(fromStation.toLowerCase()));
    const toStationObj = train.route.find(s => s.stationName.toLowerCase().includes(toStation.toLowerCase()));
    if (fromStationObj && toStationObj) {
      journeyFrom = fromStationObj.stationName;
      journeyTo = toStationObj.stationName;
      journeyDep = fromStationObj.departureTime;
      journeyArr = toStationObj.arrivalTime;
      journeyDepDay = fromStationObj.departureDay || 1;
      journeyArrDay = toStationObj.arrivalDay || 1;
      arrivalDayOffset = (fromStationObj.arrivalDay || 1) - 1;
    }
  }

  let isScheduleValid = true;
  if (train && searchDate) {
    const userJourneyDate = new Date(searchDate);
    const originDate = new Date(userJourneyDate);
    originDate.setDate(originDate.getDate() - arrivalDayOffset);
    
    const originDateString = originDate.toISOString().split('T')[0];
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const originWeekday = days[originDate.getDay()];

    if (train.scheduleType === 'WEEKLY') {
      if (!train.runningDays || !train.runningDays.includes(originWeekday)) {
        isScheduleValid = false;
      }
    } else if (train.scheduleType === 'SPECIAL') {
      if (!train.runningDates || !train.runningDates.includes(originDateString)) {
        isScheduleValid = false;
      }
    }
  }

  const getDuration = (dep, arr, depDay, arrDay) => {
    if (!dep || !arr) return '';
    const [dHr, dMin] = dep.split(':').map(Number);
    const [aHr, aMin] = arr.split(':').map(Number);
    if (isNaN(dHr) || isNaN(aHr)) return '';
    let totalMin = (aHr * 60 + aMin) - (dHr * 60 + dMin);
    
    const dayDiff = arrDay - depDay;
    if (dayDiff > 0) {
      totalMin += dayDiff * 24 * 60;
    } else if (totalMin < 0) {
      totalMin += 24 * 60; // Next day fallback
    }

    const hrs = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hrs}h ${mins}m`;
  };
  const duration = getDuration(journeyDep, journeyArr, journeyDepDay, journeyArrDay);

  const addPassenger = () => {
    if (passengers.length >= 6) { toast.error('Maximum 6 passengers per booking'); return; }
    setPassengers([...passengers, emptyPassenger()]);
  };

  const removePassenger = (i) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== i));
  };

  const updatePassenger = (i, field, value) => {
    setPassengers(passengers.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const validatePassengers = () => {
    for (let p of passengers) {
      if (!p.name.trim()) { toast.error('Please enter passenger name'); return false; }
      if (!p.age || p.age < 1 || p.age > 120) { toast.error('Please enter valid age'); return false; }
    }
    return true;
  };

  const handleBook = async () => {
    setBookingLoading(true);
    try {
      const { data } = await API.post('/bookings/book', {
        trainId,
        passengers: passengers.map(p => ({ ...p, age: Number(p.age) })),
        travelClass: selectedClass,
      });
      setBooking(data);
      setStep(3);
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--irctc-gray-500)' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚂</div>
      Loading train details...
    </div>
  );

  if (!train) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <div style={{ fontSize: '18px', color: 'var(--irctc-gray-600)' }}>Train not found</div>
      <button onClick={() => navigate('/search')} style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--irctc-blue)', color: 'white', borderRadius: '8px' }}>
        Back to Search
      </button>
    </div>
  );

  if (!isScheduleValid) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <div style={{ fontSize: '18px', color: 'var(--irctc-red)', fontWeight: 600 }}>Train does not run on the selected date.</div>
      <div style={{ fontSize: '14px', color: 'var(--irctc-gray-500)', marginTop: '8px' }}>Please select a different date or train.</div>
      <button onClick={() => navigate('/search')} style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--irctc-blue)', color: 'white', borderRadius: '8px' }}>
        Back to Search
      </button>
    </div>
  );

  // Step 3 - Booking Confirmed
  if (step === 3 && booking) {
    const bd = booking.bookingDetails;
    return (
      <div style={{ minHeight: '100vh', background: 'var(--irctc-gray-100)', padding: '32px 16px' }}>
        <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            {/* Success header */}
            <div style={{ background: 'linear-gradient(135deg, var(--irctc-green), #1f6b36)', padding: '40px', textAlign: 'center' }}>
              <CheckCircle size={64} color="white" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ color: 'white', fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Booking Confirmed!</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>Your journey is all set. Have a great trip!</p>
            </div>

            {/* PNR */}
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--irctc-green-light)', borderBottom: '2px dashed var(--irctc-green)' }}>
              <div style={{ fontSize: '13px', color: 'var(--irctc-gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>PNR Number</div>
              <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '4px', color: 'var(--irctc-blue)', fontFamily: 'monospace' }}>{bd.pnrNumber}</div>
              <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)', marginTop: '4px' }}>Save this for future reference</div>
            </div>

            {/* Journey Details */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {[
                  { label: 'Train', value: `${bd.trainName} (${bd.trainNumber})` },
                  { label: 'Class', value: CLASS_LABELS[bd.travelClass] },
                  { label: 'From', value: journeyFrom },
                  { label: 'To', value: journeyTo },
                  { label: 'Departure', value: formatDateTime(journeyDep, journeyDepDay, searchDate) },
                  { label: 'Arrival', value: formatDateTime(journeyArr, journeyArrDay, searchDate) },
                  { label: 'Duration', value: duration },
                  { label: 'Passengers', value: bd.totalSeats },
                  { label: 'Status', value: bd.bookingStatus.toUpperCase() },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--irctc-gray-50)', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--irctc-gray-400)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--irctc-gray-800)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Passengers */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--irctc-gray-700)', marginBottom: '10px' }}>Passenger Details</div>
                {bd.passengers.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', background: 'var(--irctc-gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--irctc-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
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
              <div style={{ background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))', borderRadius: '10px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Total Amount Paid</div>
                <div style={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>₹{bd.totalAmount.toLocaleString()}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button onClick={() => navigate('/my-bookings')} style={{
                  flex: 1, padding: '13px', background: 'var(--irctc-blue)', color: 'white',
                  borderRadius: '8px', fontWeight: 700, fontSize: '14px',
                }}>
                  View My Bookings
                </button>
                <button onClick={() => navigate('/')} style={{
                  flex: 1, padding: '13px', background: 'var(--irctc-gray-100)', color: 'var(--irctc-gray-700)',
                  borderRadius: '8px', fontWeight: 700, fontSize: '14px', border: '1px solid var(--irctc-gray-300)',
                }}>
                  Book Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--irctc-gray-100)', padding: '24px 16px' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', color: 'var(--irctc-blue)',
          fontSize: '14px', fontWeight: 600, marginBottom: '16px', cursor: 'pointer',
        }}>
          <ArrowLeft size={16} /> Back to Search
        </button>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '24px', background: 'white', borderRadius: '12px', padding: '16px 24px', boxShadow: 'var(--shadow-sm)' }}>
          {[{ n: 1, label: 'Passenger Details' }, { n: 2, label: 'Review & Pay' }].map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= n ? 'var(--irctc-blue)' : 'var(--irctc-gray-200)',
                  color: step >= n ? 'white' : 'var(--irctc-gray-500)',
                  fontWeight: 700, fontSize: '14px', flexShrink: 0,
                }}>
                  {n}
                </div>
                <span style={{ fontSize: '14px', fontWeight: step >= n ? 600 : 400, color: step >= n ? 'var(--irctc-gray-800)' : 'var(--irctc-gray-400)' }}>{label}</span>
              </div>
              {i < 1 && <div style={{ flex: 1, height: '2px', background: step >= 2 ? 'var(--irctc-blue)' : 'var(--irctc-gray-200)', margin: '0 16px' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          {/* Main content */}
          <div>
            {step === 1 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--irctc-gray-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} color="var(--irctc-blue)" /> Passenger Details
                  </h3>
                  <button onClick={addPassenger} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', background: 'var(--irctc-blue-light)' + '15',
                    border: '1px solid var(--irctc-blue)', borderRadius: '6px',
                    color: 'var(--irctc-blue)', fontSize: '13px', fontWeight: 600,
                  }}>
                    <Plus size={14} /> Add Passenger
                  </button>
                </div>

                {passengers.map((p, i) => (
                  <div key={i} style={{
                    border: '1px solid var(--irctc-gray-200)', borderRadius: '10px',
                    padding: '18px', marginBottom: '16px',
                    background: 'var(--irctc-gray-50)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--irctc-gray-700)' }}>
                        Passenger {i + 1}
                      </span>
                      {i > 0 && (
                        <button onClick={() => removePassenger(i)} style={{
                          background: 'var(--irctc-red-light)', border: 'none',
                          borderRadius: '6px', padding: '5px 10px',
                          color: 'var(--irctc-red)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                        }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '5px' }}>Full Name *</label>
                        <input value={p.name} onChange={e => updatePassenger(i, 'name', e.target.value)}
                          placeholder="Enter name" required
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--irctc-gray-300)', borderRadius: '6px', fontSize: '14px', background: 'white' }}
                          onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                          onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-300)'}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '5px' }}>Age *</label>
                        <input type="number" value={p.age} onChange={e => updatePassenger(i, 'age', e.target.value)}
                          placeholder="Age" min={1} max={120} required
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--irctc-gray-300)', borderRadius: '6px', fontSize: '14px', background: 'white' }}
                          onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                          onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-300)'}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '5px' }}>Gender *</label>
                        <select value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--irctc-gray-300)', borderRadius: '6px', fontSize: '14px', background: 'white' }}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ maxWidth: '200px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '5px' }}>Berth Preference</label>
                      <select value={p.berthPreference} onChange={e => updatePassenger(i, 'berthPreference', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--irctc-gray-300)', borderRadius: '6px', fontSize: '14px', background: 'white' }}
                      >
                        {BERTHS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                ))}

                <button onClick={() => { if (validatePassengers()) setStep(2); }} style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, var(--irctc-blue), var(--irctc-blue-dark))',
                  color: 'white', borderRadius: '8px', fontSize: '15px', fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(13,78,160,0.3)',
                }}>
                  Continue to Review →
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                {/* Review */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--irctc-gray-800)' }}>Review Passengers</h3>
                  {passengers.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', background: 'var(--irctc-gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '30px', height: '30px', background: 'var(--irctc-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)' }}>{p.age} yrs · {p.gender} · {p.berthPreference}</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setStep(1)} style={{
                    marginTop: '8px', color: 'var(--irctc-blue)', background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}>
                    ← Edit Passengers
                  </button>
                </div>

                {/* Payment */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--irctc-gray-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="var(--irctc-blue)" /> Payment Method
                  </h3>

                  {[
                    { value: 'upi', label: 'UPI', icon: '📱', desc: 'Pay via GPay, PhonePe, Paytm' },
                    { value: 'net_banking', label: 'Net Banking', icon: '🏦', desc: 'All major Indian banks' },
                    { value: 'debit_card', label: 'Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
                    { value: 'credit_card', label: 'Credit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
                  ].map(({ value, label, icon, desc }) => (
                    <label key={value} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px', border: `2px solid ${paymentMethod === value ? 'var(--irctc-blue)' : 'var(--irctc-gray-200)'}`,
                      borderRadius: '8px', marginBottom: '10px', cursor: 'pointer',
                      background: paymentMethod === value ? '#e8f0fb' : 'white',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} style={{ accentColor: 'var(--irctc-blue)' }} />
                      <span style={{ fontSize: '20px' }}>{icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--irctc-gray-800)' }}>{label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)' }}>{desc}</div>
                      </div>
                    </label>
                  ))}

                  {paymentMethod === 'upi' && (
                    <div style={{ marginTop: '8px' }}>
                      <input value={upiId} onChange={e => setUpiId(e.target.value)}
                        placeholder="Enter UPI ID (e.g. name@upi)"
                        style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--irctc-gray-200)', borderRadius: '8px', fontSize: '14px' }}
                        onFocus={e => e.target.style.borderColor = 'var(--irctc-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--irctc-gray-200)'}
                      />
                    </div>
                  )}

                  <button onClick={handleBook} disabled={booking_loading} style={{
                    width: '100%', padding: '15px', marginTop: '20px',
                    background: booking_loading ? 'var(--irctc-gray-300)' : 'linear-gradient(135deg, var(--irctc-orange), var(--irctc-orange-dark))',
                    color: 'white', borderRadius: '8px', fontSize: '16px', fontWeight: 700,
                    cursor: booking_loading ? 'not-allowed' : 'pointer',
                    boxShadow: booking_loading ? 'none' : '0 4px 14px rgba(232,119,34,0.45)',
                  }}>
                    {booking_loading ? 'Processing Payment...' : `Pay ₹${totalAmount.toLocaleString()} & Confirm`}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--irctc-gray-400)', marginTop: '12px' }}>
                    🔒 Secured by IRCTC Payment Gateway · 256-bit SSL
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--irctc-gray-800)', paddingBottom: '12px', borderBottom: '1px solid var(--irctc-gray-200)' }}>
              Booking Summary
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--irctc-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Train size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--irctc-gray-800)' }}>{train.trainName}</div>
                <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)' }}>#{train.trainNumber}</div>
              </div>
            </div>

            {[
              { label: 'From', value: journeyFrom },
              { label: 'To', value: journeyTo },
              { label: 'Departure', value: formatDateTime(journeyDep, journeyDepDay, searchDate) },
              { label: 'Arrival', value: formatDateTime(journeyArr, journeyArrDay, searchDate) },
              { label: 'Duration', value: duration },
              { label: 'Class', value: CLASS_LABELS[selectedClass] },
              { label: 'Passengers', value: passengers.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--irctc-gray-500)' }}>{label}</span>
                <span style={{ color: 'var(--irctc-gray-800)', fontWeight: 600 }}>{value}</span>
              </div>
            ))}

            <div style={{ borderTop: '2px dashed var(--irctc-gray-200)', marginTop: '14px', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--irctc-gray-500)' }}>Base Fare</span>
                <span>₹{price} × {passengers.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--irctc-gray-500)' }}>IRCTC Fee</span>
                <span style={{ color: 'var(--irctc-green)' }}>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--irctc-gray-200)' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--irctc-blue)' }}>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
