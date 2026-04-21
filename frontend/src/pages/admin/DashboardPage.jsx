import { useAuth } from '../../auth/useAuth';

function DashboardPage() {
    const { usuario } = useAuth();

    return (
        <div>
        <h2 className="mb-3">Panel administrativo</h2>
        <div className="card shadow-sm">
            <div className="card-body">
            <p className="mb-1">
                <strong>Usuario:</strong> {usuario?.email}
            </p>
            <p className="mb-0">
                <strong>Rol:</strong> {usuario?.rol}
            </p>
            </div>
        </div>
        </div>
    );
}

export default DashboardPage;