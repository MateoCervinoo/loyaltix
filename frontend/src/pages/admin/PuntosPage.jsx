import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';
import ClienteSelectorModal from '../../components/ClienteSelectorModal';

function PuntosPage() {
    const { usuario } = useAuth();

    const [clienteId, setClienteId] = useState('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [showClienteModal, setShowClienteModal] = useState(false);

    const [saldo, setSaldo] = useState(null);
    const [historial, setHistorial] = useState([]);

    const [montoCompra, setMontoCompra] = useState('');
    const [descripcionCarga, setDescripcionCarga] = useState('');

    const [cantidadAjuste, setCantidadAjuste] = useState('');
    const [descripcionAjuste, setDescripcionAjuste] = useState('');

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false);

    const buscarDatosCliente = async () => {
        try {
        setError('');
        setMensaje('');
        setLoading(true);

        const [saldoRes, historialRes] = await Promise.all([
            api.get(`/puntos/cliente/${clienteId}/saldo`),
            api.get(`/puntos/cliente/${clienteId}/historial`),
        ]);

        setSaldo(saldoRes.data.saldo);
        setHistorial(historialRes.data || []);
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar los datos del cliente');
        setSaldo(null);
        setHistorial([]);
        } finally {
        setLoading(false);
        }
    };

    const handleBuscar = async (e) => {
        e.preventDefault();

        if (!clienteId) {
        setError('Debés seleccionar un cliente');
        return;
        }

        await buscarDatosCliente();
    };

    const handleSelectCliente = (cliente) => {
        setClienteId(cliente.id);
        setClienteSeleccionado(cliente);
        setShowClienteModal(false);
    };

    const handleCargarPuntos = async (e) => {
        e.preventDefault();

        try {
        setError('');
        setMensaje('');

        await api.post('/puntos/cargar', {
            cliente_id: Number(clienteId),
            monto_compra: Number(montoCompra),
            descripcion: descripcionCarga || 'Carga desde frontend',
        });

        setMensaje('Puntos cargados correctamente');
        setMontoCompra('');
        setDescripcionCarga('');
        await buscarDatosCliente();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar puntos');
        }
    };

    const handleAjuste = async (e) => {
        e.preventDefault();

        try {
        setError('');
        setMensaje('');

        await api.post('/puntos/ajustar', {
            cliente_id: Number(clienteId),
            cantidad: Number(cantidadAjuste),
            descripcion: descripcionAjuste || 'Ajuste desde frontend',
        });

        setMensaje('Ajuste realizado correctamente');
        setCantidadAjuste('');
        setDescripcionAjuste('');
        await buscarDatosCliente();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo realizar el ajuste');
        }
    };

    return (
        <div>
        <h2 className="mb-4">Puntos</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <div className="card shadow-sm mb-4">
            <div className="card-body">
            <h5 className="mb-3">Buscar cliente</h5>

            <form onSubmit={handleBuscar}>
                <div className="row g-3 align-items-end">
                <div className="col-md-5">
                    <label className="form-label">Cliente</label>
                    <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        value={
                        clienteSeleccionado
                            ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido} (ID: ${clienteSeleccionado.id})`
                            : clienteId
                            ? `Cliente ID: ${clienteId}`
                            : ''
                        }
                        readOnly
                        placeholder="Seleccionar cliente"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowClienteModal(true)}
                    >
                        Buscar
                    </button>
                    </div>
                </div>

                <div className="col-md-3">
                    <button className="btn btn-primary" type="submit" disabled={loading || !clienteId}>
                    {loading ? 'Buscando...' : 'Buscar saldo e historial'}
                    </button>
                </div>
                </div>
            </form>
            </div>
        </div>

        {(usuario?.rol === 'ADMIN' || usuario?.rol === 'VENDEDOR') && (
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="mb-3">Cargar puntos</h5>

                <form onSubmit={handleCargarPuntos}>
                <div className="row g-3">
                    <div className="col-md-4">
                    <label className="form-label">Monto de compra</label>
                    <input
                        type="number"
                        className="form-control"
                        value={montoCompra}
                        onChange={(e) => setMontoCompra(e.target.value)}
                        min="1"
                        required
                    />
                    </div>

                    <div className="col-md-8">
                    <label className="form-label">Descripción</label>
                    <input
                        type="text"
                        className="form-control"
                        value={descripcionCarga}
                        onChange={(e) => setDescripcionCarga(e.target.value)}
                    />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-success mt-3"
                    disabled={!clienteId}
                >
                    Cargar puntos
                </button>
                </form>
            </div>
            </div>
        )}

        {usuario?.rol === 'ADMIN' && (
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="mb-3">Ajuste manual</h5>

                <form onSubmit={handleAjuste}>
                <div className="row g-3">
                    <div className="col-md-4">
                    <label className="form-label">Cantidad de ajuste</label>
                    <input
                        type="number"
                        className="form-control"
                        value={cantidadAjuste}
                        onChange={(e) => setCantidadAjuste(e.target.value)}
                        required
                    />
                    <div className="form-text">
                        Usá positivo para sumar y negativo para restar.
                    </div>
                    </div>

                    <div className="col-md-8">
                    <label className="form-label">Descripción</label>
                    <input
                        type="text"
                        className="form-control"
                        value={descripcionAjuste}
                        onChange={(e) => setDescripcionAjuste(e.target.value)}
                    />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-warning mt-3"
                    disabled={!clienteId}
                >
                    Aplicar ajuste
                </button>
                </form>
            </div>
            </div>
        )}

        {saldo !== null && (
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5>Saldo actual</h5>
                <h3 className="mb-0">{saldo} puntos</h3>
            </div>
            </div>
        )}

        <div className="card shadow-sm">
            <div className="card-body">
            <h5 className="mb-3">Historial</h5>

            {historial.length === 0 ? (
                <p className="text-muted mb-0">No hay historial para mostrar.</p>
            ) : (
                <div className="table-responsive">
                <table className="table table-sm align-middle">
                    <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Descripción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {historial.map((mov) => (
                        <tr key={mov.id}>
                        <td>{new Date(mov.fecha).toLocaleString()}</td>
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

        <ClienteSelectorModal
            show={showClienteModal}
            onClose={() => setShowClienteModal(false)}
            onSelect={handleSelectCliente}
        />
        </div>
    );
}

export default PuntosPage;