import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Dynamic Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('gateflow_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Global Response Interceptor (Handles token expiration)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If any request returns a 401, clear storage and bounce to login
        if (error.response?.status === 401) {
            localStorage.removeItem('gateflow_token');
            localStorage.removeItem('gateflow_user');
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);