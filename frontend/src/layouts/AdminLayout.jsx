import { useAuth } from '../auth/useAuth';

function AdminLayout({ children }) {
    const { usuario, logout } = useAuth();

    return (
        <div className="container-fluid">
        <div className="row min-vh-100">
            <aside className="col-2 bg-light border-end p-3">
            <h5>LoyalTix</h5>
            <p className="mb-1">{usuario?.email}</p>
            <p className="text-muted">{usuario?.rol}</p>
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                Cerrar sesión
            </button>
            </aside>

            <main className="col-10 p-4">{children}</main>
        </div>
        </div>
    );
}

export default AdminLayout;