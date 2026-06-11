import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// 🚨 DECOUPLED: Importing the isolated, unified client configuration from our utility layer
import { api } from '../lib/apiInstance'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // STATE ENGINE: Reads straight from localStorage during initialization to guarantee zero null state flashes on reload
    const [token, setToken] = useState(() => localStorage.getItem('gateflow_token') || null);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('gateflow_user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
// Add this right under your state hooks inside the AuthProvider wrapper component
useEffect(() => {
    const storedToken = localStorage.getItem('gateflow_token');
    const storedUser = localStorage.getItem('gateflow_user');
    
    if (storedToken && storedUser) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
    }
    setLoading(false); 
}, []);
    // Synchronizes the loading flag smoothly post-hydration mounts
    

    /**
     * Authenticates administrative staff credentials with the backend node cluster.
     */
    const login = useCallback(async (email, password) => {
    try {
        // Hits POST http://localhost:5000/api/auth/login
        const res = await api.post('/auth/login', { email, password });
        
        // Destructure from the backend's standard response structure (res.data.data)
        const { token: newToken, user: userProfile } = res.data.data;
        
        if (!newToken || !userProfile) {
            throw new Error("Missing token or user profile data from server.");
        }

        // 1. Commit immediately to local storage
        localStorage.setItem('gateflow_token', newToken);
        localStorage.setItem('gateflow_user', JSON.stringify(userProfile));
        
        // 2. Set default header instantly to fix race conditions for mounting components
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // 3. Update React application state
        setToken(newToken);
        setUser(userProfile);
        
        return userProfile;
    } catch (err) {
        console.error("Login failed:", err.response?.data?.message || err.message);
        throw err;
    }
}, []);
    /**
     * Registers a new staff profile inside the MySQL backend.
     */
    const signup = useCallback(async ({ name, email, password, role, activationCode }) => {
        const res = await api.post('/auth/signup', { name, email, password, role, activationCode });
        return res.data;
    }, []);

    /**
     * Clears tracking states and destroys persistent local cookies.
     */
    const logout = useCallback(() => {
        localStorage.removeItem('gateflow_token');
        localStorage.removeItem('gateflow_user');
        setToken(null);
        setUser(null);
    }, []);

    /**
     * Granular Role-Based Access Control structural checker tool
     * Usage: isRole('Admin', 'DOD')
     */
    const isRole = useCallback((...roles) => user && roles.includes(user.role), [user]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};