import axios from 'axios';

// In production, VITE_API_URL points to the Render backend (e.g. https://digihub-api.onrender.com)
// In development, it's empty so the Vite proxy handles /api/* requests as before
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

export default api;
