import fs from 'fs';
import path from 'path';

const dashboardPath = 'C:\\Users\\kotav\\Downloads\\irctc-app_1\\irctc-app\\client\\src\\pages\\AdminDashboard.jsx';
let content = fs.readFileSync(dashboardPath, 'utf8');

// Imports
content = content.replace(
  "import { Train, AlertCircle, ArrowLeft, LayoutDashboard, Settings, Plus, Save, Map, Trash2, ListPlus } from 'lucide-react';",
  "import { Train, AlertCircle, ArrowLeft, LayoutDashboard, Settings, Plus, Save, Map, Trash2, ListPlus, Eye, X } from 'lucide-react';"
);

// State vars
content = content.replace(
  "    arrival_time: '12:00:00'\n  });",
  `    arrival_time: '12:00:00',
    running_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    coaches_json: []
  });

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDayToggle = (day) => {
    let currentDays = trainData.running_days ? trainData.running_days.split(',') : [];
    if (currentDays.includes(day)) {
      currentDays = currentDays.filter(d => d !== day);
    } else {
      currentDays.push(day);
    }
    setTrainData({ ...trainData, running_days: currentDays.join(',') });
  };

  const addCoach = () => {
    setTrainData({
      ...trainData,
      coaches_json: [...(trainData.coaches_json || []), { type: 'Sleeper', count: 1, seatsPerCoach: 72, price: 500 }]
    });
  };

  const removeCoach = (idx) => {
    const newCoaches = [...trainData.coaches_json];
    newCoaches.splice(idx, 1);
    setTrainData({ ...trainData, coaches_json: newCoaches });
  };

  const updateCoach = (idx, field, val) => {
    const newCoaches = [...trainData.coaches_json];
    newCoaches[idx][field] = val;
    setTrainData({ ...trainData, coaches_json: newCoaches });
  };
  
  const [viewCoachesModal, setViewCoachesModal] = useState(null);
  
  const deleteTrain = async (id) => {
    if (!window.confirm("Are you sure you want to delete this train?")) return;
    try {
      const res = await fetch(\`http://localhost:5000/api/trains/\${id}\`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('irctc_token') }
      });
      if (res.ok) {
        toast.success("Train deleted successfully");
        fetchTrains();
      }
    } catch(err) {
      toast.error("Failed to delete train");
    }
  };
`
);

// Form reset
content = content.replace(
  "setTrainData({ train_number: '', name: '', departure_time: '12:00:00', arrival_time: '12:00:00' });",
  "setTrainData({ train_number: '', name: '', departure_time: '12:00:00', arrival_time: '12:00:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', coaches_json: [] });"
);

// Overview replace
const overviewOld = `            <div style={{ marginTop: '40px', padding: '60px 40px', background: 'white', borderRadius: '12px', textAlign: 'center', border: '1px dashed var(--irctc-gray-300)' }}>
              <Train size={48} color="var(--irctc-gray-300)" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--irctc-gray-600)' }}>Welcome to the IRCTC Admin Panel</div>
              <div style={{ fontSize: '15px', color: 'var(--irctc-gray-400)', marginTop: '8px' }}>Select an option from the sidebar to manage the system.</div>
            </div>`;

const overviewNew = `            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--irctc-gray-800)', marginBottom: '16px' }}>Active Trains List</h3>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--irctc-gray-200)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--irctc-gray-100)', borderBottom: '2px solid var(--irctc-gray-200)' }}>
                    <tr>
                      <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>No.</th>
                      <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>Name</th>
                      <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>Timing</th>
                      <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>Days</th>
                      <th style={{ padding: '16px', fontWeight: 600, color: 'var(--irctc-gray-700)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainsList.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--irctc-gray-100)' }}>
                        <td style={{ padding: '16px', fontWeight: 700, color: 'var(--irctc-gray-800)' }}>{t.train_number}</td>
                        <td style={{ padding: '16px', color: 'var(--irctc-gray-700)' }}>{t.name}</td>
                        <td style={{ padding: '16px', color: 'var(--irctc-gray-600)', fontSize: '14px' }}>
                          <div>Dep: {t.departure_time}</div>
                          <div>Arr: {t.arrival_time}</div>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--irctc-gray-600)', fontSize: '13px', maxWidth: '150px' }}>{t.running_days || 'All'}</td>
                        <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                          <button onClick={() => setViewCoachesModal(t)} style={{ padding: '6px 10px', background: 'var(--irctc-blue-light)20', color: 'var(--irctc-blue)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                            <Eye size={16} /> Coaches
                          </button>
                          <button onClick={() => deleteTrain(t.id)} style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trainsList.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--irctc-gray-500)' }}>No trains found. Add one!</div>}
              </div>
            </div>`;
content = content.replace(overviewOld, overviewNew);

// Add modal outside main div
const modalString = `
      {viewCoachesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--irctc-gray-800)' }}>Coaches: {viewCoachesModal.train_number}</h3>
              <button onClick={() => setViewCoachesModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--irctc-gray-500)' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(!viewCoachesModal.coaches_json || viewCoachesModal.coaches_json.length === 0) ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--irctc-gray-500)', background: 'var(--irctc-gray-50)', borderRadius: '8px' }}>No coach details specified for this train.</div>
              ) : (
                viewCoachesModal.coaches_json.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--irctc-gray-50)', borderRadius: '8px', border: '1px solid var(--irctc-gray-200)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--irctc-blue)', fontSize: '16px' }}>{c.type} Class</div>
                      <div style={{ fontSize: '13px', color: 'var(--irctc-gray-600)', marginTop: '4px' }}>{c.count} Coaches × {c.seatsPerCoach} Seats = {parseInt(c.count) * parseInt(c.seatsPerCoach)} Total Seats</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--irctc-gray-800)', fontSize: '18px' }}>₹{c.price}</div>
                      <div style={{ fontSize: '12px', color: 'var(--irctc-gray-500)' }}>Base Price</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("    </div>\n  );\n}", modalString + "    </div>\n  );\n}");

// Add train extra fields
const addTrainFormFieldsNew = `
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--irctc-gray-600)', marginBottom: '10px' }}>Running Days *</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {DAYS.map(day => {
                      const isActive = (trainData.running_days || '').includes(day);
                      return (
                        <button type="button" key={day} onClick={() => handleDayToggle(day)} style={{
                          padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid',
                          background: isActive ? 'var(--irctc-blue)' : 'white',
                          color: isActive ? 'white' : 'var(--irctc-gray-600)',
                          borderColor: isActive ? 'var(--irctc-blue)' : 'var(--irctc-gray-300)'
                        }}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: 'var(--irctc-gray-800)' }}>Coach Configuration</label>
                    <button type="button" onClick={addCoach} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'var(--irctc-gray-100)', color: 'var(--irctc-gray-800)', border: '1px solid var(--irctc-gray-300)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      <Plus size={14} /> Add Coach Type
                    </button>
                  </div>
                  
                  {trainData.coaches_json && trainData.coaches_json.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {trainData.coaches_json.map((coach, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end', background: 'var(--irctc-gray-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--irctc-gray-200)' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '4px' }}>Type</label>
                            <select value={coach.type} onChange={e => updateCoach(idx, 'type', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }}>
                              <option value="General">General (GN)</option>
                              <option value="Sleeper">Sleeper (SL)</option>
                              <option value="AC3">3 Tier AC (3A)</option>
                              <option value="AC2">2 Tier AC (2A)</option>
                              <option value="AC1">1st Class AC (1A)</option>
                              <option value="ChairCar">Chair Car (CC)</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '4px' }}>Count</label>
                            <input type="number" value={coach.count} onChange={e => updateCoach(idx, 'count', e.target.value)} min="1" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '4px' }}>Seats/Coach</label>
                            <input type="number" value={coach.seatsPerCoach} onChange={e => updateCoach(idx, 'seatsPerCoach', e.target.value)} min="1" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--irctc-gray-500)', marginBottom: '4px' }}>Price (₹)</label>
                            <input type="number" value={coach.price} onChange={e => updateCoach(idx, 'price', e.target.value)} min="0" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--irctc-gray-300)' }} />
                          </div>
                          <button type="button" onClick={() => removeCoach(idx)} style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', height: '35px' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'var(--irctc-gray-50)', border: '1px dashed var(--irctc-gray-300)', borderRadius: '8px', color: 'var(--irctc-gray-500)' }}>
                      No coaches added yet. Click "Add Coach Type" to add coaches.
                    </div>
                  )}
                </div>
`;

content = content.replace("                </div>\n\n                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>", "                </div>\n" + addTrainFormFieldsNew + "\n                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>");

fs.writeFileSync(dashboardPath, content);
console.log("AdminDashboard updated successfully");
