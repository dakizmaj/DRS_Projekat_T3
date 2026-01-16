import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor koji dodaje session_id u header
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    config.headers.Authorization = sessionId;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
