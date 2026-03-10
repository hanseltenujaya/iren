'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth, useAuthFetch } from '@/lib/context/AuthContext';

interface GalleryItem {
    _id: string;
    orderId: string;
    beforeUrl: string;
    afterUrl: string;
    packerId: { name: string; phone: string };
    createdAt: string;
}

interface Pagination {
    page: number;
    totalPages: number;
    total: number;
}

export default function GalleryPage() {
    const { user, loading } = useAuth();
    const authFetch = useAuthFetch();
    const router = useRouter();

    const [items, setItems] = useState<GalleryItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0 });
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [fetching, setFetching] = useState(false);
    const [selected, setSelected] = useState<GalleryItem | null>(null);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    const fetchGallery = useCallback(async () => {
        setFetching(true);
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (query) params.set('orderId', query);
            const res = await authFetch(`/api/gallery?${params}`);
            const data = await res.json();
            setItems(data.items);
            setPagination(data.pagination);
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    }, [page, query, authFetch]);

    useEffect(() => {
        if (user) fetchGallery();
    }, [user, fetchGallery]);

    if (loading || !user) return <div className="spinner-wrap"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Photo Gallery</h1>
                <p className="page-subtitle">{pagination.total} packing sessions recorded</p>
            </div>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input
                    className="form-input"
                    placeholder="Search by Order ID…"
                    value={search}
                    style={{ maxWidth: 320 }}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setQuery(search); setPage(1); } }}
                />
                <button className="btn btn-primary" onClick={() => { setQuery(search); setPage(1); }}>
                    Search
                </button>
                {query && (
                    <button className="btn btn-secondary" onClick={() => { setSearch(''); setQuery(''); setPage(1); }}>
                        Clear
                    </button>
                )}
            </div>

            {fetching ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
            ) : items.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '3rem' }}>
                    No records found.
                </p>
            ) : (
                <div className="gallery-grid">
                    {items.map((item) => (
                        <div key={item._id} className="gallery-item" onClick={() => setSelected(item)}>
                            <div className="gallery-images">
                                <img src={item.beforeUrl} alt="Before" width={240} height={240} className="gallery-img" style={{ objectFit: 'cover' }} />
                                <img src={item.afterUrl} alt="After" width={240} height={240} className="gallery-img" style={{ objectFit: 'cover' }} />
                            </div>
                            <div className="gallery-meta">
                                <div className="gallery-order">#{item.orderId}</div>
                                <div className="gallery-packer">
                                    {item.packerId?.name} · {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button className="page-btn" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}

            {/* Modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="modal-title" style={{ marginBottom: 0 }}>Order #{selected.orderId}</h2>
                            <button className="btn btn-secondary" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Packed by <strong>{selected.packerId?.name}</strong> on{' '}
                            {new Date(selected.createdAt).toLocaleString('id-ID')}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>BEFORE</p>
                                <img src={selected.beforeUrl} alt="Before" width={600} height={400} style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>AFTER</p>
                                <img src={selected.afterUrl} alt="After" width={600} height={400} style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
