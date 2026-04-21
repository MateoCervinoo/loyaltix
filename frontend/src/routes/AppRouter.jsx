import { Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ClienteLayout from '../layouts/ClienteLayout';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import BeneficiosPage from '../pages/admin/BeneficiosPage';
import PuntosPage from '../pages/admin/PuntosPage';
import MiCuentaPage from '../pages/cliente/MiCuentaPage';

import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../auth/useAuth';

function AppRouter() {
    const { token, usuario } = useAuth();

    const getHomeByRole = () => {
        if (!token || !usuario) return '/login';

        if (usuario.rol === 'ADMIN' || usuario.rol === 'VENDEDOR') {
        return '/dashboard';
        }

        if (usuario.rol === 'CLIENTE') {
        return '/mi-cuenta';
        }

        return '/login';
    };

    return (
        <Routes>
        <Route
            path="/login"
            element={
            token && usuario ? (
                <Navigate to={getHomeByRole()} replace />
            ) : (
                <PublicLayout>
                <LoginPage />
                </PublicLayout>
            )
            }
        />

        <Route
            element={
            <ProtectedRoute rolesPermitidos={['ADMIN', 'VENDEDOR']}>
                <AdminLayout />
            </ProtectedRoute>
            }
        >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/beneficios-admin" element={<BeneficiosPage />} />
            <Route path="/puntos-admin" element={<PuntosPage />} />
        </Route>

        <Route
            path="/mi-cuenta"
            element={
            <ProtectedRoute rolesPermitidos={['CLIENTE']}>
                <ClienteLayout>
                <MiCuentaPage />
                </ClienteLayout>
            </ProtectedRoute>
            }
        />

        <Route path="*" element={<Navigate to={getHomeByRole()} replace />} />
        </Routes>
    );
}

export default AppRouter;