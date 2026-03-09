'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    phone: string;
    role: 'packer' | 'admin' | 'manager';
    modules: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (phone: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('iren_token');
        const storedUser = localStorage.getItem('iren_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (phone: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error ?? 'Login failed');
        }

        const data = await res.json();
        localStorage.setItem('iren_token', data.token);
        localStorage.setItem('iren_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        router.push('/');
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('iren_token');
        localStorage.removeItem('iren_user');
        setToken(null);
        setUser(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}

/** Helper to build fetch headers with Authorization token */
export function useAuthFetch() {
    const { token, logout } = useAuth();
    return useCallback(async (url: string, options: RequestInit = {}) => {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers ?? {}),
                Authorization: `Bearer ${token}`,
            },
        });
        if (res.status === 401) {
            logout();
            throw new Error('Session expired');
        }
        return res;
    }, [token, logout]);
}
