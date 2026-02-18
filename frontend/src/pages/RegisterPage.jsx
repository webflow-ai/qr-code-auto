import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleApi } from '../services/api';
import toast from 'react-hot-toast';
import {
    Car, User, Shield, QrCode, Download, Printer,
    ArrowLeft, CheckCircle, AlertCircle
} from 'lucide-react';

const INITIAL_FORM = {
    registration_number: '',
    owner_name: '',
    owner_aadhaar: '',
    owner_mobile: '',
    chassis_number: '',
    registration_date: '',
    driver_name: '',
    driver_aadhaar: '',
    driver_mobile: '',
    driving_license_number: '',
    status: 'active',
};

function FormSection({ title, icon: Icon, color, children }) {
    return (
        <div className="glass-card" style={{ padding: '28px 32px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${color}20`,
                    border: `1px solid ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={20} color={color} />
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{title}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {children}
            </div>
        </div>
    );
}

function Field({ label, required, children }) {
    return (
        <div>
            <label className="form-label">
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {children}
        </div>
    );
}

export default function RegisterPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const update = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.registration_number.trim()) errs.registration_number = 'Required';
        if (!form.owner_name.trim()) errs.owner_name = 'Required';
        if (!form.owner_aadhaar) errs.owner_aadhaar = 'Required';
        else if (!/^\d{12}$/.test(form.owner_aadhaar)) errs.owner_aadhaar = 'Must be exactly 12 digits';
        if (form.owner_mobile && !/^[6-9]\d{9}$/.test(form.owner_mobile)) errs.owner_mobile = 'Invalid Indian mobile number';
        if (form.driver_aadhaar && !/^\d{12}$/.test(form.driver_aadhaar)) errs.driver_aadhaar = 'Must be exactly 12 digits';
        if (form.driver_mobile && !/^[6-9]\d{9}$/.test(form.driver_mobile)) errs.driver_mobile = 'Invalid Indian mobile number';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the validation errors');
            return;
        }
        setLoading(true);
        try {
            const res = await vehicleApi.create(form);
            setResult(res.data);
            toast.success('Vehicle registered successfully!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (!result?.qrCode) return;
        const link = document.createElement('a');
        link.href = result.qrCode;
        link.download = `QR_${result.data.registration_number}.png`;
        link.click();
    };

    const printQR = () => {
        const win = window.open('', '_blank');
        win.document.write(`
      <html><head><title>QR Code - ${result.data.registration_number}</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h2 { color: #1a1a2e; }
        img { margin: 20px auto; display: block; }
        p { color: #666; font-size: 14px; }
      </style></head>
      <body>
        <h2>Vehicle Verification QR Code</h2>
        <p>Registration: <strong>${result.data.registration_number}</strong></p>
        <img src="${result.qrCode}" width="250" />
        <p>Scan to verify vehicle details</p>
        <p style="font-size:12px; color:#999;">${result.verifyUrl}</p>
      </body></html>
    `);
        win.document.close();
        win.print();
    };

    // ─── Success View ─────────────────────────────────────────────────────────
    if (result) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '40px 24px' }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>

                    <div className="glass-card animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <CheckCircle size={36} color="#10b981" />
                        </div>
                        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', fontFamily: 'Rajdhani, sans-serif' }}>
                            Registration Successful!
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
                            Vehicle <strong style={{ color: 'var(--color-primary)' }}>{result.data.registration_number}</strong> has been registered.
                        </p>

                        {/* QR Code */}
                        <div style={{ marginBottom: 32 }}>
                            <div className="qr-container" style={{ margin: '0 auto', display: 'inline-block' }}>
                                <img src={result.qrCode} alt="QR Code" style={{ width: 220, height: 220, display: 'block' }} />
                            </div>
                            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
                                Scan to verify vehicle details
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--color-primary)', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 4 }}>
                                {result.verifyUrl}
                            </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn-primary" onClick={downloadQR}>
                                <Download size={16} /> Download QR
                            </button>
                            <button className="btn-secondary" onClick={printQR}>
                                <Printer size={16} /> Print QR
                            </button>
                            <button className="btn-secondary" onClick={() => navigate(`/dashboard/vehicle/${result.data.id}`)}>
                                <QrCode size={16} /> View Record
                            </button>
                            <button className="btn-secondary" onClick={() => { setResult(null); setForm(INITIAL_FORM); }}>
                                <Car size={16} /> Register Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Registration Form ────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '40px 24px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: 'Rajdhani, sans-serif' }}>
                            Register Vehicle & Driver
                        </h1>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
                            Fill in the details below. Aadhaar numbers are encrypted before storage.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Vehicle Info */}
                    <FormSection title="Vehicle Information" icon={Car} color="#3b82f6">
                        <Field label="Registration Number" required>
                            <input
                                className="form-input"
                                placeholder="e.g. MH12AB1234"
                                value={form.registration_number}
                                onChange={update('registration_number')}
                                style={errors.registration_number ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.registration_number && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.registration_number}</p>}
                        </Field>

                        <Field label="Chassis Number">
                            <input
                                className="form-input"
                                placeholder="e.g. MA3EWDE1S00123456"
                                value={form.chassis_number}
                                onChange={update('chassis_number')}
                            />
                        </Field>

                        <Field label="Registration Date">
                            <input
                                type="date"
                                className="form-input"
                                value={form.registration_date}
                                onChange={update('registration_date')}
                            />
                        </Field>

                        <Field label="Status">
                            <select className="form-input" value={form.status} onChange={update('status')}>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="revoked">Revoked</option>
                            </select>
                        </Field>
                    </FormSection>

                    {/* Owner Info */}
                    <FormSection title="Owner Information" icon={User} color="#06b6d4">
                        <Field label="Owner Name" required>
                            <input
                                className="form-input"
                                placeholder="Full name as per documents"
                                value={form.owner_name}
                                onChange={update('owner_name')}
                                style={errors.owner_name ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.owner_name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.owner_name}</p>}
                        </Field>

                        <Field label="Owner Aadhaar Number" required>
                            <input
                                className="form-input"
                                placeholder="12-digit Aadhaar (will be encrypted)"
                                value={form.owner_aadhaar}
                                onChange={update('owner_aadhaar')}
                                maxLength={12}
                                inputMode="numeric"
                                style={errors.owner_aadhaar ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.owner_aadhaar && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.owner_aadhaar}</p>}
                            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                                🔒 Encrypted with AES-256 before storage
                            </p>
                        </Field>

                        <Field label="Owner Mobile">
                            <input
                                className="form-input"
                                placeholder="10-digit mobile number"
                                value={form.owner_mobile}
                                onChange={update('owner_mobile')}
                                maxLength={10}
                                inputMode="numeric"
                                style={errors.owner_mobile ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.owner_mobile && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.owner_mobile}</p>}
                        </Field>
                    </FormSection>

                    {/* Driver Info */}
                    <FormSection title="Driver Information" icon={Shield} color="#10b981">
                        <Field label="Driver Name">
                            <input
                                className="form-input"
                                placeholder="Full name as per license"
                                value={form.driver_name}
                                onChange={update('driver_name')}
                            />
                        </Field>

                        <Field label="Driving License Number">
                            <input
                                className="form-input"
                                placeholder="e.g. MH1220110012345"
                                value={form.driving_license_number}
                                onChange={update('driving_license_number')}
                            />
                        </Field>

                        <Field label="Driver Aadhaar Number">
                            <input
                                className="form-input"
                                placeholder="12-digit Aadhaar (will be encrypted)"
                                value={form.driver_aadhaar}
                                onChange={update('driver_aadhaar')}
                                maxLength={12}
                                inputMode="numeric"
                                style={errors.driver_aadhaar ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.driver_aadhaar && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.driver_aadhaar}</p>}
                            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                                🔒 Encrypted with AES-256 before storage
                            </p>
                        </Field>

                        <Field label="Driver Mobile">
                            <input
                                className="form-input"
                                placeholder="10-digit mobile number"
                                value={form.driver_mobile}
                                onChange={update('driver_mobile')}
                                maxLength={10}
                                inputMode="numeric"
                                style={errors.driver_mobile ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.driver_mobile && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.driver_mobile}</p>}
                        </Field>
                    </FormSection>

                    {/* Security notice */}
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: 12, padding: '16px 20px', marginBottom: 24,
                    }}>
                        <AlertCircle size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>Security Notice</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                All Aadhaar numbers are encrypted using AES-256-CBC before being stored in the database.
                                They are never stored in plaintext. The public verification page only shows masked Aadhaar (XXXX-XXXX-XXXX).
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '14px 32px', fontSize: 15 }}>
                            {loading ? (
                                <><div className="spinner" /> Registering...</>
                            ) : (
                                <><QrCode size={18} /> Register & Generate QR</>
                            )}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setForm(INITIAL_FORM)}>
                            Clear Form
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
