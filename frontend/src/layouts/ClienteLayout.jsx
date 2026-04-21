import { useAuth } from '../auth/useAuth';
import logo from '../resources/logo/loyaltix-logo-notag.png';

function ClienteLayout({ children }) {
    const { usuario, logout } = useAuth();

    const nombre = usuario?.nombre
        ? `${usuario.nombre} ${usuario.apellido}`
        : usuario?.email;

    return (
        <div>
        <nav
            className="d-flex justify-content-between align-items-center px-4"
            style={{
            background: '#1f3a6e',
            height: '64px',
            color: 'white',
            }}
        >
            <div className="d-flex align-items-center gap-3">
            <img
                src={logo}
                alt="LoyalTix"
                style={{
                height: '36px',
                objectFit: 'contain',
                }}
            />
            </div>

            <div className="d-flex align-items-center gap-3">
            <span style={{ fontWeight: '500' }}>{nombre}</span>

            <button
                className="btn btn-outline-light btn-sm"
                onClick={logout}
            >
                Cerrar sesión
            </button>
            </div>
        </nav>

        <main className="container py-4">
            {children}
        </main>

        <footer className="text-center text-muted py-3">
            LoyalTix © 2026
        </footer>
        </div>
    );
}

export default ClienteLayout;