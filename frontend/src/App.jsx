import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import EditVehiclePage from './pages/EditVehiclePage';
import VerifyPage from './pages/VerifyPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2235',
              color: '#e2e8f0',
              border: '1px solid rgba(99,179,237,0.2)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1a2235' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a2235' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify/:id" element={<VerifyPage />} />

          {/* Protected admin routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
          <Route path="/dashboard/vehicle/:id" element={<ProtectedRoute><VehicleDetailPage /></ProtectedRoute>} />
          <Route path="/dashboard/vehicle/:id/edit" element={<ProtectedRoute><EditVehiclePage /></ProtectedRoute>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
