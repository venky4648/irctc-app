import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Train, Plus, Save, AlertCircle, ArrowLeft, Edit2, Trash2, X, LayoutDashboard, ListPlus, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const TimePicker12 = ({ value, onChange, style }) => {
  const [h, m] = (value || "12:00").split(':');
  let hours = parseInt(h, 10);
  if (isNaN(hours)) hours = 12;
  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;
  const displayMin = m || "00";

  const updateTime = (newH, newM, newPM) => {
    let finalH = parseInt(newH, 10);
    if (newPM && finalH !== 12) finalH += 12;
    if (!newPM && finalH === 12) finalH = 0;
    onChange(`${finalH.toString().padStart(2, '0')}:${newM.padStart(2, '0')}`);
  };

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', ...style, background: 'white' }}>
      <select value={displayHour} onChange={(e) => updateTime(e.target.value, displayMin, isPM)} style={{ padding: '8px 4px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)', background: 'transparent' }}>
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n.toString().padStart(2, '0')}</option>)}
      </select>
      <span style={{ fontWeight: 600 }}>:</span>
      <select value={displayMin} onChange={(e) => updateTime(displayHour, e.target.value, isPM)} style={{ padding: '8px 4px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)', background: 'transparent' }}>
        {Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')).map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <select value={isPM ? 'PM' : 'AM'} onChange={(e) => updateTime(displayHour, displayMin, e.target.value === 'PM')} style={{ padding: '8px 4px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)', background: 'transparent' }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trainsList, setTrainsList] = useState([]);
  const [editingTrainId, setEditingTrainId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, add_train, manage_trains

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      const { data } = await API.get('/trains/all');
      setTrainsList(data.trains || []);
    } catch (err) {
      toast.error('Failed to load existing trains');
    }
  };

  // Form State
  const [trainData, setTrainData] = useState({
    trainNumber: '',
    trainName: '',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
  });

  const [classesData, setClassesData] = useState({
    general: { coachCount: 0, seatsPerCoach: 90, price: 0 },
    sleeper: { coachCount: 0, seatsPerCoach: 72, price: 0 },
    ac3: { coachCount: 0, seatsPerCoach: 64, price: 0 },
    ac2: { coachCount: 0, seatsPerCoach: 48, price: 0 },
    ac1: { coachCount: 0, seatsPerCoach: 24, price: 0 },
  });

  const [route, setRoute] = useState([]);
  const [scheduleType, setScheduleType] = useState('DAILY');
  const [runningDays, setRunningDays] = useState([]);
  const [runningDates, setRunningDates] = useState([]);
  const [newDate, setNewDate] = useState('');

  const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const toggleDay = (day) => {
    if (runningDays.includes(day)) {
      setRunningDays(runningDays.filter(d => d !== day));
    } else {
      setRunningDays([...runningDays, day]);
    }
  };

  const addDate = () => {
    if (newDate && !runningDates.includes(newDate)) {
      setRunningDates([...runningDates, newDate].sort());
      setNewDate('');
    }
  };

  const removeDate = (dateToRemove) => {
    setRunningDates(runningDates.filter(d => d !== dateToRemove));
  };

  const addRouteStation = () => {
    setRoute([...route, { stationName: '', arrivalDay: 1, arrivalTime: '12:00', departureDay: 1, departureTime: '12:00', distanceFromSource: 0 }]);
  };

  const removeRouteStation = (index) => {
    const newRoute = [...route];
    newRoute.splice(index, 1);
    setRoute(newRoute);
  };

  const handleRouteChange = (index, field, value) => {
    const newRoute = [...route];
    newRoute[index][field] = value;
    setRoute(newRoute);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '80px', minHeight: '100vh', background: 'var(--irctc-gray-100)' }}>
        <AlertCircle size={48} color="var(--irctc-red)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', color: 'var(--irctc-gray-800)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: 'var(--irctc-gray-600)' }}>You must be an administrator to view this page.</p>
        <button onClick={() => navigate('/')} style={{
          marginTop: '20px', padding: '10px 20px', background: 'var(--irctc-blue)', color: 'white',
          borderRadius: '8px', fontWeight: 600,
        }}>Back to Home</button>
      </div>
    );
  }

  const handleBasicChange = (e) => {
    setTrainData({ ...trainData, [e.target.name]: e.target.value });
  };

  const handleClassChange = (cls, field, value) => {
    setClassesData({
      ...classesData,
      [cls]: { ...classesData[cls], [field]: Number(value) }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payloadClasses = {
        general: {
          coachCount: classesData.general.coachCount,
          seatsPerCoach: classesData.general.seatsPerCoach,
          price: classesData.general.price
        },
        sleeper: {
          coachCount: classesData.sleeper.coachCount,
          seatsPerCoach: classesData.sleeper.seatsPerCoach,
          price: classesData.sleeper.price
        },
        ac3: {
          coachCount: classesData.ac3.coachCount,
          seatsPerCoach: classesData.ac3.seatsPerCoach,
          price: classesData.ac3.price
        },
        ac2: {
          coachCount: classesData.ac2.coachCount,
          seatsPerCoach: classesData.ac2.seatsPerCoach,
          price: classesData.ac2.price
        },
        ac1: {
          coachCount: classesData.ac1.coachCount,
          seatsPerCoach: classesData.ac1.seatsPerCoach,
          price: classesData.ac1.price
        }
      };

      const payload = {
        ...trainData,
        route,
        classes: payloadClasses,
        scheduleType,
        runningDays,
        runningDates
      };

      if (editingTrainId) {
        const res = await API.put(`/trains/${editingTrainId}`, payload);
        if (res.data.success) {
          toast.success(`Train ${trainData.trainName} updated successfully!`);
          resetForm();
          fetchTrains();
          setActiveTab('manage_trains');
        }
      } else {
        const res = await API.post('/trains/add', payload);
        if (res.data.success) {
          toast.success(`Train ${trainData.trainName} added successfully!`);
          resetForm();
          fetchTrains();
          setActiveTab('manage_trains');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save train');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTrainData({ trainNumber: '', trainName: '', from: '', to: '', departureTime: '', arrivalTime: '' });
    setClassesData({
      general: { coachCount: 0, seatsPerCoach: 90, price: 0 },
      sleeper: { coachCount: 0, seatsPerCoach: 72, price: 0 },
      ac3: { coachCount: 0, seatsPerCoach: 64, price: 0 },
      ac2: { coachCount: 0, seatsPerCoach: 48, price: 0 },
      ac1: { coachCount: 0, seatsPerCoach: 24, price: 0 },
    });
    setRoute([]);
    setScheduleType('DAILY');
    setRunningDays([]);
    setRunningDates([]);
    setEditingTrainId(null);
  };

  const handleEdit = (train) => {
    setEditingTrainId(train._id);
    setTrainData({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      from: train.from,
      to: train.to,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
    });
    const cls = train.classes || {};
    setClassesData({
      general: { coachCount: cls.general?.coachCount || 0, seatsPerCoach: cls.general?.seatsPerCoach || 90, price: cls.general?.price || 0 },
      sleeper: { coachCount: cls.sleeper?.coachCount || 0, seatsPerCoach: cls.sleeper?.seatsPerCoach || 72, price: cls.sleeper?.price || 0 },
      ac3: { coachCount: cls.ac3?.coachCount || 0, seatsPerCoach: cls.ac3?.seatsPerCoach || 64, price: cls.ac3?.price || 0 },
      ac2: { coachCount: cls.ac2?.coachCount || 0, seatsPerCoach: cls.ac2?.seatsPerCoach || 48, price: cls.ac2?.price || 0 },
      ac1: { coachCount: cls.ac1?.coachCount || 0, seatsPerCoach: cls.ac1?.seatsPerCoach || 24, price: cls.ac1?.price || 0 },
    });
    setRoute(train.route || []);
    setScheduleType(train.scheduleType || 'DAILY');
    setRunningDays(train.runningDays || []);
    setRunningDates(train.runningDates || []);
    setActiveTab('add_train');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (trainId, trainName) => {
    if (!window.confirm(`Are you sure you want to completely delete ${trainName} and its route?`)) return;
    try {
      const res = await API.delete(`/trains/${trainId}`);
      if (res.data.success) {
        toast.success(`${trainName} deleted successfully`);
        if (editingTrainId === trainId) resetForm();
        fetchTrains();
      }
    } catch (err) {
      toast.error('Failed to delete train');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--irctc-gray-100)' }}>
      {/* Sidebar */ }
      <div style={{ width: '260px', background: 'white', borderRight: '1px solid var(--irctc-gray-200)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--irctc-gray-100)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--irctc-blue)', padding: '8px', borderRadius: '8px' }}><Train color="white" size={24} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--irctc-gray-800)' }}>Admin Panel</div>
            <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)' }}>IRCTC Management</div>
          </div>
        </div>
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'overview' ? 'var(--irctc-blue-light)' + '20' : 'transparent', color: activeTab === 'overview' ? 'var(--irctc-blue)' : 'var(--irctc-gray-600)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => { setActiveTab('add_train'); if(!editingTrainId) resetForm(); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'add_train' ? 'var(--irctc-blue-light)' + '20' : 'transparent', color: activeTab === 'add_train' ? 'var(--irctc-blue)' : 'var(--irctc-gray-600)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <ListPlus size={18} /> {editingTrainId ? 'Edit Train' : 'Add Train'}
          </button>
          <button onClick={() => setActiveTab('manage_trains')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'manage_trains' ? 'var(--irctc-blue-light)' + '20' : 'transparent', color: activeTab === 'manage_trains' ? 'var(--irctc-blue)' : 'var(--irctc-gray-600)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Settings size={18} /> Manage Trains
          </button>
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid var(--irctc-gray-200)' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: 'var(--irctc-gray-100)', color: 'var(--irctc-gray-700)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Back to Main App
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--irctc-gray-800)', marginBottom: '24px' }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--irctc-gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '14px', color: 'var(--irctc-gray-500)', fontWeight: 600, marginBottom: '8px' }}>Total Trains Active</div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--irctc-blue)' }}>{trainsList.length}</div>
              </div>
            </div>
            <div style={{ marginTop: '40px', padding: '60px 40px', background: 'white', borderRadius: '12px', textAlign: 'center', border: '1px dashed var(--irctc-gray-300)' }}>
              <Train size={48} color="var(--irctc-gray-300)" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--irctc-gray-600)' }}>Welcome to the IRCTC Admin Panel</div>
              <div style={{ fontSize: '15px', color: 'var(--irctc-gray-400)', marginTop: '8px' }}>Select an option from the sidebar to manage the system.</div>
            </div>
          </div>
        )}

        {activeTab === 'add_train' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ padding: '24px', background: 'var(--irctc-blue)', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Train size={28} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{editingTrainId ? 'Edit Train' : 'Add New Train'}</h2>
                  <div style={{ fontSize: '13px', opacity: 0.8 }}>System Configuration</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--irctc-gray-800)', marginBottom: '16px', borderBottom: '1px solid var(--irctc-gray-200)', paddingBottom: '8px' }}>
                  Basic Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Train Number *</label>
                    <input required name="trainNumber" value={trainData.trainNumber} onChange={handleBasicChange} placeholder="e.g. 12951"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Train Name *</label>
                    <input required name="trainName" value={trainData.trainName} onChange={handleBasicChange} placeholder="e.g. Mumbai Rajdhani"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Source Station (From) *</label>
                    <input required name="from" value={trainData.from} onChange={handleBasicChange} placeholder="e.g. New Delhi"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Destination Station (To) *</label>
                    <input required name="to" value={trainData.to} onChange={handleBasicChange} placeholder="e.g. Mumbai Central"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Departure Time *</label>
                    <TimePicker12 value={trainData.departureTime} onChange={(val) => setTrainData({...trainData, departureTime: val})} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Arrival Time *</label>
                    <TimePicker12 value={trainData.arrivalTime} onChange={(val) => setTrainData({...trainData, arrivalTime: val})} style={{ width: '100%' }} />
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--irctc-gray-800)', marginBottom: '16px', borderBottom: '1px solid var(--irctc-gray-200)', paddingBottom: '8px', marginTop: '24px' }}>
                  Schedule Configuration
                </h3>
                <div style={{ marginBottom: '32px', background: 'var(--irctc-gray-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--irctc-gray-200)' }}>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="radio" name="schedule" checked={scheduleType === 'DAILY'} onChange={() => setScheduleType('DAILY')} /> Daily
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="radio" name="schedule" checked={scheduleType === 'WEEKLY'} onChange={() => setScheduleType('WEEKLY')} /> Weekly
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="radio" name="schedule" checked={scheduleType === 'SPECIAL'} onChange={() => setScheduleType('SPECIAL')} /> Special (Dates)
                    </label>
                  </div>

                  {scheduleType === 'WEEKLY' && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {DAYS_OF_WEEK.map(day => (
                        <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'white', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--irctc-gray-300)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={runningDays.includes(day)} onChange={() => toggleDay(day)} />
                          {day.slice(0, 3)}
                        </label>
                      ))}
                    </div>
                  )}

                  {scheduleType === 'SPECIAL' && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                        <button type="button" onClick={addDate} style={{ padding: '8px 16px', background: 'var(--irctc-blue)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Add Date</button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {runningDates.map(d => (
                          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--irctc-gray-300)', fontSize: '13px' }}>
                            {d}
                            <button type="button" onClick={() => removeDate(d)} style={{ background: 'none', border: 'none', color: 'var(--irctc-red)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>x</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--irctc-gray-800)', marginBottom: '16px', borderBottom: '1px solid var(--irctc-gray-200)', paddingBottom: '8px' }}>
                  Route Timeline
                </h3>

                <div style={{ marginBottom: '32px' }}>
                  {route.map((station, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.2fr 0.8fr 1.2fr 1fr auto', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px' }}>Station</label>
                        <input required value={station.stationName} onChange={(e) => handleRouteChange(index, 'stationName', e.target.value)} placeholder="Name" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px', whiteSpace: 'nowrap' }}>Arr Day</label>
                        <input type="number" min="1" required value={station.arrivalDay || 1} onChange={(e) => handleRouteChange(index, 'arrivalDay', Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px', whiteSpace: 'nowrap' }}>Arr Time</label>
                        <TimePicker12 value={station.arrivalTime} onChange={(val) => handleRouteChange(index, 'arrivalTime', val)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px', whiteSpace: 'nowrap' }}>Dep Day</label>
                        <input type="number" min="1" required value={station.departureDay || 1} onChange={(e) => handleRouteChange(index, 'departureDay', Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px', whiteSpace: 'nowrap' }}>Dep Time</label>
                        <TimePicker12 value={station.departureTime} onChange={(val) => handleRouteChange(index, 'departureTime', val)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px', whiteSpace: 'nowrap' }}>Dist (km)</label>
                        <input type="number" min="0" value={station.distanceFromSource} onChange={(e) => handleRouteChange(index, 'distanceFromSource', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)', fontSize: '13px' }} />
                      </div>
                      <button type="button" onClick={() => removeRouteStation(index)} style={{ marginTop: '20px', padding: '8px 12px', background: 'var(--irctc-red)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        Rem
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addRouteStation} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--irctc-gray-200)', color: 'var(--irctc-gray-800)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                    <Plus size={16} /> Add Station
                  </button>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--irctc-gray-800)', marginBottom: '16px', borderBottom: '1px solid var(--irctc-gray-200)', paddingBottom: '8px' }}>
                  Class Capacities & Pricing
                </h3>
                
                <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
                  {['general', 'sleeper', 'ac3', 'ac2', 'ac1'].map((cls) => (
                    <div key={cls} style={{ background: 'var(--irctc-gray-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--irctc-gray-200)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--irctc-blue)', marginBottom: '12px' }}>
                        {cls === 'general' ? 'General' : (cls === 'sleeper' ? 'Sleeper (SL)' : cls.toUpperCase())}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px' }}>Coach Count</label>
                          <input type="number" min="0" required value={classesData[cls].coachCount} onChange={(e) => handleClassChange(cls, 'coachCount', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px' }}>Seats Per Coach</label>
                          <input type="number" min="0" required value={classesData[cls].seatsPerCoach} onChange={(e) => handleClassChange(cls, 'seatsPerCoach', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px' }}>Price (₹)</label>
                          <input type="number" min="0" required value={classesData[cls].price} onChange={(e) => handleClassChange(cls, 'price', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  {editingTrainId && (
                    <button type="button" onClick={() => { resetForm(); setActiveTab('manage_trains'); }} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px 24px', background: 'var(--irctc-gray-200)', color: 'var(--irctc-gray-700)',
                      borderRadius: '8px', fontSize: '15px', fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                    }}>
                      <X size={18} /> Cancel Edit
                    </button>
                  )}
                  <button disabled={loading} type="submit" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: 'var(--irctc-orange)', color: 'white',
                    borderRadius: '8px', fontSize: '15px', fontWeight: 700,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}>
                    <Save size={18} />
                    {loading ? 'Saving Train...' : (editingTrainId ? 'Update Train in System' : 'Add Train to System')}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage_trains' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--irctc-gray-800)', margin: 0 }}>Manage Existing Trains</h2>
              <button onClick={() => { setActiveTab('add_train'); resetForm(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--irctc-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={16} /> Add New Train
              </button>
            </div>
            {trainsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 40px', background: 'white', borderRadius: '12px', border: '1px dashed var(--irctc-gray-300)' }}>
                <Train size={48} color="var(--irctc-gray-300)" style={{ margin: '0 auto 16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--irctc-gray-600)' }}>No trains found in the system.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {trainsList.map(train => (
                  <div key={train._id} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--irctc-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--irctc-blue)' }}>{train.trainName}</div>
                        <div style={{ fontSize: '14px', color: 'var(--irctc-gray-500)', fontWeight: 600, background: 'var(--irctc-gray-100)', padding: '2px 8px', borderRadius: '4px' }}>#{train.trainNumber}</div>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--irctc-gray-700)', display: 'flex', gap: '24px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--irctc-gray-400)' }}>Route:</span> 
                          <span style={{ fontWeight: 600 }}>{train.from} → {train.to}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--irctc-gray-400)' }}>Schedule:</span>{' '}
                          <span style={{ fontWeight: 600, color: 'var(--irctc-orange)' }}>
                            {train.scheduleType === 'DAILY' ? 'Daily' : train.scheduleType === 'WEEKLY' ? train.runningDays.map(d=>d.slice(0,3)).join(', ') : 'Special Dates'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEdit(train)} style={{ padding: '10px 18px', background: 'var(--irctc-gray-50)', color: 'var(--irctc-gray-800)', border: '1px solid var(--irctc-gray-300)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, transition: 'all 0.2s' }}>
                        <Edit2 size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(train._id, train.trainName)} style={{ padding: '10px 18px', background: 'var(--irctc-red-light)' + '30', color: 'var(--irctc-red)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, transition: 'all 0.2s' }}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
