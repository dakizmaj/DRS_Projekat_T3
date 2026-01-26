import { useState } from 'react'
import api from './api'
import { useNavigate } from 'react-router-dom';
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    try {
      const response = await api.post('/auth/login', { email, password })
      setMessage('Login uspešan!')
      localStorage.setItem('session_id', response.data.session_id)
      navigate('/dashboard', { state: { user: response.data.user } })
    } catch (error) {
      setMessage('Greška: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left Side - Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Platforma aktivna
          </div>

          <h1 className="hero-title">
            Platforma za <span>učenje</span>
          </h1>

          <p className="hero-description">
            Moderna platforma za upravljanje kursevima, zadacima i komunikaciju
            između profesora i studenata.
          </p>

          <div className="hero-features">
            <div className="hero-feature">
              <div className="hero-feature-icon">📚</div>
              <span>Upravljanje kursevima i materijalima</span>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon">📝</div>
              <span>Predaja i ocenjivanje zadataka</span>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon">🔔</div>
              <span>Real-time notifikacije</span>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon">📊</div>
              <span>Praćenje napretka studenata</span>
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="hero-floating hero-floating-1"></div>
        <div className="hero-floating hero-floating-2"></div>
        <div className="hero-floating hero-floating-3"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-section">
        <div className="login-container">
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-icon">🎓</div>
              <span className="login-logo-text">EduPlatforma</span>
            </div>
            <h2 className="login-title">Dobrodošli nazad</h2>
            <p className="login-subtitle">Prijavite se na svoj nalog</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Email adresa</label>
              <input
                type="email"
                className="form-input"
                placeholder="vase.ime@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lozinka</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
            </button>

            {message && (
              <div className={`login-message ${message.includes('Greška') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              © 2024 EduPlatforma. Sva prava zadržana.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
