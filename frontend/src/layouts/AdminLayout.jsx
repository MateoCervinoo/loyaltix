import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import logo from '../resources/logo/loyaltix-logo-notag.png';

function AdminLayout() {
    const { usuario, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div>
        <nav
            className="d-flex justify-content-between align-items-center px-4"
            style={{
            backgroundColor: '#1f3a6e',
            height: '64px',
            color: 'white',
            }}
        >
            <div className="d-flex align-items-center gap-3">
            <button
                type="button"
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
            <span style={{ fontWeight: 500 }}>{usuario?.email}</span>

            <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={logout}
            >
                Cerrar sesión
            </button>
            </div>
        </nav>

        {menuOpen && (
            <>
            <div
                style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '280px',
                height: '100vh',
                backgroundColor: '#0d1b3d',
                color: 'white',
                zIndex: 1050,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                boxShadow: '2px 0 16px rgba(0,0,0,0.25)',
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                <strong style={{ fontSize: '18px' }}>Menú</strong>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-light"
                    onClick={() => setMenuOpen(false)}
                >
                    Cerrar
                </button>
                </div>

                <div className="d-flex flex-column gap-2">
                <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                >
                    Dashboard
                </Link>

                <Link
                    to="/clientes-admin"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                >
                    Clientes
                </Link>

                {usuario?.rol === 'ADMIN' && (
                    <Link
                    to="/usuarios-admin"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                    >
                    Usuarios
                    </Link>
                )}

                {usuario?.rol === 'ADMIN' && (
                    <Link
                    to="/instituciones-admin"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                    >
                    Instituciones
                    </Link>
                )}

                {usuario?.rol === 'ADMIN' && (
                    <Link
                    to="/profesiones-admin"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                    >
                    Profesiones
                    </Link>
                )}

                <Link
                    to="/beneficios-admin"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                >
                    Beneficios
                </Link>

                <Link
                    to="/canjes-admin"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                >
                    Canjes
                </Link>

                <Link
                    to="/puntos-admin"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                >
                    Puntos
                </Link>

                {usuario?.rol === 'ADMIN' && (
                    <Link
                    to="/configuracion-puntos-admin"
                    onClick={() => setMenuOpen(false)}
                    style={sidebarLinkStyle}
                    >
                    Configuración
                    </Link>
                )}
                </div>

                <div
                style={{
                    marginTop: 'auto',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                }}
                >
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
                    Sesión actual
                </div>

                <div className="d-flex align-items-center gap-2">
                    <div
                    style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#2f6fcf',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: 'white',
                        flexShrink: 0,
                    }}
                    >
                    {usuario?.email?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {usuario?.email}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {usuario?.rol}
                    </div>
                    </div>
                </div>
                </div>
            </div>

            <div
                onClick={() => setMenuOpen(false)}
                style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.35)',
                zIndex: 1040,
                }}
            />
            </>
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

const sidebarLinkStyle = {
    display: 'block',
    padding: '10px 12px',
    borderRadius: '8px',
    color: 'white',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    textDecoration: 'none',
    fontSize: '14px',
};

export default AdminLayout;