import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import api from './api';

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('users');
  const socketRef = useRef(null);
  const [notification, setNotification] = useState(null);

  // Users
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

  // Courses
  const [pendingCourses, setPendingCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // WebSocket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000/admin', {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected to /admin namespace');
    });

    socketRef.current.on('new_course_request', (data) => {
      console.log('New course request:', data);
      setNotification(`Novi zahtev za kurs: ${data.course_name}`);
      fetchPendingCourses();
      setTimeout(() => setNotification(null), 5000);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPendingCourses();
  }, []);

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

  const fetchPendingCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await api.get('/courses/pending');
      setPendingCourses(res.data);
    } catch (e) {
      console.error('Greška pri učitavanju kurseva:', e);
    }
    setCoursesLoading(false);
  };

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

  const approveCourse = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/approve`);
      alert('Kurs odobren!');
      fetchPendingCourses();
    } catch (e) {
      alert('Greška pri odobravanju kursa');
    }
  };

  const rejectCourse = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/reject`);
      alert('Kurs odbijen!');
      fetchPendingCourses();
    } catch (e) {
      alert('Greška pri odbijanju kursa');
    }
  };

  return (
    <div style={{marginTop: 40}}>
      <h2 style={{color:'white'}}>Admin Panel</h2>

      {/* WebSocket Notification */}
      {notification && (
        <div style={{
          background: '#28a745',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 8,
          marginBottom: 20,
          animation: 'fadeIn 0.3s'
        }}>
          {notification}
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button 
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'users' ? '#007bff' : '#444',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Korisnici
        </button>
        <button 
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'courses' ? '#007bff' : '#444',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Pending Kursevi ({pendingCourses.length})
        </button>
      </div>

      {error && <p style={{color:'red'}}>{error}</p>}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
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
        </>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          <h3 style={{color:'white'}}>Zahtevi za nove kurseve</h3>
          {coursesLoading ? <p style={{color:'white'}}>Učitavanje...</p> : (
            pendingCourses.length === 0 ? (
              <p style={{color:'#aaa'}}>Nema pending zahteva</p>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:16}}>
                {pendingCourses.map(course => (
                  <div key={course.id} style={{background:'#222', padding:16, borderRadius:8}}>
                    <h4 style={{color:'white', marginTop:0}}>{course.name}</h4>
                    <p style={{color:'#aaa'}}>{course.description}</p>
                    <p style={{color:'#aaa', fontSize:12}}>Profesor ID: {course.professor_id}</p>
                    <div style={{display:'flex', gap:10, marginTop:12}}>
                      <button 
                        onClick={() => approveCourse(course.id)}
                        style={{
                          padding:'8px 16px', 
                          background:'#28a745', 
                          color:'white', 
                          border:'none', 
                          borderRadius:4, 
                          cursor:'pointer'
                        }}
                      >
                        ✅ Odobri
                      </button>
                      <button 
                        onClick={() => rejectCourse(course.id)}
                        style={{
                          padding:'8px 16px', 
                          background:'#dc3545', 
                          color:'white', 
                          border:'none', 
                          borderRadius:4, 
                          cursor:'pointer'
                        }}
                      >
                        ❌ Odbij
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
