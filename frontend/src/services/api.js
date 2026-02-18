import axios from 'axios';
import { supabase } from '../lib/supabase';

// Use environment variable or default to current origin in production
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Attach Supabase JWT token to every request
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

// Response error interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
    }
);

// ─── Vehicle API ─────────────────────────────────────────────────────────────

export const vehicleApi = {
    create: (data) => api.post('/api/vehicles', data),
    list: (params) => api.get('/api/vehicles', { params }),
    get: (id) => api.get(`/api/vehicles/${id}`),
    update: (id, data) => api.put(`/api/vehicles/${id}`, data),
    delete: (id) => api.delete(`/api/vehicles/${id}`),
};

// ─── Public Verification ─────────────────────────────────────────────────────

export const verifyApi = {
    verify: (id) => api.get(`/api/verify/${id}`),
};

export default api;
