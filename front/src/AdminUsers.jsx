import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import api from './api';

export default function AdminUsers({ activeView = 'dashboard' }) {
  // Sinhronizuj interni tab sa spoljašnjim activeView
  const getInitialTab = () => {
    if (activeView === 'users') return 'users';
    if (activeView === 'courses') return 'courses';
    return 'users';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const socketRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Ažuriraj tab kada se promeni activeView
  useEffect(() => {
    if (activeView === 'users') setActiveTab('users');
    else if (activeView === 'courses') setActiveTab('courses');
  }, [activeView]);

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
    gender: 'M',
    country: '',
    street: '',
    street_number: ''
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
        gender: 'M',
        country: '',
        street: '',
        street_number: ''
      });
      setShowAddForm(false);
      fetchUsers();
    } catch (e) {
      setError('Greška pri dodavanju korisnika');
    }
  };

  const approveCourse = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/approve`);
      setNotification('Kurs je uspešno odobren!');
      setTimeout(() => setNotification(null), 3000);
      fetchPendingCourses();
    } catch (e) {
      setError('Greška pri odobravanju kursa');
    }
  };

  const rejectCourse = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/reject`);
      setNotification('Kurs je odbijen');
      setTimeout(() => setNotification(null), 3000);
      fetchPendingCourses();
    } catch (e) {
      setError('Greška pri odbijanju kursa');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', label: 'Admin' },
      professor: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Profesor' },
      student: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Student' }
    };
    const style = styles[role] || styles.student;
    return (
      <span style={{
        display: 'inline-flex',
        padding: '0.25rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        borderRadius: '100px',
        background: style.bg,
        color: style.color
      }}>
        {style.label}
      </span>
    );
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    professors: users.filter(u => u.role === 'professor').length,
    students: users.filter(u => u.role === 'student').length
  };

  // Za 'dashboard' view - samo statistika
  if (activeView === 'dashboard') {
    return (
      <div>
        {/* Notification Toast */}
        {notification && (
          <div className="notification-toast success">
            <span className="notification-toast-icon">🔔</span>
            <span className="notification-toast-message">{notification}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon blue">👥</div>
            </div>
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-label">Ukupno korisnika</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon purple">👑</div>
            </div>
            <div className="stat-card-value">{stats.admins}</div>
            <div className="stat-card-label">Administratora</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon blue">🎓</div>
            </div>
            <div className="stat-card-value">{stats.professors}</div>
            <div className="stat-card-label">Profesora</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon green">📚</div>
            </div>
            <div className="stat-card-value">{stats.students}</div>
            <div className="stat-card-label">Studenata</div>
          </div>
        </div>

        {/* Quick Overview */}
        <div style={{
          background: 'var(--gray-900)',
          border: '1px solid var(--gray-800)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--gray-100)' }}>Pregled</h3>
          <p style={{ color: 'var(--gray-500)', margin: 0 }}>
            Izaberite "Korisnici" ili "Kursevi" iz navigacije za upravljanje
          </p>
          {pendingCourses.length > 0 && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              color: '#f59e0b'
            }}>
              ⚠️ Imate {pendingCourses.length} zahtev(a) za odobrenje kurseva
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Notification Toast */}
      {notification && (
        <div className="notification-toast success">
          <span className="notification-toast-icon">🔔</span>
          <span className="notification-toast-message">{notification}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">👥</div>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Ukupno korisnika</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">👑</div>
          </div>
          <div className="stat-card-value">{stats.admins}</div>
          <div className="stat-card-label">Administratora</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">🎓</div>
          </div>
          <div className="stat-card-value">{stats.professors}</div>
          <div className="stat-card-label">Profesora</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">📚</div>
          </div>
          <div className="stat-card-value">{stats.students}</div>
          <div className="stat-card-label">Studenata</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--gray-800)',
        paddingBottom: '1rem'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'users' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'users' ? 'white' : 'var(--gray-400)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.9375rem',
            transition: 'all 0.2s ease'
          }}
        >
          👥 Korisnici
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'courses' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'courses' ? 'white' : 'var(--gray-400)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.9375rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          📋 Zahtevi za kurseve
          {pendingCourses.length > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              padding: '0.125rem 0.5rem',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {pendingCourses.length}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          color: '#ef4444',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="data-table-container">
          <div className="data-table-header">
            <h3 className="data-table-title">Upravljanje korisnicima</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              {showAddForm ? '✕ Zatvori' : '+ Dodaj korisnika'}
            </button>
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--gray-800)',
              background: 'var(--gray-800)'
            }}>
              <form onSubmit={handleAdd}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Ime
                    </label>
                    <input
                      placeholder="Unesite ime"
                      value={form.first_name}
                      onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Prezime
                    </label>
                    <input
                      placeholder="Unesite prezime"
                      value={form.last_name}
                      onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="email@primer.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Lozinka
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Datum rođenja
                    </label>
                    <input
                      type="date"
                      value={form.date_of_birth}
                      onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Pol
                    </label>
                    <select
                      value={form.gender}
                      onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                      required
                    >
                      <option value="M">Muški</option>
                      <option value="F">Ženski</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Država
                    </label>
                    <input
                      placeholder="Unesite državu"
                      value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Ulica
                    </label>
                    <input
                      placeholder="Unesite ulicu"
                      value={form.street}
                      onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Broj
                    </label>
                    <input
                      placeholder="Broj ulice"
                      value={form.street_number}
                      onChange={e => setForm(f => ({ ...f, street_number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                      Uloga
                    </label>
                    <select
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    >
                      <option value="admin">Administrator</option>
                      <option value="professor">Profesor</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary">
                    Sačuvaj korisnika
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    Otkaži
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              Učitavanje korisnika...
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h4 className="empty-state-title">Nema korisnika</h4>
              <p className="empty-state-text">Dodajte prvog korisnika klikom na dugme iznad</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Korisnik</th>
                  <th>Email</th>
                  <th>Uloga</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--gray-500)', fontFamily: 'monospace' }}>#{u.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--gray-100)' }}>
                            {u.first_name} {u.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-400)' }}>{u.email}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️ Obriši
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--gray-50)',
            marginBottom: '1.5rem'
          }}>
            Zahtevi za odobrenje kurseva
          </h3>

          {coursesLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              Učitavanje zahteva...
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="empty-state" style={{
              background: 'var(--gray-900)',
              borderRadius: '16px',
              border: '1px solid var(--gray-800)'
            }}>
              <div className="empty-state-icon">✅</div>
              <h4 className="empty-state-title">Sve je ažurirano</h4>
              <p className="empty-state-text">Nema zahteva za odobrenje kurseva</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingCourses.map(course => (
                <div key={course.id} style={{
                  background: 'var(--gray-900)',
                  border: '1px solid var(--gray-800)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem'
                        }}>
                          📚
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-50)' }}>
                            {course.name}
                          </h4>
                          <span style={{
                            display: 'inline-flex',
                            padding: '0.125rem 0.5rem',
                            fontSize: '0.6875rem',
                            fontWeight: '500',
                            borderRadius: '100px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                          }}>
                            Čeka odobrenje
                          </span>
                        </div>
                      </div>
                      <p style={{ color: 'var(--gray-400)', margin: '0 0 0.75rem 0', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                        {course.description}
                      </p>
                      <p style={{ color: 'var(--gray-500)', margin: 0, fontSize: '0.8125rem' }}>
                        Profesor ID: <span style={{ fontFamily: 'monospace', color: 'var(--gray-400)' }}>#{course.professor_id}</span>
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => approveCourse(course.id)}
                        className="btn btn-success"
                      >
                        ✅ Odobri
                      </button>
                      <button
                        onClick={() => rejectCourse(course.id)}
                        className="btn btn-danger"
                      >
                        ❌ Odbij
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
