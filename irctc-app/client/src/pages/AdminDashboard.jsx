import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Train, Plus, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    general: { totalSeats: 0, price: 0 },
    ac3: { totalSeats: 0, price: 0 },
    ac2: { totalSeats: 0, price: 0 },
    ac1: { totalSeats: 0, price: 0 },
  });

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
      // Build the final classes object mapping totalSeats to availableSeats as well
      const payloadClasses = {
        general: {
          totalSeats: classesData.general.totalSeats,
          availableSeats: classesData.general.totalSeats, // Initially all seats are available
          price: classesData.general.price
        },
        ac3: {
          totalSeats: classesData.ac3.totalSeats,
          availableSeats: classesData.ac3.totalSeats,
          price: classesData.ac3.price
        },
        ac2: {
          totalSeats: classesData.ac2.totalSeats,
          availableSeats: classesData.ac2.totalSeats,
          price: classesData.ac2.price
        },
        ac1: {
          totalSeats: classesData.ac1.totalSeats,
          availableSeats: classesData.ac1.totalSeats,
          price: classesData.ac1.price
        }
      };

      const payload = {
        ...trainData,
        classes: payloadClasses
      };

      const res = await API.post('/trains/add', payload);
      if (res.data.success) {
        toast.success(`Train ${trainData.trainName} added successfully!`);
        // Reset form
        setTrainData({
          trainNumber: '', trainName: '', from: '', to: '', departureTime: '', arrivalTime: ''
        });
        setClassesData({
          general: { totalSeats: 0, price: 0 },
          ac3: { totalSeats: 0, price: 0 },
          ac2: { totalSeats: 0, price: 0 },
          ac1: { totalSeats: 0, price: 0 },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add train');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--irctc-gray-100)', padding: '32px 16px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', color: 'var(--irctc-blue)',
          fontSize: '14px', fontWeight: 600, marginBottom: '20px', cursor: 'pointer',
        }}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ padding: '24px', background: 'var(--irctc-blue)', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Train size={28} />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Admin Dashboard</h2>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Add New Train</div>
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
                <input required type="time" name="departureTime" value={trainData.departureTime} onChange={handleBasicChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '6px' }}>Arrival Time *</label>
                <input required type="time" name="arrivalTime" value={trainData.arrivalTime} onChange={handleBasicChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--irctc-gray-300)' }} />
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--irctc-gray-800)', marginBottom: '16px', borderBottom: '1px solid var(--irctc-gray-200)', paddingBottom: '8px' }}>
              Class Capacities & Pricing
            </h3>
            
            <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
              {['general', 'ac3', 'ac2', 'ac1'].map((cls) => (
                <div key={cls} style={{ background: 'var(--irctc-gray-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--irctc-gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--irctc-blue)', marginBottom: '12px' }}>
                    {cls === 'general' ? 'General' : cls.toUpperCase()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '4px' }}>Total Seats</label>
                      <input type="number" min="0" required value={classesData[cls].totalSeats} onChange={(e) => handleClassChange(cls, 'totalSeats', e.target.value)}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button disabled={loading} type="submit" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', background: 'var(--irctc-orange)', color: 'white',
                borderRadius: '8px', fontSize: '15px', fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                <Save size={18} />
                {loading ? 'Saving Train...' : 'Add Train to System'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
