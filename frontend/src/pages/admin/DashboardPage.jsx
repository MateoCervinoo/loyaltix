import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';

function DashboardPage() {
    const { usuario } = useAuth();

    const [resumen, setResumen] = useState({
        clientes: 0,
        usuarios: 0,
        beneficiosActivos: 0,
        configuracionActiva: null,
    });

    const [stats, setStats] = useState({
        clientes: 0,
        canjes: 0,
        beneficios: 0,
        puntos: 0,
    });

    const [actividadReciente, setActividadReciente] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
        try {
            setError('');

            const requests = [
            api.get('/dashboard/stats'),
            api.get('/clientes'),
            api.get('/beneficios'),
            ];

            if (usuario?.rol === 'ADMIN') {
            requests.push(api.get('/usuarios'));
            requests.push(api.get('/configuracion-puntos/activa'));
            }

            const responses = await Promise.allSettled(requests);

            const dashboardStats =
            responses[0].status === 'fulfilled' ? responses[0].value.data : null;

            const clientes =
            responses[1].status === 'fulfilled' ? responses[1].value.data || [] : [];

            const beneficios =
            responses[2].status === 'fulfilled' ? responses[2].value.data || [] : [];

            let usuarios = [];
            let configuracionActiva = null;

            if (usuario?.rol === 'ADMIN') {
            usuarios =
                responses[3]?.status === 'fulfilled' ? responses[3].value.data || [] : [];

            configuracionActiva =
                responses[4]?.status === 'fulfilled' ? responses[4].value.data : null;
            }

            setStats({
            clientes: dashboardStats?.clientes ?? clientes.length,
            canjes: dashboardStats?.canjes ?? 0,
            beneficios: dashboardStats?.beneficios ?? beneficios.filter((b) => b.activo).length,
            puntos: dashboardStats?.puntos ?? 0,
            });

            setResumen({
            clientes: clientes.length,
            usuarios: usuarios.length,
            beneficiosActivos: beneficios.filter((b) => b.activo).length,
            configuracionActiva,
            });

            const actividad = [];

            for (const cliente of clientes.slice(0, 5)) {
            try {
                const historialRes = await api.get(`/puntos/cliente/${cliente.id}/historial`);
                const movimientos = historialRes.data || [];

                movimientos.slice(0, 2).forEach((mov) => {
                actividad.push({
                    ...mov,
                    cliente_nombre: `${cliente.nombre} ${cliente.apellido}`,
                });
                });
            } catch (err) {
                console.error(err);
            }
            }

            actividad.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            setActividadReciente(actividad.slice(0, 8));
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
        };

        loadDashboard();
    }, [usuario]);

    return (
        <div>
        <h2 className="mb-4">Dashboard</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
            <p>Cargando dashboard...</p>
        ) : (
            <>
            <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm h-100 border-0">
                    <div className="card-body p-4">
                    <div className="text-muted small mb-2">Clientes</div>
                    <div className="fs-3 fw-semibold">{stats.clientes}</div>
                    </div>
                </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm h-100 border-0">
                    <div className="card-body p-4">
                    <div className="text-muted small mb-2">Canjes</div>
                    <div className="fs-3 fw-semibold">{stats.canjes}</div>
                    </div>
                </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm h-100 border-0">
                    <div className="card-body p-4">
                    <div className="text-muted small mb-2">Beneficios</div>
                    <div className="fs-3 fw-semibold">{stats.beneficios}</div>
                    </div>
                </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm h-100 border-0">
                    <div className="card-body p-4">
                    <div className="text-muted small mb-2">Puntos</div>
                    <div className="fs-3 fw-semibold">{stats.puntos}</div>
                    </div>
                </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-5">
                <div className="card shadow-sm h-100">
                    <div className="card-body">
                    <h5 className="card-title mb-3">Accesos rápidos</h5>

                    <div className="d-grid gap-2">
                        <Link className="btn btn-outline-primary" to="/clientes-admin">
                        Ir a clientes
                        </Link>

                        <Link className="btn btn-outline-primary" to="/puntos-admin">
                        Ir a puntos
                        </Link>

                        <Link className="btn btn-outline-primary" to="/beneficios-admin">
                        Ir a beneficios
                        </Link>

                        <Link className="btn btn-outline-primary" to="/canjes-admin">
                        Ir a canjes
                        </Link>

                        {usuario?.rol === 'ADMIN' && (
                        <Link className="btn btn-outline-primary" to="/configuracion-puntos-admin">
                            Ir a configuración de puntos
                        </Link>
                        )}
                    </div>
                    </div>
                </div>
                </div>

                <div className="col-lg-7">
                <div className="card shadow-sm h-100">
                    <div className="card-body">
                    <h5 className="card-title mb-3">Resumen del sistema</h5>

                    <p className="mb-2">
                        <strong>Clientes:</strong> {resumen.clientes}
                    </p>

                    {usuario?.rol === 'ADMIN' && (
                        <p className="mb-2">
                        <strong>Usuarios:</strong> {resumen.usuarios}
                        </p>
                    )}

                    <p className="mb-2">
                        <strong>Beneficios activos:</strong> {resumen.beneficiosActivos}
                    </p>

                    {usuario?.rol === 'ADMIN' && (
                        <p className="mb-0">
                        <strong>Configuración activa:</strong>{' '}
                        {resumen.configuracionActiva
                            ? `${resumen.configuracionActiva.monto_base} = ${resumen.configuracionActiva.puntos_base}`
                            : 'Sin configuración activa'}
                        </p>
                    )}
                    </div>
                </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                <h5 className="card-title mb-3">Actividad reciente</h5>

                {actividadReciente.length === 0 ? (
                    <p className="text-muted mb-0">No hay actividad reciente para mostrar.</p>
                ) : (
                    <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                        <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Descripción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {actividadReciente.map((mov) => (
                            <tr key={mov.id}>
                            <td>{new Date(mov.fecha).toLocaleString()}</td>
                            <td>{mov.cliente_nombre}</td>
                            <td>{mov.tipo}</td>
                            <td>{mov.cantidad}</td>
                            <td>{mov.descripcion}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}
                </div>
            </div>
            </>
        )}
        </div>
    );
}

export default DashboardPage;
