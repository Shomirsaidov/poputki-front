import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
        'x-mana-man': 'nasa.2006'
    }
});

// Request interceptor to add Admin Token and Security Header
api.interceptors.request.use(config => {
    // Ensure security header is ALWAYS present
    config.headers['x-mana-man'] = 'nasa.2006';
    
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
        config.headers['X-Admin-Token'] = adminToken;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
