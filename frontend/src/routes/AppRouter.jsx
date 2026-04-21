import { Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ClienteLayout from '../layouts/ClienteLayout';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import MiCuentaPage from '../pages/cliente/MiCuentaPage';

import ProtectedRoute from './ProtectedRoute';

function AppRouter() {
    return (
        <Routes>
        <Route
            path="/login"
            element={
            <PublicLayout>
                <LoginPage />
            </PublicLayout>
            }
        />

        <Route
            path="/dashboard"
            element={
            <ProtectedRoute rolesPermitidos={['ADMIN', 'VENDEDOR']}>
                <AdminLayout>
                <DashboardPage />
                </AdminLayout>
            </ProtectedRoute>
            }
        />

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

        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default AppRouter;