import React, { useEffect, useState } from 'react';
import api from './api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '', 
    role: 'student',
    date_of_birth: '2000-01-01',
    gender: 'M'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/');
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
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/', form);
      setForm({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        password: '', 
        role: 'student',
        date_of_birth: '2000-01-01',
        gender: 'M'
      });
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
        <input placeholder="Ime" value={form.first_name} onChange={e=>setForm(f=>({...f, first_name:e.target.value}))} required />
        <input placeholder="Prezime" value={form.last_name} onChange={e=>setForm(f=>({...f, last_name:e.target.value}))} required />
        <input placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} required />
        <input placeholder="Lozinka" type="password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} required />
        <input placeholder="Datum rođenja" type="date" value={form.date_of_birth} onChange={e=>setForm(f=>({...f, date_of_birth:e.target.value}))} required />
        <select value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value}))}>
          <option value="admin">Admin</option>
          <option value="professor">Profesor</option>
          <option value="student">Student</option>
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
                <td>{u.first_name}</td>
                <td>{u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><button onClick={()=>handleDelete(u.id)}>Obriši</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
