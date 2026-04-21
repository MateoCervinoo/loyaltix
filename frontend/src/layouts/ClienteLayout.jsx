import { useAuth } from '../auth/useAuth';

function ClienteLayout({ children }) {
    const { usuario, logout } = useAuth();

    return (
        <div>
        <nav className="navbar bg-light border-bottom px-4">
            <span className="navbar-brand mb-0 h1">LoyalTix</span>
            <div className="d-flex align-items-center gap-3">
            <span>{usuario?.email}</span>
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                Cerrar sesión
            </button>
            </div>
        </nav>

        <main className="container py-4">{children}</main>
        </div>
    );
}

export default ClienteLayout;