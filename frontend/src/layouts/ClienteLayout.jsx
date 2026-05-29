import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '../resources/logo/loyaltix-logo-notag.png';

function ClienteLayout({ children }) {
    const { usuario, logout } = useAuth();

    const nombre = usuario?.nombre
        ? `${usuario.nombre} ${usuario.apellido}`
        : usuario?.email;

    return (
        <div style={{ minHeight: '100vh', background: '#f6f8fa' }}>
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
                        style={{ height: '36px', objectFit: 'contain', cursor: 'pointer', transition: 'filter 0.2s, opacity 0.2s'}}
                        onClick={() => {
                          let target = '/';
                          if (usuario?.rol === 'ADMIN') target = '/admin';
                          else if (usuario?.rol === 'VENDEDOR') target = '/vendedor';
                          else if (usuario?.rol === 'CLIENTE') target = '/cliente';
                          navigate(target);
                        }}
                        onMouseOver={e => { e.currentTarget.style.filter = 'brightness(0.92)'; e.currentTarget.style.opacity=0.92; }}
                        onMouseOut={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.opacity=1; }}
                    />
                </div>
                <div className="d-flex align-items-center gap-3">
                    <span style={{ fontWeight: '500' }}>{nombre}</span>
                    <button className="btn btn-outline-light btn-sm" onClick={logout}>
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            <div className="d-flex" style={{ minHeight: 'calc(100vh - 64px - 48px)' }}>
                {/* Sidebar navigation */}
                <aside
                    style={{
                        minWidth: 170,
                        background: '#fff',
                        borderRight: '1px solid #e4e7eb',
                        padding: '32px 0 0 0',
                        boxShadow: '0 2px 8px rgba(31,58,110,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        gap: 6,
                        overflowY: 'auto',
                        height: '100vh'
                    }}
                >
                                        <NavItem label="Movimientos" href="#movimientos" icon="💳" />
                    <NavItem label="Beneficios" href="#beneficios" icon="🎁" />
                    <NavItem label="Mis Canjes" href="#canjes" icon="📝" />
                </aside>
                <main className="container py-4 flex-grow-1" id="inicio">
                    {children}
                </main>
            </div>

            <footer className="text-center py-3">
                LoyalTix v1.2.1 — © 2026
            </footer>
        </div>
    );
}

function NavItem({ label, href, icon }) {
    return (
        <a
            href={href}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#26344d',
                textDecoration: 'none',
                padding: '12px 28px 12px 18px',
                fontWeight: 500,
                fontSize: 15,
                borderRadius: 0,
            }}
            onClick={e => {
                e.preventDefault();
                const el = document.querySelector(href);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
        >
            <span style={{ fontSize: 18 }}>{icon}</span>
            {label}
        </a>
    );
}

export default ClienteLayout;
