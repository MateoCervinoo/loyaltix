import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';
import ConfirmModal from '../../components/ConfirmModal';
import BackToDashboard from '../../components/BackToDashboard';
import { showToast } from '../../components/showToast';

function CanjesPendientesPage() {
    const { usuario } = useAuth();

    const [canjes, setCanjes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmAction, setConfirmAction] = useState(null);

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
            showToast(err.response?.data?.message || 'No se pudieron cargar los canjes', 'error');
        } finally {
            setLoading(false);
        }
        };

        loadInitialData();
    }, []);

    const utilizarCanje = async (id) => {
        try {
        await api.patch(`/canjes/${id}/utilizar`);
        showToast('Canje utilizado', 'success');
        await fetchCanjesPendientes();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudo utilizar el canje', 'error');
        }
    };

    const cancelarCanje = async (id) => {
        try {
        await api.patch(`/canjes/${id}/cancelar`);
        showToast('Canje cancelado', 'success');
        await fetchCanjesPendientes();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudo cancelar el canje', 'error');
        }
    };

    const handleUtilizar = (id) => {
        setConfirmAction({
        message: '¿Querés marcar este canje como utilizado?',
        onConfirm: () => utilizarCanje(id),
        });
    };

    const handleCancelar = (id) => {
        setConfirmAction({
        message: '¿Querés cancelar este canje?',
        onConfirm: () => cancelarCanje(id),
        });
    };

    const handleConfirm = () => {
        const action = confirmAction?.onConfirm;
        setConfirmAction(null);
        action?.();
    };

    return (
        <div>
                <BackToDashboard />
            <h2 className="mb-4">Canjes pendientes</h2>

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
        <ConfirmModal
            show={Boolean(confirmAction)}
            message={confirmAction?.message}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
        />
        </div>
    );
}

export default CanjesPendientesPage;
