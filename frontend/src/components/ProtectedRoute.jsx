import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
