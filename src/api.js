import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add Admin Token
api.interceptors.request.use(config => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
        config.headers['X-Admin-Token'] = adminToken;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
