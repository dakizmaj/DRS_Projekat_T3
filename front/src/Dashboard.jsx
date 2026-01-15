import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  if (!user) {
    // Ako nema usera, vrati na login
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    // Očisti state i vrati na login
    navigate('/', { replace: true });
  };

  return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: 40 }}>
      <h1>Dashboard</h1>
      <p>Dobrodošao, <b>{user.ime} {user.prezime}</b> ({user.uloga})</p>
      <button onClick={handleLogout} style={{marginBottom: 24, padding: '8px 24px', borderRadius: 8, border: 'none', background: '#444', color: 'white', cursor: 'pointer'}}>Logout</button>
      <pre style={{textAlign:'left', margin:'0 auto', maxWidth:400, background:'#222', padding:16, borderRadius:8}}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
