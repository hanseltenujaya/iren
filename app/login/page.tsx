'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(phone, password);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-box card">
                <div className="login-header">
                    <span style={{ fontSize: '2.5rem' }}>📦</span>
                    <h1 className="login-title">IREN Warehouse</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            className="form-input"
                            type="tel"
                            placeholder="e.g. 0812345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password (DDMMYYYY)</label>
                        <input
                            id="password"
                            className="form-input"
                            type="password"
                            placeholder="e.g. 01012000"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>

            <style>{`
        .login-page {
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .login-box { width: 100%; max-width: 400px; }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .login-title { font-size: 1.6rem; font-weight: 700; }
        .login-subtitle { color: var(--text-secondary); font-size: 0.9rem; }
      `}</style>
        </div>
    );
}
