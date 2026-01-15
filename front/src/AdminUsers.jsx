import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ime: '', prezime: '', email: '', password: '', uloga: 'STUDENT' });

  const session_id = localStorage.getItem('session_id');
  const axiosConfig = { headers: { 'X-Session-Id': session_id } };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/users/', axiosConfig);
      setUsers(res.data);
      setError('');
    } catch (e) {
      setError('Greška pri učitavanju korisnika');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati korisnika?')) return;
    await axios.delete(`http://127.0.0.1:5000/users/${id}`, axiosConfig);
    fetchUsers();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/users/', form, axiosConfig);
      setForm({ ime: '', prezime: '', email: '', password: '', uloga: 'STUDENT' });
      fetchUsers();
    } catch (e) {
      setError('Greška pri dodavanju korisnika');
    }
  };

  return (
    <div style={{marginTop: 40}}>
      <h2 style={{color:'white'}}>Korisnici</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      <form onSubmit={handleAdd} style={{marginBottom: 24}}>
        <input placeholder="Ime" value={form.ime} onChange={e=>setForm(f=>({...f, ime:e.target.value}))} required />
        <input placeholder="Prezime" value={form.prezime} onChange={e=>setForm(f=>({...f, prezime:e.target.value}))} required />
        <input placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} required />
        <input placeholder="Lozinka" type="password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} required />
        <select value={form.uloga} onChange={e=>setForm(f=>({...f, uloga:e.target.value}))}>
          <option value="ADMIN">ADMIN</option>
          <option value="PROFESOR">PROFESOR</option>
          <option value="STUDENT">STUDENT</option>
        </select>
        <button type="submit">Dodaj korisnika</button>
      </form>
      {loading ? <p style={{color:'white'}}>Učitavanje...</p> : (
        <table style={{margin:'0 auto', background:'#222', color:'white', borderRadius:8, padding:8}}>
          <thead>
            <tr><th>ID</th><th>Ime</th><th>Prezime</th><th>Email</th><th>Uloga</th><th>Akcija</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.ime}</td>
                <td>{u.prezime}</td>
                <td>{u.email}</td>
                <td>{u.uloga}</td>
                <td><button onClick={()=>handleDelete(u.id)}>Obriši</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
