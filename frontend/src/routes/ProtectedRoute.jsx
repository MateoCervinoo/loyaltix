import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

function ProtectedRoute({ children, rolesPermitidos }) {
    const { token, usuario } = useAuth();

    if (!token || !usuario) {
        return <Navigate to="/login" replace />;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;