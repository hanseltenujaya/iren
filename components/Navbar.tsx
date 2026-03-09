'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

const ROLE_COLOR: Record<string, string> = {
    manager: '#f59e0b',
    admin: '#3b82f6',
    packer: '#10b981',
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const links = [
        { href: '/', label: 'Dashboard' },
        { href: '/gallery', label: 'Gallery' },
        ...(user.role === 'manager' || user.role === 'admin'
            ? [{ href: '/users', label: 'Users' }]
            : []),
    ];

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="brand-icon">📦</span>
                <span className="brand-name">IREN</span>
            </div>
            <div className="navbar-links">
                {links.map((l) => (
                    <Link
                        key={l.href}
                        href={l.href}
                        className={`nav-link${pathname === l.href ? ' active' : ''}`}
                    >
                        {l.label}
                    </Link>
                ))}
            </div>
            <div className="navbar-user">
                <span
                    className="role-badge"
                    style={{ background: ROLE_COLOR[user.role] ?? '#6b7280' }}
                >
                    {user.role}
                </span>
                <span className="user-name">{user.name}</span>
                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}
