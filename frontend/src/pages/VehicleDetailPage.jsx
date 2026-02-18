import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleApi } from '../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Car, User, Shield, QrCode, Download, Printer,
    CheckCircle, Clock, XCircle, Edit, Trash2, Calendar, Phone, Hash
} from 'lucide-react';

const STATUS_CONFIG = {
    active: { label: 'Active', icon: CheckCircle, className: 'badge-active', color: '#10b981' },
    expired: { label: 'Expired', icon: Clock, className: 'badge-expired', color: '#f59e0b' },
    revoked: { label: 'Revoked', icon: XCircle, className: 'badge-revoked', color: '#ef4444' },
};

function InfoCard({ title, icon: Icon, color, children }) {
    return (
        <div className="glass-card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${color}20`, border: `1px solid ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={18} color={color} />
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{title}</h3>
            </div>
            {children}
        </div>
    );
}

function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="info-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icon && <Icon size={13} color="var(--color-text-muted)" />}
                <span className="info-label">{label}</span>
            </div>
            <span className="info-value">{value || '—'}</span>
        </div>
    );
}

export default function VehicleDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [verifyUrl, setVerifyUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await vehicleApi.get(id);
                setData(res.data.data);
                setQrCode(res.data.qrCode);
                setVerifyUrl(res.data.verifyUrl);
            } catch (err) {
                toast.error(err.message);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `QR_${data.registration_number}.png`;
        link.click();
    };

    const printQR = () => {
        const win = window.open('', '_blank');
        win.document.write(`
      <html><head><title>QR - ${data.registration_number}</title>
      <style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;}h2{color:#1a1a2e;}img{margin:20px auto;display:block;}p{color:#666;font-size:14px;}</style>
      </head><body>
        <h2>Vehicle Verification QR Code</h2>
        <p>Registration: <strong>${data.registration_number}</strong></p>
        <img src="${qrCode}" width="250" />
        <p>Scan to verify vehicle details</p>
        <p style="font-size:12px;color:#999;">${verifyUrl}</p>
      </body></html>
    `);
        win.document.close();
        win.print();
    };

    const handleRevoke = async () => {
        if (!window.confirm('Revoke this vehicle record?')) return;
        try {
            await vehicleApi.delete(id);
            toast.success('Vehicle revoked');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--color-text-muted)' }}>Loading vehicle record...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const statusCfg = STATUS_CONFIG[data.status] || STATUS_CONFIG.active;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '40px 24px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: 'Rajdhani, sans-serif' }}>
                                {data.registration_number}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <span className={`badge ${statusCfg.className}`}>
                                    <statusCfg.icon size={10} /> {statusCfg.label}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                    Registered {new Date(data.created_at).toLocaleDateString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-secondary" onClick={() => navigate(`/dashboard/vehicle/${id}/edit`)}>
                            <Edit size={14} /> Edit
                        </button>
                        <button className="btn-danger" onClick={handleRevoke}>
                            <Trash2 size={14} /> Revoke
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
                    {/* Left column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <InfoCard title="Vehicle Information" icon={Car} color="#3b82f6">
                            <InfoRow label="Registration Number" value={data.registration_number} icon={Hash} />
                            <InfoRow label="Chassis Number" value={data.chassis_number} icon={Hash} />
                            <InfoRow label="Registration Date" value={data.registration_date ? new Date(data.registration_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null} icon={Calendar} />
                            <InfoRow label="Status" value={
                                <span className={`badge ${statusCfg.className}`}>
                                    <statusCfg.icon size={10} /> {statusCfg.label}
                                </span>
                            } />
                        </InfoCard>

                        <InfoCard title="Owner Information" icon={User} color="#06b6d4">
                            <InfoRow label="Owner Name" value={data.owner_name} />
                            <InfoRow label="Aadhaar Number" value={data.owner_aadhaar_masked} icon={Shield} />
                            <InfoRow label="Mobile" value={data.owner_mobile} icon={Phone} />
                        </InfoCard>

                        <InfoCard title="Driver Information" icon={Shield} color="#10b981">
                            <InfoRow label="Driver Name" value={data.driver_name} />
                            <InfoRow label="License Number" value={data.driving_license_number} icon={Hash} />
                            <InfoRow label="Aadhaar Number" value={data.driver_aadhaar_masked} icon={Shield} />
                            <InfoRow label="Mobile" value={data.driver_mobile} icon={Phone} />
                        </InfoCard>
                    </div>

                    {/* Right column — QR */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="glass-card" style={{ padding: '28px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>
                                Verification QR Code
                            </h3>
                            {qrCode && (
                                <div className="qr-container animate-pulse-glow" style={{ margin: '0 auto 16px' }}>
                                    <img src={qrCode} alt="QR Code" style={{ width: 200, height: 200, display: 'block' }} />
                                </div>
                            )}
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16, wordBreak: 'break-all' }}>
                                {verifyUrl}
                            </p>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button className="btn-primary" onClick={downloadQR} style={{ flex: 1 }}>
                                    <Download size={14} /> Download
                                </button>
                                <button className="btn-secondary" onClick={printQR} style={{ flex: 1 }}>
                                    <Printer size={14} /> Print
                                </button>
                            </div>
                        </div>

                        {/* Public link */}
                        <div className="glass-card" style={{ padding: '20px' }}>
                            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Public Verification Link
                            </p>
                            <a
                                href={verifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: 12, color: 'var(--color-primary)', wordBreak: 'break-all' }}
                            >
                                {verifyUrl}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
