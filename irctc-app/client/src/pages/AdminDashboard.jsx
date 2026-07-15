import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, AlertCircle, ArrowLeft, LayoutDashboard, Settings, Plus, Save, Map, Trash2, ListPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, add_train, manage_routes, manage_users
  const [usersList, setUsersList] = useState([]);
  const [trainsList, setTrainsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Train Form State
  const [trainData, setTrainData] = useState({
    train_number: '',
    name: '',
    departure_time: '12:00:00',
    arrival_time: '12:00:00'
  });

  // Route Form State
  const [selectedTrainId, setSelectedTrainId] = useState('');
  const [routeStations, setRouteStations] = useState([]);

  useEffect(() => {
    if (activeTab === 'manage_users') fetchUsers();
    if (activeTab === 'manage_routes' || activeTab === 'overview') fetchTrains();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('irctc_token') }
      });
      const data = await res.json();
      if (data.success) setUsersList(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTrains = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trains', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('irctc_token') }
      });
      const data = await res.json();
      if (data.success) setTrainsList(data.trains);
    } catch (error) {
      console.error('Error fetching trains:', error);
    }
  };

  const fetchTrainRoutes = async (trainId) => {
    if (!trainId) {
      setRouteStations([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/trains/${trainId}/routes`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('irctc_token') }
      });
      const data = await res.json();
      if (data.success && data.routes.length > 0) {
        setRouteStations(data.routes);
      } else {
        // Initialize with 2 empty stations by default if none exist
        setRouteStations([
          { halt_order: 1, station_name: '', arrival_time: '12:00:00', departure_time: '12:00:00' },
          { halt_order: 2, station_name: '', arrival_time: '12:00:00', departure_time: '12:00:00' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
    }
  };

  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/trains', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('irctc_token')
        },
        body: JSON.stringify(trainData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Train Added Successfully!');
        setTrainData({ train_number: '', name: '', departure_time: '12:00:00', arrival_time: '12:00:00' });
        fetchTrains();
      } else {
        toast.error(data.message || 'Error adding train');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Ensure halt order is sequential
    const formattedRoutes = routeStations.map((r, idx) => ({
      ...r,
      halt_order: idx + 1
    }));

    try {
      const res = await fetch(`http://localhost:5000/api/trains/${selectedTrainId}/routes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('irctc_token')
        },
        body: JSON.stringify({ routes: formattedRoutes })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Train Route Saved Successfully!');
      } else {
        toast.error(data.message || 'Error saving route');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const addStationToRoute = () => {
    setRouteStations([
      ...routeStations,
      { halt_order: routeStations.length + 1, station_name: '', arrival_time: '12:00:00', departure_time: '12:00:00' }
    ]);
  };

  const removeStationFromRoute = (index) => {
    const newRoutes = [...routeStations];
    newRoutes.splice(index, 1);
    setRouteStations(newRoutes);
  };

  const updateRouteStation = (index, field, value) => {
    const newRoutes = [...routeStations];
    newRoutes[index][field] = value;
    setRouteStations(newRoutes);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
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

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--irctc-gray-100)' }}>
      {/* Sidebar */}
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
          
          <button onClick={() => setActiveTab('add_train')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'add_train' ? 'var(--irctc-blue-light)' + '20' : 'transparent', color: activeTab === 'add_train' ? 'var(--irctc-blue)' : 'var(--irctc-gray-600)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <ListPlus size={18} /> Add Train
          </button>

          <button onClick={() => setActiveTab('manage_routes')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'manage_routes' ? 'var(--irctc-blue-light)' + '20' : 'transparent', color: activeTab === 'manage_routes' ? 'var(--irctc-blue)' : 'var(--irctc-gray-600)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Map size={18} /> Manage Routes
          </button>
          
          <button onClick={() => setActiveTab('manage_users')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'manage_users' ? 'var(--irctc-blue-light)' + '20' : 'transparent', color: activeTab === 'manage_users' ? 'var(--irctc-blue)' : 'var(--irctc-gray-600)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Settings size={18} /> Manage Users
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
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Add New Train</h2>
                  <div style={{ fontSize: '13px', opacity: 0.8 }}>Create a new train in the system</div>
                </div>
              </div>

              <form onSubmit={handleTrainSubmit} style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Train Number *</label>
                    <input required name="train_number" value={trainData.train_number} onChange={e => setTrainData({...trainData, train_number: e.target.value})} placeholder="e.g. 12951"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Train Name *</label>
                    <input required name="name" value={trainData.name} onChange={e => setTrainData({...trainData, name: e.target.value})} placeholder="e.g. Mumbai Rajdhani"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Departure Time *</label>
                    <input required type="time" step="1" name="departure_time" value={trainData.departure_time} onChange={e => setTrainData({...trainData, departure_time: e.target.value})}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Arrival Time *</label>
                    <input required type="time" step="1" name="arrival_time" value={trainData.arrival_time} onChange={e => setTrainData({...trainData, arrival_time: e.target.value})}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button disabled={loading} type="submit" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: 'var(--irctc-orange)', color: 'white',
                    borderRadius: '8px', fontSize: '15px', fontWeight: 700,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}>
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Add Train'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage_routes' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--irctc-gray-800)', marginBottom: '24px' }}>Manage Train Routes & Stations</h2>
            
            <div style={{ marginBottom: '24px', background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--irctc-gray-200)' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: 'var(--irctc-gray-700)' }}>Select Train</label>
              <select 
                value={selectedTrainId} 
                onChange={(e) => {
                  setSelectedTrainId(e.target.value);
                  fetchTrainRoutes(e.target.value);
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)', background: 'white', fontSize: '15px' }}
              >
                <option value="">-- Select a train to map stations --</option>
                {trainsList.map(t => <option key={t.id} value={t.id}>{t.name} ({t.train_number})</option>)}
              </select>
            </div>

            {selectedTrainId && (
              <form onSubmit={handleRouteSubmit} style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid var(--irctc-gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--irctc-gray-800)', borderBottom: '1px solid var(--irctc-gray-200)', paddingBottom: '12px' }}>Route Stations</h3>
                
                {routeStations.map((station, index) => (
                  <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px', padding: '16px', background: 'var(--irctc-gray-50)', borderRadius: '8px', border: '1px solid var(--irctc-gray-200)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--irctc-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                      {index + 1}
                    </div>
                    
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '4px' }}>Station Name *</label>
                        <input required placeholder="e.g. New Delhi (NDLS)" value={station.station_name} onChange={(e) => updateRouteStation(index, 'station_name', e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '4px' }}>Arrival Time *</label>
                        <input required type="time" step="1" value={station.arrival_time} onChange={(e) => updateRouteStation(index, 'arrival_time', e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '4px' }}>Departure Time *</label>
                        <input required type="time" step="1" value={station.departure_time} onChange={(e) => updateRouteStation(index, 'departure_time', e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                      </div>
                    </div>
                    
                    <button type="button" onClick={() => removeStationFromRoute(index)} style={{ padding: '10px', background: 'transparent', color: 'var(--irctc-red)', border: 'none', cursor: 'pointer', opacity: routeStations.length > 2 ? 1 : 0.5 }} disabled={routeStations.length <= 2}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}

                <button type="button" onClick={addStationToRoute} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--irctc-gray-100)', color: 'var(--irctc-gray-700)', border: '2px dashed var(--irctc-gray-300)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center', marginTop: '10px', transition: 'all 0.2s' }}>
                  <Plus size={18} /> Add Next Station
                </button>

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--irctc-gray-200)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button disabled={loading} type="submit" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px', background: 'var(--irctc-blue)', color: 'white',
                    borderRadius: '8px', fontSize: '15px', fontWeight: 700,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  }}>
                    <Save size={18} />
                    {loading ? 'Saving Route...' : 'Save Entire Route'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'manage_users' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--irctc-gray-800)', marginBottom: '24px' }}>Manage Users</h2>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--irctc-gray-200)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--irctc-gray-100)', borderBottom: '2px solid var(--irctc-gray-200)' }}>
                  <tr>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>Name</th>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>Email</th>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>Role</th>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--irctc-gray-100)' }}>
                      <td style={{ padding: '16px', color: 'var(--irctc-gray-800)', fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '16px', color: 'var(--irctc-gray-600)' }}>{u.email}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                          background: u.role === 'ADMIN' ? '#fee2e2' : '#e0e7ff',
                          color: u.role === 'ADMIN' ? '#991b1b' : '#3730a3'
                        }}>
                          {u.role || 'PASSENGER'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {u.role !== 'ADMIN' && (
                          <button 
                            onClick={async () => {
                              if(window.confirm(`Promote ${u.name} to ADMIN?`)) {
                                try {
                                  const res = await fetch(`http://localhost:5000/api/auth/${u.id}/role`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('irctc_token') },
                                    body: JSON.stringify({ role: 'ADMIN' })
                                  });
                                  if (res.ok) {
                                    toast.success(`${u.name} is now an Admin!`);
                                    fetchUsers();
                                  } else {
                                    toast.error('Failed to promote user');
                                  }
                                } catch(e) { toast.error('Error promoting user'); }
                              }
                            }}
                            style={{ 
                              padding: '8px 12px', background: 'var(--irctc-blue)', color: 'white', 
                              border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 
                            }}>
                            Promote to Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usersList.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--irctc-gray-500)' }}>No users found.</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
