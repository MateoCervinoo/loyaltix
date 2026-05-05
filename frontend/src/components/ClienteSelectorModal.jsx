import { useEffect, useState } from 'react';
import api from '../api/axios';

function ClienteSelectorModal({ show, onClose, onSelect }) {
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchClientes = async (q = busqueda) => {
        const res = await api.get('/clientes', {
        params: { q },
        });
        setClientes(res.data || []);
    };

    useEffect(() => {
        if (!show) return;

        const loadInitialData = async () => {
        try {
            setLoading(true);
            setError('');
            setBusqueda('');
            await fetchClientes('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar los clientes');
        } finally {
            setLoading(false);
        }
        };

        loadInitialData();
    }, [show]);

    useEffect(() => {
        if (!show) return;

        const loadClientes = async () => {
        try {
            setLoading(true);
            setError('');
            await fetchClientes(busqueda);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar los clientes');
        } finally {
            setLoading(false);
        }
        };

        loadClientes();
    }, [busqueda]);

    if (!show) return null;

    return (
        <div
        className="modal show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
        <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">Seleccionar cliente</h5>
                <button
                type="button"
                className="btn-close"
                onClick={onClose}
                ></button>
            </div>

            <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                <label className="form-label">Buscar por nombre, apellido, teléfono o código externo</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre, teléfono o código..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                </div>

                {loading ? (
                <p>Cargando clientes...</p>
                ) : clientes.length === 0 ? (
                <p className="text-muted mb-0">No se encontraron clientes.</p>
                ) : (
                <div className="table-responsive">
                    <table className="table align-middle">
                    <thead>
                        <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Teléfono</th>
                        <th>Código externo</th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map((cliente) => (
                        <tr key={cliente.id}>
                            <td>{cliente.id}</td>
                            <td>{cliente.nombre}</td>
                            <td>{cliente.apellido}</td>
                            <td>{cliente.telefono}</td>
                            <td>{cliente.codigo_externo}</td>
                            <td>
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => onSelect(cliente)}
                            >
                                Seleccionar
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>

            <div className="modal-footer">
                <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                >
                Cerrar
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default ClienteSelectorModal;
