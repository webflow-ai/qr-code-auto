import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleApi } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Car, User, Shield } from 'lucide-react';

function Field({ label, required, children, error }) {
    return (
        <div>
            <label className="form-label">
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {children}
            {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</p>}
        </div>
    );
}

export default function EditVehiclePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        vehicleApi.get(id).then(res => {
            const d = res.data.data;
            setForm({
                registration_number: d.registration_number || '',
                owner_name: d.owner_name || '',
                owner_aadhaar: '',
                owner_mobile: d.owner_mobile || '',
                chassis_number: d.chassis_number || '',
                registration_date: d.registration_date || '',
                driver_name: d.driver_name || '',
                driver_aadhaar: '',
                driver_mobile: d.driver_mobile || '',
                driving_license_number: d.driving_license_number || '',
                status: d.status || 'active',
            });
        }).catch(err => {
            toast.error(err.message);
            navigate('/dashboard');
        }).finally(() => setLoading(false));
    }, [id]);

    const update = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.registration_number.trim()) errs.registration_number = 'Required';
        if (!form.owner_name.trim()) errs.owner_name = 'Required';
        if (form.owner_aadhaar && !/^\d{12}$/.test(form.owner_aadhaar)) errs.owner_aadhaar = 'Must be 12 digits';
        if (form.owner_mobile && !/^[6-9]\d{9}$/.test(form.owner_mobile)) errs.owner_mobile = 'Invalid mobile';
        if (form.driver_aadhaar && !/^\d{12}$/.test(form.driver_aadhaar)) errs.driver_aadhaar = 'Must be 12 digits';
        if (form.driver_mobile && !/^[6-9]\d{9}$/.test(form.driver_mobile)) errs.driver_mobile = 'Invalid mobile';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            // Only send aadhaar if user filled it (re-encrypt)
            const payload = { ...form };
            if (!payload.owner_aadhaar) delete payload.owner_aadhaar;
            if (!payload.driver_aadhaar) delete payload.driver_aadhaar;
            await vehicleApi.update(id, payload);
            toast.success('Vehicle updated successfully');
            navigate(`/dashboard/vehicle/${id}`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    const SectionCard = ({ title, icon: Icon, color, children }) => (
        <div className="glass-card" style={{ padding: '28px 32px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{title}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {children}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '40px 24px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <button className="btn-secondary" onClick={() => navigate(`/dashboard/vehicle/${id}`)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: 'Rajdhani, sans-serif' }}>Edit Vehicle Record</h1>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>Leave Aadhaar fields blank to keep existing encrypted values</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <SectionCard title="Vehicle Information" icon={Car} color="#3b82f6">
                        <Field label="Registration Number" required error={errors.registration_number}>
                            <input className="form-input" value={form.registration_number} onChange={update('registration_number')} style={errors.registration_number ? { borderColor: '#ef4444' } : {}} />
                        </Field>
                        <Field label="Chassis Number">
                            <input className="form-input" value={form.chassis_number} onChange={update('chassis_number')} />
                        </Field>
                        <Field label="Registration Date">
                            <input type="date" className="form-input" value={form.registration_date} onChange={update('registration_date')} />
                        </Field>
                        <Field label="Status">
                            <select className="form-input" value={form.status} onChange={update('status')}>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="revoked">Revoked</option>
                            </select>
                        </Field>
                    </SectionCard>

                    <SectionCard title="Owner Information" icon={User} color="#06b6d4">
                        <Field label="Owner Name" required error={errors.owner_name}>
                            <input className="form-input" value={form.owner_name} onChange={update('owner_name')} style={errors.owner_name ? { borderColor: '#ef4444' } : {}} />
                        </Field>
                        <Field label="New Aadhaar (leave blank to keep existing)" error={errors.owner_aadhaar}>
                            <input className="form-input" placeholder="12-digit Aadhaar" value={form.owner_aadhaar} onChange={update('owner_aadhaar')} maxLength={12} inputMode="numeric" />
                        </Field>
                        <Field label="Mobile" error={errors.owner_mobile}>
                            <input className="form-input" value={form.owner_mobile} onChange={update('owner_mobile')} maxLength={10} inputMode="numeric" />
                        </Field>
                    </SectionCard>

                    <SectionCard title="Driver Information" icon={Shield} color="#10b981">
                        <Field label="Driver Name">
                            <input className="form-input" value={form.driver_name} onChange={update('driver_name')} />
                        </Field>
                        <Field label="License Number">
                            <input className="form-input" value={form.driving_license_number} onChange={update('driving_license_number')} />
                        </Field>
                        <Field label="New Aadhaar (leave blank to keep existing)" error={errors.driver_aadhaar}>
                            <input className="form-input" placeholder="12-digit Aadhaar" value={form.driver_aadhaar} onChange={update('driver_aadhaar')} maxLength={12} inputMode="numeric" />
                        </Field>
                        <Field label="Driver Mobile" error={errors.driver_mobile}>
                            <input className="form-input" value={form.driver_mobile} onChange={update('driver_mobile')} maxLength={10} inputMode="numeric" />
                        </Field>
                    </SectionCard>

                    <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '14px 32px', fontSize: 15 }}>
                        {saving ? <><div className="spinner" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
