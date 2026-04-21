import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

function AdminLayout() {
    const { usuario, logout } = useAuth();

    return (
        <div className="container-fluid">
        <div className="row min-vh-100">
            <aside className="col-2 bg-light border-end p-3">
            <h5 className="mb-4">LoyalTix</h5>

            <div className="mb-4">
                <p className="mb-1 fw-semibold">{usuario?.email}</p>
                <p className="text-muted small">{usuario?.rol}</p>
            </div>

            <nav className="d-flex flex-column gap-2">
            <Link className="btn btn-outline-secondary text-start" to="/dashboard">
                Dashboard
            </Link>
            <Link className="btn btn-outline-secondary text-start" to="/clientes-admin">
                Clientes
            </Link>
            {usuario?.rol === 'ADMIN' && (
            <Link className="btn btn-outline-secondary text-start" to="/usuarios-admin">
                Usuarios
                </Link>
            )}
            {usuario?.rol === 'ADMIN' && (
                <Link className="btn btn-outline-secondary text-start" to="/instituciones-admin">
                Instituciones
                </Link>
            )}
            {usuario?.rol === 'ADMIN' && (
                <Link className="btn btn-outline-secondary text-start" to="/profesiones-admin">
                Profesiones
                </Link>
            )}
            <Link className="btn btn-outline-secondary text-start" to="/beneficios-admin">
                Beneficios
            </Link>
            <Link className="btn btn-outline-secondary text-start" to="/puntos-admin">
                Puntos
            </Link>
            {usuario?.rol === 'ADMIN' && (
                <Link className="btn btn-outline-secondary text-start" to="/configuracion-puntos-admin">
                    Configuración de puntos
                </Link>
            )}
            </nav>

            <hr />

            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                Cerrar sesión
            </button>
            </aside>

            <main className="col-10 p-4">
            <Outlet />
            </main>
        </div>
        </div>
    );
}

export default AdminLayout;