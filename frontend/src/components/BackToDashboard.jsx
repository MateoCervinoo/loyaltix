import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

function BackToDashboard() {
    const { usuario } = useAuth();

    if (!usuario || usuario.rol === 'CLIENTE') return null;

    return (
        <div className="mb-3">
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
            Volver al dashboard
        </Link>
        </div>
    );
}

export default BackToDashboard;