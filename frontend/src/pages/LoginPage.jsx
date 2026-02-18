import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }
        setLoading(true);
        try {
            await signIn(email, password);
            toast.success('Welcome back, Admin!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.06) 0%, transparent 60%), var(--color-bg)',
            padding: '20px',
        }}>
            {/* Background grid */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
            }} />

            <div className="glass-card animate-fade-in" style={{
                width: '100%', maxWidth: 440, padding: '48px 40px', position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 0 40px rgba(59,130,246,0.4)',
                    }}>
                        <Shield size={36} color="white" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>
                        <span className="gradient-text">VEHICLE QR</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: 0 }}>
                        Smart Vehicle & Driver Verification System
                    </p>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: 20, padding: '4px 12px',
                    }}>
                        <Lock size={10} color="#3b82f6" />
                        <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, letterSpacing: '0.1em' }}>ADMIN PORTAL</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{
                                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)',
                            }} />
                            <input
                                type="email"
                                className="form-input"
                                style={{ paddingLeft: 44 }}
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{
                                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)',
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                style={{ paddingLeft: 44, paddingRight: 44 }}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--color-text-muted)', padding: 0,
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15 }}
                    >
                        {loading ? (
                            <><div className="spinner" /> Signing in...</>
                        ) : (
                            <><Shield size={16} /> Sign In to Admin Panel</>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    🔒 Secured with Supabase Authentication & AES-256 Encryption
                </p>
            </div>
        </div>
    );
}
