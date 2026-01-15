import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/login', { email, password })
      setMessage('Login uspešan: ' + JSON.stringify(response.data))
      // Preusmeri na dashboard i prosledi user podatke
      navigate('/dashboard', { state: { user: response.data.user } })
    } catch (error) {
      setMessage('Greška: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="App">
      <h1>Prijava na platformu</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Prijavi se</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default App
