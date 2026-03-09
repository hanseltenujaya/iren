'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function ScanPackPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (!loading && user && (!user.modules.includes('scan-pack') && user.role === 'packer')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) return <div className="spinner-wrap"><div className="spinner" /></div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱</div>
            <h1 className="page-title">Scan & Pack app is optimized for mobile.</h1>
            <p className="page-subtitle" style={{ fontSize: '1.1rem', marginTop: '1rem', lineHeight: 1.6 }}>
                The Scan & Pack module accesses your device camera to capture high-quality before and after photos.
                For the best experience, please open this app on your warehouse Android device.
            </p>

            <div className="card" style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-surface)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Web Fallback</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    We are building a web-fallback version of the scanner for desktop use in a future update.
                    For now, please use the mobile app.
                </p>
                <button className="btn btn-secondary" onClick={() => router.push('/')}>
                    ← Return to Dashboard
                </button>
            </div>
        </div>
    );
}
