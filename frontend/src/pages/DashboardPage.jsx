import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleApi } from '../services/api';
import toast from 'react-hot-toast';
import {
    LayoutDashboard, Plus, Search, LogOut, Shield, Car, Users,
    ChevronLeft, ChevronRight, Eye, Trash2, Edit, QrCode, RefreshCw,
    CheckCircle, Clock, XCircle, Menu, X
} from 'lucide-react';

const STATUS_CONFIG = {
    active: { label: 'Active', icon: CheckCircle, className: 'badge-active' },
    expired: { label: 'Expired', icon: Clock, className: 'badge-expired' },
    revoked: { label: 'Revoked', icon: XCircle, className: 'badge-revoked' },
};

export default function DashboardPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const LIMIT = 10;

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await vehicleApi.list({ page, limit: LIMIT, search, status: statusFilter });
            setVehicles(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, [page, search, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = async (id, regNum) => {
        if (!window.confirm(`Revoke vehicle record for ${regNum}? This action cannot be undone.`)) return;
        try {
            await vehicleApi.delete(id);
            toast.success('Vehicle record revoked');
            fetchVehicles();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const stats = [
        { label: 'Total Records', value: pagination.total, icon: Car, color: '#3b82f6' },
        { label: 'Active', value: vehicles.filter(v => v.status === 'active').length, icon: CheckCircle, color: '#10b981' },
        { label: 'Expired', value: vehicles.filter(v => v.status === 'expired').length, icon: Clock, color: '#f59e0b' },
        { label: 'Revoked', value: vehicles.filter(v => v.status === 'revoked').length, icon: XCircle, color: '#ef4444' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Sidebar */}
            <aside style={{
                width: 260, background: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-260px',
                height: '100vh', zIndex: 40,
                transition: 'left 0.3s ease',
            }}>
                {/* Logo */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Shield size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>
                                <span className="gradient-text">VEHICLE QR</span>
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>ADMIN PANEL</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding: '16px 12px', flex: 1 }}>
                    <a className="sidebar-link active" style={{ marginBottom: 4 }}>
                        <LayoutDashboard size={18} /> Dashboard
                    </a>
                    <a className="sidebar-link" onClick={() => navigate('/dashboard/register')} style={{ marginBottom: 4, cursor: 'pointer' }}>
                        <Plus size={18} /> Register Vehicle
                    </a>
                    <a className="sidebar-link" style={{ marginBottom: 4 }}>
                        <QrCode size={18} /> QR Codes
                    </a>
                    <a className="sidebar-link" style={{ marginBottom: 4 }}>
                        <Users size={18} /> Drivers
                    </a>
                </nav>

                {/* User info */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: 'white',
                        }}>
                            {user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, truncate: true }}>{user?.email?.split('@')[0]}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Administrator</div>
                        </div>
                    </div>
                    <button className="btn-danger" onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Sidebar overlay */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    zIndex: 39, backdropFilter: 'blur(2px)',
                }} />
            )}

            {/* Main content */}
            <main style={{ flex: 1, marginLeft: 0, padding: '24px' }}>
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--color-text)' }}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: 'Rajdhani, sans-serif' }}>
                                Vehicle Records
                            </h1>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
                                Manage all registered vehicles and drivers
                            </p>
                        </div>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/dashboard/register')}
                    >
                        <Plus size={16} /> Register Vehicle
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass-card" style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <stat.icon size={20} color={stat.color} />
                                <span style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
                            <div className="search-wrapper" style={{ flex: 1 }}>
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by reg. number, owner, chassis..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                                <Search size={14} /> Search
                            </button>
                        </form>

                        <select
                            className="form-input"
                            style={{ width: 'auto', minWidth: 140 }}
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="revoked">Revoked</option>
                        </select>

                        <button
                            className="btn-secondary"
                            onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter(''); setPage(1); }}
                        >
                            <RefreshCw size={14} /> Reset
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 12px' }} />
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading records...</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <Car size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 16, fontWeight: 600 }}>No records found</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
                                {search ? 'Try a different search term' : 'Register your first vehicle to get started'}
                            </p>
                            <button className="btn-primary" onClick={() => navigate('/dashboard/register')} style={{ marginTop: 16 }}>
                                <Plus size={16} /> Register Vehicle
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Reg. Number</th>
                                        <th>Owner Name</th>
                                        <th>Driver Name</th>
                                        <th>Mobile</th>
                                        <th>Reg. Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((v) => {
                                        const statusCfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.active;
                                        return (
                                            <tr key={v.id}>
                                                <td>
                                                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: 13 }}>
                                                        {v.registration_number}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{v.owner_name}</td>
                                                <td style={{ color: 'var(--color-text-muted)' }}>{v.driver_name || '—'}</td>
                                                <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{v.owner_mobile || '—'}</td>
                                                <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                                                    {v.registration_date ? new Date(v.registration_date).toLocaleDateString('en-IN') : '—'}
                                                </td>
                                                <td>
                                                    <span className={`badge ${statusCfg.className}`}>
                                                        <statusCfg.icon size={10} />
                                                        {statusCfg.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button
                                                            className="btn-secondary"
                                                            style={{ padding: '6px 10px' }}
                                                            onClick={() => navigate(`/dashboard/vehicle/${v.id}`)}
                                                            title="View Details"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            className="btn-secondary"
                                                            style={{ padding: '6px 10px' }}
                                                            onClick={() => navigate(`/dashboard/vehicle/${v.id}/edit`)}
                                                            title="Edit"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            className="btn-danger"
                                                            style={{ padding: '6px 10px' }}
                                                            onClick={() => handleDelete(v.id, v.registration_number)}
                                                            title="Revoke"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 24px', borderTop: '1px solid var(--color-border)',
                        }}>
                            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total} records
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    className="btn-secondary"
                                    style={{ padding: '6px 12px' }}
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        style={{
                                            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                            background: p === page ? 'var(--color-primary)' : 'transparent',
                                            color: p === page ? 'white' : 'var(--color-text-muted)',
                                            fontWeight: 600, fontSize: 13,
                                        }}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="btn-secondary"
                                    style={{ padding: '6px 12px' }}
                                    disabled={page === pagination.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
