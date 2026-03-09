'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthFetch } from '@/lib/context/AuthContext';

const ALL_MODULES = [
    { key: 'scan-pack', label: 'Scan & Pack', desc: 'Scan AWB + capture packing photos' },
    { key: 'gallery', label: 'Photo Gallery', desc: 'View and search packing photos' },
];

interface User {
    _id: string;
    name: string;
    phone: string;
    role: string;
    modules: string[];
    isActive: boolean;
}

export default function EditUserPage({ params }: { params: { id: string } }) {
    const { user, loading } = useAuth();
    const authFetch = useAuthFetch();
    const router = useRouter();

    const [target, setTarget] = useState<User | null>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Local editable state
    const [name, setName] = useState('');
    const [role, setRole] = useState('packer');
    const [modules, setModules] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (!loading && user && user.role === 'packer') router.push('/');
    }, [user, loading, router]);

    const fetchUser = useCallback(async () => {
        try {
            const res = await authFetch(`/api/users`);
            const data = await res.json();
            const found: User = data.users.find((u: User) => u._id === params.id);
            if (found) {
                setTarget(found);
                setName(found.name);
                setRole(found.role);
                setModules(found.modules);
                setIsActive(found.isActive);
            }
        } catch (e) { console.error(e); }
        finally { setFetching(false); }
    }, [authFetch, params.id]);

    useEffect(() => { if (user) fetchUser(); }, [user, fetchUser]);

    function toggleModule(key: string) {
        setModules((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    }

    async function handleSave() {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await authFetch(`/api/users/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name, role, modules, isActive }),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.error ?? 'Failed to save');
                return;
            }
            setSuccess('Changes saved successfully!');
        } catch { setError('Network error.'); }
        finally { setSaving(false); }
    }

    if (loading || fetching || !user) return <div className="spinner-wrap"><div className="spinner" /></div>;
    if (!target) return <p style={{ color: 'var(--text-secondary)' }}>User not found.</p>;

    return (
        <div style={{ maxWidth: 600 }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => router.push('/users')}>← Back</button>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Edit User</h1>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={target.phone} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="packer">Packer</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Account Status</label>
                    <div className="toggle-row">
                        <span className="toggle-label">Active Account</span>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>Module Permissions</h3>
                <div className="toggle-list">
                    {ALL_MODULES.map((m) => (
                        <div className="toggle-row" key={m.key}>
                            <div>
                                <div className="toggle-label">{m.label}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.desc}</div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={modules.includes(m.key)}
                                    onChange={() => toggleModule(m.key)}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
                {saving ? 'Saving…' : 'Save Changes'}
            </button>
        </div>
    );
}
