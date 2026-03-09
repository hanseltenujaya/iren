'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useAuthFetch } from '@/lib/context/AuthContext';

interface User {
    _id: string;
    name: string;
    phone: string;
    role: string;
    modules: string[];
    isActive: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const { user, loading } = useAuth();
    const authFetch = useAuthFetch();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [fetching, setFetching] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    // New user form state
    const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'packer' });
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (!loading && user && user.role === 'packer') router.push('/');
    }, [user, loading, router]);

    const fetchUsers = useCallback(async () => {
        setFetching(true);
        try {
            const res = await authFetch('/api/users');
            const data = await res.json();
            setUsers(data.users);
        } catch (e) { console.error(e); }
        finally { setFetching(false); }
    }, [authFetch]);

    useEffect(() => { if (user) fetchUsers(); }, [user, fetchUsers]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setFormError('');
        setCreating(true);
        try {
            const res = await authFetch('/api/users', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const err = await res.json();
                setFormError(err.error ?? 'Failed to create user');
                return;
            }
            setShowCreate(false);
            setForm({ name: '', phone: '', password: '', role: 'packer' });
            await fetchUsers();
        } catch (e) {
            setFormError('Network error. Please try again.');
            console.error(e);
        } finally {
            setCreating(false);
        }
    }

    if (loading || !user) return <div className="spinner-wrap"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">{users.length} users registered</p>
                </div>
                {user.role === 'manager' && (
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add User</button>
                )}
            </div>

            {fetching ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
            ) : (
                <div className="card table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Modules</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{u.phone}</td>
                                    <td>
                                        <span className="role-badge" style={{
                                            background: u.role === 'manager' ? '#f59e0b' : u.role === 'admin' ? '#3b82f6' : '#10b981'
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        {u.modules.join(', ') || '—'}
                                    </td>
                                    <td>
                                        <span style={{ color: u.isActive ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem' }}>
                                            {u.isActive ? '● Active' : '○ Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role === 'manager' && (
                                            <Link href={`/users/${u._id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                                                Edit
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create User Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Add New User</h2>
                        {formError && <div className="alert alert-error">{formError}</div>}
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password (DDMMYYYY)</label>
                                <input className="form-input" type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-input" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}>
                                    <option value="packer">Packer</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? 'Creating…' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
