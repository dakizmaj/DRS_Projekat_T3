import React, { useState } from 'react';
import api from './api';

export default function ProfileEdit({ user, onUpdate }) {
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
  const [file, setFile] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('Učitavanje...');
    try {
      let profile_image = user.profile_image;
      
      // Upload slike ako je izabrana
      if (file) {
        const data = new FormData();
        data.append('file', file);
        const res = await api.post(`/users/${user.id}/upload`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        profile_image = res.data.profile_image;
        console.log('Uploaded image:', profile_image);
      }
      
      // Update profila
      const res = await api.put('/users/me', { ...form, profile_image });
      setMessage('Profil ažuriran! Refresh stranicu.');
      console.log('Updated user:', res.data.user);
      onUpdate && onUpdate(res.data.user);
    } catch (e) {
      setMessage('Greška pri ažuriranju profila: ' + (e.response?.data?.error || e.message));
      console.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{margin:'24px auto', maxWidth:400, background:'#222', padding:16, borderRadius:8, color:'white'}}>
      <h2>Izmeni profil</h2>
      
      {user.profile_image && (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <img 
            src={`http://127.0.0.1:5000/users/profile_images/${user.profile_image}`} 
            alt="Trenutna profilna slika" 
            style={{ maxWidth: 120, borderRadius: '50%', border: '2px solid #444' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>Trenutna slika</p>
        </div>
      )}
      
      <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Ime" required />
      <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Prezime" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} placeholder="Datum rođenja" />
      <select name="gender" value={form.gender} onChange={handleChange}>
        <option value="">Izaberi pol</option>
        <option value="M">Muški</option>
        <option value="F">Ženski</option>
      </select>
      <input name="country" value={form.country} onChange={handleChange} placeholder="Država" />
      <input name="street" value={form.street} onChange={handleChange} placeholder="Ulica" />
      <input name="street_number" value={form.street_number} onChange={handleChange} placeholder="Broj" />
      <div style={{margin:'8px 0'}}>
        <label>Nova slika profila: </label>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
        {file && <p style={{ fontSize: 12, color: '#28a745', marginTop: 4 }}>✓ Izabrano: {file.name}</p>}
      </div>
      <button type="submit">Sačuvaj izmene</button>
      {message && <p style={{ color: message.includes('Greška') ? '#dc3545' : '#28a745' }}>{message}</p>}
    </form>
  );
}
