import React, { useState } from 'react';
import api from './api';

export default function ProfileEdit({ user, onUpdate, onClose }) {
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    date_of_birth: user.date_of_birth || '',
    gender: user.gender || '',
    country: user.country || '',
    street: user.street || '',
    street_number: user.street_number || ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    try {
      let profile_image = user.profile_image;

      if (file) {
        const data = new FormData();
        data.append('file', file);
        const res = await api.post(`/users/${user.id}/upload`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        profile_image = res.data.profile_image;
      }

      const res = await api.put('/users/me', { ...form, profile_image });
      setMessage('Profil uspešno ažuriran!');
      onUpdate && onUpdate(res.data.user);
    } catch (e) {
      setMessage('Greška: ' + (e.response?.data?.error || e.message));
    }
    setIsLoading(false);
  };

  const getInitials = () => {
    return `${form.first_name?.[0] || ''}${form.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <div style={{
      background: 'var(--gray-900)',
      border: '1px solid var(--gray-800)',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--gray-800)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-50)' }}>
          Podešavanja profila
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--gray-800)',
              color: 'var(--gray-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              padding: 0
            }}
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ padding: '1.5rem' }}>
          {/* Profile Picture Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'var(--gray-800)',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {user.profile_image ? (
                <img
                  src={`http://127.0.0.1:5000/users/profile_images/${user.profile_image}`}
                  alt="Profilna"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = getInitials(); }}
                />
              ) : (
                getInitials()
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--gray-100)', marginBottom: '0.25rem' }}>
                  Profilna slika
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                  JPG, PNG ili GIF. Max 2MB.
                </div>
              </div>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--gray-700)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--gray-200)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                📷 Izaberi sliku
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
              {file && (
                <span style={{
                  marginLeft: '0.75rem',
                  fontSize: '0.8125rem',
                  color: '#10b981'
                }}>
                  ✓ {file.name}
                </span>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                Ime
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Unesite ime"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                Prezime
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Unesite prezime"
                required
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                Email adresa
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@primer.com"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                Datum rođenja
              </label>
              <input
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                Pol
              </label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Izaberite pol</option>
                <option value="M">Muški</option>
                <option value="F">Ženski</option>
              </select>
            </div>
          </div>

          {/* Address Section */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--gray-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Adresa
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                  Država
                </label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Srbija"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                  Ulica
                </label>
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="Naziv ulice"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                  Broj
                </label>
                <input
                  name="street_number"
                  value={form.street_number}
                  onChange={handleChange}
                  placeholder="1A"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '10px',
              background: message.includes('Greška') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${message.includes('Greška') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
              color: message.includes('Greška') ? '#ef4444' : '#10b981',
              fontSize: '0.9375rem'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--gray-800)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          background: 'var(--gray-800)'
        }}>
          {onClose && (
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Otkaži
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </button>
        </div>
      </form>
    </div>
  );
}
