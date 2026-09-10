import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(() => {
        try {
            const stored = localStorage.getItem('cghi_admin');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const login = useCallback((token, adminData) => {
        localStorage.setItem('cghi_token', token);
        localStorage.setItem('cghi_admin', JSON.stringify(adminData));
        setAdmin(adminData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('cghi_token');
        localStorage.removeItem('cghi_admin');
        setAdmin(null);
    }, []);

    return (
        <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export function getToken() {
    return localStorage.getItem('cghi_token');
}

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function resolveAssetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url}`;
}
