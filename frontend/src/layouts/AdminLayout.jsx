import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import logo from '../resources/logo/loyaltix-logo-notag.png';

function AdminLayout() {
    const { usuario, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

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
            <button
                className="btn btn-light btn-sm"
                onClick={() => setMenuOpen(true)}
            >
                ☰
            </button>

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

        {menuOpen && (
            <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '260px',
                height: '100%',
                background: '#ffffff',
                boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
                padding: '20px',
            }}
            >
            <button
                className="btn btn-sm btn-outline-secondary mb-3"
                onClick={() => setMenuOpen(false)}
            >
                Cerrar
            </button>

            <div className="d-flex flex-column gap-3">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
                </Link>

                <Link to="/clientes-admin" onClick={() => setMenuOpen(false)}>
                Clientes
                </Link>

                {usuario?.rol === 'ADMIN' && (
                <Link to="/usuarios-admin" onClick={() => setMenuOpen(false)}>
                    Usuarios
                </Link>
                )}

                {usuario?.rol === 'ADMIN' && (
                <Link to="/instituciones-admin" onClick={() => setMenuOpen(false)}>
                    Instituciones
                </Link>
                )}

                {usuario?.rol === 'ADMIN' && (
                <Link to="/profesiones-admin" onClick={() => setMenuOpen(false)}>
                    Profesiones
                </Link>
                )}

                <Link to="/beneficios-admin" onClick={() => setMenuOpen(false)}>
                Beneficios
                </Link>

                <Link to="/canjes-admin" onClick={() => setMenuOpen(false)}>
                Canjes
                </Link>

                <Link to="/puntos-admin" onClick={() => setMenuOpen(false)}>
                Puntos
                </Link>

                {usuario?.rol === 'ADMIN' && (
                <Link
                    to="/configuracion-puntos-admin"
                    onClick={() => setMenuOpen(false)}
                >
                    Configuración
                </Link>
                )}
            </div>
            </div>
        )}

        {menuOpen && (
            <div
            onClick={() => setMenuOpen(false)}
            style={{
                position: 'fixed',
                top: 0,
                left: 260,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                zIndex: 999,
            }}
            />
        )}

        <main className="container py-4">
            <Outlet />
        </main>

        <footer className="text-center text-muted py-3">
            LoyalTix © 2026
        </footer>
        </div>
    );
}

export default AdminLayout;