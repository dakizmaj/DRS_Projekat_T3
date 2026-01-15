import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminUsers from './AdminUsers';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  if (!user) {
    // Ako nema usera, vrati na login
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    const session_id = localStorage.getItem('session_id');
    if (session_id) {
      try {
        await axios.post('http://127.0.0.1:5000/auth/logout', { session_id });
      } catch (e) {}
      localStorage.removeItem('session_id');
    }
    navigate('/', { replace: true });
  };

  return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: 40 }}>
      <h1>Dashboard</h1>
      <p>Dobrodošao, <b>{user.ime} {user.prezime}</b> ({user.uloga})</p>
      {user.uloga === 'ADMIN' && <AdminUsers />}
      <pre style={{textAlign:'left', margin:'0 auto', maxWidth:400, background:'#222', padding:16, borderRadius:8}}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
