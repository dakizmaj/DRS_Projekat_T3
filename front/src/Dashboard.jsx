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

  const [activeView, setActiveView] = React.useState('dashboard');
  const [userState, setUserState] = React.useState(user);

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

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      professor: 'Profesor',
      student: 'Student'
    };
    return labels[role] || role;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', icon: '📊', label: 'Pregled' }
    ];

    if (userState.role === 'admin') {
      return [
        ...baseItems,
        { id: 'users', icon: '👥', label: 'Korisnici' },
        { id: 'courses', icon: '📚', label: 'Kursevi' }
      ];
    }

    if (userState.role === 'professor') {
      return [
        ...baseItems,
        { id: 'courses', icon: '📚', label: 'Moji kursevi' },
        { id: 'tasks', icon: '📝', label: 'Zadaci' }
      ];
    }

    if (userState.role === 'student') {
      return [
        ...baseItems,
        { id: 'tasks', icon: '📝', label: 'Moji zadaci' },
        { id: 'grades', icon: '📈', label: 'Ocene' }
      ];
    }

    return baseItems;
  };

  const renderContent = () => {
    if (activeView === 'profile') {
      return <ProfileEdit user={userState} onUpdate={setUserState} onClose={() => setActiveView('dashboard')} />;
    }

    if (userState.role === 'admin') {
      return <AdminUsers />;
    }

    if (userState.role === 'professor') {
      return <ProfessorDashboard user={userState} />;
    }

    if (userState.role === 'student') {
      return <StudentDashboard user={userState} />;
    }

    return null;
  };

  const getHeaderTitle = () => {
    if (activeView === 'profile') return 'Izmena profila';

    const titles = {
      admin: 'Admin Panel',
      professor: 'Panel profesora',
      student: 'Panel studenta'
    };
    return titles[userState.role] || 'Dashboard';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🎓</div>
            <span className="sidebar-logo-text">EduPlatforma</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Navigacija</div>
            {getNavItems().map(item => (
              <button
                key={item.id}
                className={`sidebar-link ${activeView === item.id ? 'active' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Nalog</div>
            {userState.role !== 'admin' && (
              <button
                className={`sidebar-link ${activeView === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveView('profile')}
              >
                <span className="sidebar-link-icon">⚙️</span>
                Podešavanja
              </button>
            )}
            <button className="sidebar-link" onClick={handleLogout}>
              <span className="sidebar-link-icon">🚪</span>
              Odjava
            </button>
          </div>
        </nav>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {userState.profile_image ? (
              <img
                src={`http://127.0.0.1:5000/users/profile_images/${userState.profile_image}`}
                alt="Avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.textContent = getInitials(userState.first_name, userState.last_name);
                }}
              />
            ) : (
              getInitials(userState.first_name, userState.last_name)
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userState.first_name} {userState.last_name}</div>
            <div className="sidebar-user-role">{getRoleLabel(userState.role)}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1 className="header-title">{getHeaderTitle()}</h1>
          <div className="header-actions">
            <span style={{
              padding: '0.5rem 1rem',
              background: 'var(--gray-800)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--gray-300)'
            }}>
              {new Date().toLocaleDateString('sr-RS', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
