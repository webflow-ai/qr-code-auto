import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyApi } from '../services/api';
import {
    Shield, CheckCircle, Clock, XCircle, Car, User,
    Phone, Hash, Calendar, AlertTriangle, QrCode
} from 'lucide-react';

const STATUS_CONFIG = {
    active: {
        label: 'VERIFIED & ACTIVE',
        icon: CheckCircle,
        badgeClass: 'badge-active',
        color: '#10b981',
        bgColor: 'rgba(16,185,129,0.1)',
        borderColor: 'rgba(16,185,129,0.3)',
        description: 'This vehicle record is valid and active.',
    },
    expired: {
        label: 'RECORD EXPIRED',
        icon: Clock,
        badgeClass: 'badge-expired',
        color: '#f59e0b',
        bgColor: 'rgba(245,158,11,0.1)',
        borderColor: 'rgba(245,158,11,0.3)',
        description: 'This vehicle registration has expired.',
    },
    revoked: {
        label: 'RECORD REVOKED',
        icon: XCircle,
        badgeClass: 'badge-revoked',
        color: '#ef4444',
        bgColor: 'rgba(239,68,68,0.1)',
        borderColor: 'rgba(239,68,68,0.3)',
        description: 'This vehicle record has been revoked.',
    },
};

function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="info-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icon && <Icon size={13} color="var(--color-text-muted)" />}
                <span className="info-label">{label}</span>
            </div>
            <span className="info-value" style={{ fontFamily: label.includes('Aadhaar') ? 'monospace' : 'inherit' }}>
                {value || '—'}
            </span>
        </div>
    );
}

function Section({ title, icon: Icon, color, children }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `${color}20`, border: `1px solid ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={15} color={color} />
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}

export default function VerifyPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await verifyApi.verify(id);
                setData(res.data.data);
            } catch (err) {
                setError(err.message || 'Vehicle record not found');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    // Loading
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 60%), var(--color-bg)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', animation: 'pulse-glow 2s ease-in-out infinite',
                    }}>
                        <QrCode size={36} color="white" />
                    </div>
                    <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>Verifying vehicle record...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-bg)', padding: 24,
            }}>
                <div className="glass-card animate-fade-in" style={{ maxWidth: 480, width: '100%', padding: '48px 40px', textAlign: 'center' }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <AlertTriangle size={36} color="#ef4444" />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px', fontFamily: 'Rajdhani, sans-serif' }}>
                        Record Not Found
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                        {error}. This QR code may be invalid, expired, or the record may have been removed.
                    </p>
                    <div style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#ef4444',
                    }}>
                        ⚠️ Do not accept this vehicle without valid verification
                    </div>
                </div>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[data.status] || STATUS_CONFIG.active;
    const StatusIcon = statusCfg.icon;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8f9fa',
            padding: '20px 16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    color: 'white',
                    padding: '24px 20px',
                    borderRadius: '12px 12px 0 0',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>🛡️</div>
                    <h1 style={{ 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        margin: '0 0 4px',
                        letterSpacing: '0.5px',
                    }}>
                        VEHICLE VERIFICATION
                    </h1>
                    <p style={{ fontSize: '12px', margin: 0, opacity: 0.9 }}>
                        Government of India
                    </p>
                </div>

                {/* Status Badge */}
                <div style={{
                    background: statusCfg.color,
                    color: 'white',
                    padding: '12px 20px',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '14px',
                    letterSpacing: '0.5px',
                }}>
                    {statusCfg.label}
                </div>

                {/* Main Content */}
                <div style={{
                    background: 'white',
                    borderRadius: '0 0 12px 12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                }}>
                    {/* Registration Number */}
                    <div style={{
                        background: '#f1f5f9',
                        padding: '20px',
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                    }}>
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#64748b', 
                            fontWeight: '600',
                            marginBottom: '8px',
                            letterSpacing: '1px',
                        }}>
                            REGISTRATION NUMBER
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#1e293b',
                            letterSpacing: '2px',
                            fontFamily: 'monospace',
                        }}>
                            {data.registration_number}
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    <div style={{ padding: '20px' }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '12px',
                            paddingBottom: '8px',
                            borderBottom: '2px solid #3b82f6',
                            display: 'inline-block',
                        }}>
                            🚗 VEHICLE DETAILS
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <InfoField label="Chassis Number" value={data.chassis_number || 'N/A'} />
                            <InfoField label="Registration Date" value={formatDate(data.registration_date)} />
                            <InfoField label="Status" value={data.status.toUpperCase()} />
                        </div>

                        {/* Owner Details */}
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '12px',
                            marginTop: '24px',
                            paddingBottom: '8px',
                            borderBottom: '2px solid #06b6d4',
                            display: 'inline-block',
                        }}>
                            👤 OWNER DETAILS
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <InfoField label="Name" value={data.owner_name} />
                            <InfoField label="Aadhaar" value={data.owner_aadhaar_masked} mono />
                            <InfoField label="Mobile" value={data.owner_mobile || 'N/A'} mono />
                        </div>

                        {/* Driver Details */}
                        {data.driver_name && (
                            <>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: '#1e293b',
                                    marginBottom: '12px',
                                    marginTop: '24px',
                                    paddingBottom: '8px',
                                    borderBottom: '2px solid #10b981',
                                    display: 'inline-block',
                                }}>
                                    🪪 DRIVER DETAILS
                                </div>
                                
                                <div style={{ marginBottom: '16px' }}>
                                    <InfoField label="Name" value={data.driver_name} />
                                    <InfoField label="License Number" value={data.driving_license_number || 'N/A'} mono />
                                    <InfoField label="Aadhaar" value={data.driver_aadhaar_masked} mono />
                                    <InfoField label="Mobile" value={data.driver_mobile || 'N/A'} mono />
                                </div>
                            </>
                        )}

                        {/* Verification Info */}
                        <div style={{
                            marginTop: '24px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                        }}>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                                <strong>Record ID:</strong>
                                <div style={{ 
                                    fontFamily: 'monospace', 
                                    fontSize: '10px',
                                    wordBreak: 'break-all',
                                    marginTop: '4px',
                                }}>
                                    {data.id}
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                <strong>Verified On:</strong> {new Date().toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'white',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#64748b',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                    <div style={{ marginBottom: '8px' }}>
                        🔒 Secured with AES-256 Encryption
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        Smart Vehicle & Driver QR Verification System
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoField({ label, value, mono }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #f1f5f9',
        }}>
            <span style={{ 
                fontSize: '13px', 
                color: '#64748b',
                fontWeight: '500',
            }}>
                {label}
            </span>
            <span style={{ 
                fontSize: '13px', 
                color: '#1e293b',
                fontWeight: '600',
                fontFamily: mono ? 'monospace' : 'inherit',
                textAlign: 'right',
            }}>
                {value}
            </span>
        </div>
    );
}
