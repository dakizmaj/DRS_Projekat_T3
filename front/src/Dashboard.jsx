import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from './api';
import AdminUsers from './AdminUsers';
import ProfileEdit from './ProfileEdit';
import ProfessorDashboard from './ProfessorDashboard';
import StudentDashboard from './StudentDashboard';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [showEdit, setShowEdit] = React.useState(false);
  const [userState, setUserState] = React.useState(user);

  // Učitaj fresh user podatke sa servera
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUserState(res.data.user);
      } catch (e) {
        console.error('Failed to fetch user:', e);
        navigate('/', { replace: true });
      }
    };
    
    if (localStorage.getItem('session_id')) {
      fetchUser();
    } else if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('session_id');
    navigate('/', { replace: true });
  };

  return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: 40 }}>
      <h1>Dashboard</h1>
      <p>Dobrodošao, <b>{userState.first_name} {userState.last_name}</b> ({userState.role})</p>
      <button onClick={handleLogout} style={{marginBottom: 24, padding: '8px 24px', borderRadius: 8, border: 'none', background: '#444', color: 'white', cursor: 'pointer'}}>Logout</button>
      {userState.role !== 'admin' && <button onClick={()=>setShowEdit(v=>!v)} style={{marginLeft:16}}>Izmeni profil</button>}
      {showEdit && <ProfileEdit user={userState} onUpdate={setUserState} />}
      
      {userState.role === 'admin' && <AdminUsers />}
      {userState.role === 'professor' && <ProfessorDashboard user={userState} />}
      {userState.role === 'student' && <StudentDashboard user={userState} />}
      
      {userState.profile_image && (
        <img src={`http://127.0.0.1:5000/users/profile_images/${userState.profile_image}`} alt="Profilna slika" style={{maxWidth:120, borderRadius:'50%', margin:'16px auto'}} />
      )}
      <pre style={{textAlign:'left', margin:'0 auto', maxWidth:400, background:'#222', padding:16, borderRadius:8}}>
        {JSON.stringify(userState, null, 2)}
      </pre>
    </div>
  );
}
