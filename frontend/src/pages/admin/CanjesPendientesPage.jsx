import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';
import BackToDashboard from '../../components/BackToDashboard';

function CanjesPendientesPage() {
    const { usuario } = useAuth();

    const [canjes, setCanjes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const fetchCanjesPendientes = async () => {
        const res = await api.get('/canjes/pendientes');
        setCanjes(res.data || []);
    };

    useEffect(() => {
        const loadInitialData = async () => {
        try {
            await fetchCanjesPendientes();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar los canjes pendientes');
        } finally {
            setLoading(false);
        }
        };

        loadInitialData();
    }, []);

    const handleUtilizar = async (id) => {
        const confirmar = window.confirm('¿Querés marcar este canje como utilizado?');
        if (!confirmar) return;

        try {
        setError('');
        setMensaje('');

        await api.patch(`/canjes/${id}/utilizar`);
        setMensaje('Canje marcado como utilizado');
        await fetchCanjesPendientes();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo utilizar el canje');
        }
    };

    const handleCancelar = async (id) => {
        const confirmar = window.confirm('¿Querés cancelar este canje?');
        if (!confirmar) return;

        try {
        setError('');
        setMensaje('');

        await api.patch(`/canjes/${id}/cancelar`);
        setMensaje('Canje cancelado correctamente');
        await fetchCanjesPendientes();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo cancelar el canje');
        }
    };

    return (
        <div>
        <BackToDashboard />
        <h2 className="mb-4">Canjes pendientes</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <div className="card shadow-sm">
            <div className="card-body">
            {loading ? (
                <p>Cargando canjes...</p>
            ) : canjes.length === 0 ? (
                <p className="text-muted mb-0">No hay canjes pendientes.</p>
            ) : (
                <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Beneficio</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {canjes.map((canje) => (
                        <tr key={canje.id}>
                        <td>{canje.codigo}</td>
                        <td>
                            {canje.cliente
                            ? `${canje.cliente.nombre} ${canje.cliente.apellido}`
                            : canje.cliente_id}
                        </td>
                        <td>{canje.beneficio?.nombre || '-'}</td>
                        <td>{new Date(canje.fecha_creacion).toLocaleString()}</td>
                        <td>{canje.estado}</td>
                        <td className="d-flex gap-2">
                            <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleUtilizar(canje.id)}
                            >
                            Marcar utilizado
                            </button>

                            {usuario?.rol === 'ADMIN' && (
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleCancelar(canje.id)}
                            >
                                Cancelar
                            </button>
                            )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            </div>
        </div>
        </div>
    );
}

export default CanjesPendientesPage;