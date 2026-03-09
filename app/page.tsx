'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

const ALL_MODULES = [
  {
    key: 'scan-pack',
    label: 'Scan & Pack',
    icon: '📷',
    desc: 'Scan AWB barcode, capture before/after photos, and submit to the warehouse log.',
    href: '/scan-pack',
  },
  {
    key: 'gallery',
    label: 'Photo Gallery',
    icon: '🖼️',
    desc: 'Browse and filter all packing photos by Order ID or date range.',
    href: '/gallery',
  },
  {
    key: 'users',
    label: 'User Management',
    icon: '👥',
    desc: 'Add packers, assign roles, and control module access per user.',
    href: '/users',
    roles: ['manager', 'admin'] as const,
  },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  const visibleModules = ALL_MODULES.filter((m) => {
    // Role restriction check
    if (m.roles && !m.roles.includes(user.role as 'manager' | 'admin')) return false;
    // Module permission check (skip for managers/admins)
    if (user.role === 'packer' && !user.modules.includes(m.key)) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user.name} 👋</h1>
        <p className="page-subtitle">
          You are signed in as <strong>{user.role}</strong>. Select a module to get started.
        </p>
      </div>

      <div className="module-grid">
        {visibleModules.map((m) => (
          <Link key={m.key} href={m.href} className="module-card">
            <span className="module-icon">{m.icon}</span>
            <span className="module-label">{m.label}</span>
            <span className="module-desc">{m.desc}</span>
          </Link>
        ))}

        {visibleModules.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
            No modules are currently enabled for your account. Contact your manager.
          </p>
        )}
      </div>
    </div>
  );
}
