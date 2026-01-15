import React, { useState } from 'react';
import axios from 'axios';

export default function ProfileEdit({ user, onUpdate }) {
  const [form, setForm] = useState({ ...user });
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const session_id = localStorage.getItem('session_id');
      let profile_image = form.profile_image;
      if (file) {
        const data = new FormData();
        data.append('file', file);
        const res = await axios.post(`http://127.0.0.1:5000/users/${user.id}/upload`, data, {
          headers: { 'X-Session-Id': session_id, 'Content-Type': 'multipart/form-data' }
        });
        profile_image = res.data.profile_image;
      }
      const res = await axios.put(`http://127.0.0.1:5000/users/${user.id}`, { ...form, profile_image }, {
        headers: { 'X-Session-Id': session_id }
      });
      setMessage('Profil ažuriran!');
      onUpdate && onUpdate(res.data.user);
    } catch (e) {
      setMessage('Greška pri ažuriranju profila');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{margin:'24px auto', maxWidth:400, background:'#222', padding:16, borderRadius:8, color:'white'}}>
      <h2>Izmeni profil</h2>
      <input name="ime" value={form.ime} onChange={handleChange} placeholder="Ime" required />
      <input name="prezime" value={form.prezime} onChange={handleChange} placeholder="Prezime" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="datum_rodjenja" value={form.datum_rodjenja||''} onChange={handleChange} placeholder="Datum rođenja" />
      <input name="pol" value={form.pol||''} onChange={handleChange} placeholder="Pol" />
      <input name="drzava" value={form.drzava||''} onChange={handleChange} placeholder="Država" />
      <input name="ulica" value={form.ulica||''} onChange={handleChange} placeholder="Ulica" />
      <input name="broj" value={form.broj||''} onChange={handleChange} placeholder="Broj" />
      <div style={{margin:'8px 0'}}>
        <label>Slika profila: </label>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      </div>
      <button type="submit">Sačuvaj izmene</button>
      {message && <p>{message}</p>}
    </form>
  );
}
