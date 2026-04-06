import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import { MapPin, Plus, Trash2, Home, Briefcase } from 'lucide-react';

const AddressesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'Home', name: '', mobile: '', pincode: '', locality: '',
    address: '', city: '', state: '', landmark: '',
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  const fetchPincode = async (pin) => {
    if (pin.length !== 6) return;
    setPincodeLoading(true);
    setPincodeError('');
    try {
      // Primary: India Post API
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: AbortSignal.timeout(5000) });
      const text = await res.text();
      // Sometimes the API returns HTML on errors — guard against that
      const data = JSON.parse(text);
      if (data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setForm(f => ({ ...f, city: po.District || po.Block || po.Name, state: po.State }));
        setPincodeLoading(false);
        return;
      }
    } catch { /* fall through to backup */ }

    // Backup: OpenStreetMap Nominatim
    try {
      const r2 = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&addressdetails=1&limit=1`,
        { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(6000) }
      );
      const d2 = await r2.json();
      if (d2.length > 0) {
        const a = d2[0].address;
        const city = a.city || a.town || a.county || a.state_district || '';
        const state = a.state || '';
        setForm(f => ({ ...f, city, state }));
      } else {
        setPincodeError('Pincode not found. Please fill manually.');
      }
    } catch {
      setPincodeError('Could not auto-detect. Please fill City & State manually.');
    } finally {
      setPincodeLoading(false);
    }
  };

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    setAddresses(prev => [...prev, { ...form, id: Date.now() }]);
    setShowForm(false);
    setForm({ type: 'Home', name: '', mobile: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '' });
  };

  const handleDelete = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.875rem',
    border: '1px solid #ddd', borderRadius: '3px', outline: 'none',
    color: '#212121', background: '#fff',
  };

  const labelStyle = { display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#666', fontWeight: 500 };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
          <ProfileSidebar />

          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Billing Address</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '0.4rem 0.9rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
              >
                <Plus size={15} /> Add New Address
              </button>
            </div>

            {/* Add Address Form */}
            {showForm && (
              <form onSubmit={handleAdd} style={{ marginBottom: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem', background: '#f9f9f9' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: '#333' }}>New Address</h3>

                {/* Address Type */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                  {['Home', 'Work', 'Other'].map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                        border: form.type === t ? '2px solid var(--primary)' : '1px solid #ccc',
                        background: form.type === t ? '#e8f0fe' : '#fff',
                        color: form.type === t ? 'var(--primary)' : '#555',
                      }}
                    >
                      {t === 'Home' ? <Home size={13} /> : t === 'Work' ? <Briefcase size={13} /> : <MapPin size={13} />}
                      {t}
                    </button>
                  ))}
                </div>

                <div className="mobile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input style={inputStyle} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter full name" />
                  </div>
                  <div>
                    <label style={labelStyle}>Mobile Number *</label>
                    <input style={inputStyle} required type="tel" maxLength={10} value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="10-digit mobile number" />
                  </div>
                  <div>
                    <label style={labelStyle}>Pincode *</label>
                    <input style={inputStyle} required maxLength={6} value={form.pincode}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g,'').slice(0,6);
                        setForm(f => ({ ...f, pincode: v }));
                        setPincodeError('');
                        if (v.length === 6) fetchPincode(v);
                      }}
                      placeholder="6-digit pincode" />
                    {pincodeLoading && <span style={{ fontSize: '0.72rem', color: '#666' }}>🔍 Fetching location…</span>}
                    {pincodeError && <span style={{ fontSize: '0.72rem', color: '#d32f2f' }}>{pincodeError}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Locality</label>
                    <input style={inputStyle} value={form.locality} onChange={e => setForm(f => ({ ...f, locality: e.target.value }))} placeholder="Locality / Area / Street" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Address (House No, Building, Street) *</label>
                    <textarea
                      required rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="House No, Building, Street, Area"
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>City / District *</label>
                    <input style={{ ...inputStyle, background: pincodeLoading ? '#fafafa' : '#fff' }} required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder={pincodeLoading ? 'Auto-filling…' : 'City'} />
                  </div>
                  <div>
                    <label style={labelStyle}>State *</label>
                    <input
                      style={{ ...inputStyle, background: pincodeLoading ? '#fafafa' : '#fff' }}
                      required
                      value={form.state}
                      onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                      placeholder={pincodeLoading ? 'Auto-filling…' : 'State (auto-filled or type manually)'}
                      list="states-list"
                    />
                    <datalist id="states-list">
                      {['Andhra Pradesh','Assam','Bihar','Delhi','Gujarat','Haryana','Karnataka','Kerala','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Madhya Pradesh','Jharkhand','Chhattisgarh','Uttarakhand','Himachal Pradesh','Goa','Tripura','Meghalaya','Manipur','Nagaland','Mizoram','Arunachal Pradesh','Sikkim'].map(s =>
                        <option key={s} value={s} />
                      )}
                    </datalist>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Landmark (Optional)</label>
                    <input style={inputStyle} value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} placeholder="Nearby landmark" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.5rem', fontSize: '0.875rem' }}>Save Address</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem', background: 'none', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', color: '#555' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 && !showForm ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#878787' }}>
                <MapPin size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.9rem' }}>No saved addresses yet.</p>
                <p style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>Click "Add New Address" to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.25rem', position: 'relative' }}>
                    <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, background: '#f0f4ff', color: 'var(--primary)', padding: '2px 10px', borderRadius: '12px', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
                      {addr.type}
                    </span>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{addr.name} <span style={{ fontWeight: 400, color: '#666', fontSize: '0.85rem' }}>{addr.mobile}</span></p>
                    <p style={{ fontSize: '0.875rem', color: '#444', lineHeight: 1.5 }}>
                      {addr.address}{addr.locality ? ', ' + addr.locality : ''}, {addr.city}, {addr.state} — {addr.pincode}
                      {addr.landmark ? <><br /><span style={{ color: '#888' }}>Landmark: {addr.landmark}</span></> : null}
                    </p>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddressesPage;
