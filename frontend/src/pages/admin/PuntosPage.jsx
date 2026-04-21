import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';

function PuntosPage() {
    const { usuario } = useAuth();

    const [clienteId, setClienteId] = useState('');
    const [montoCompra, setMontoCompra] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const [saldo, setSaldo] = useState(null);
    const [historial, setHistorial] = useState([]);

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const buscarDatosCliente = async () => {
        try {
        setError('');
        setMensaje('');

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
        }
    };

    const handleCargarPuntos = async (e) => {
        e.preventDefault();

        try {
        setError('');
        setMensaje('');

        await api.post('/puntos/cargar', {
            cliente_id: Number(clienteId),
            monto_compra: Number(montoCompra),
            descripcion: descripcion || 'Carga desde frontend',
        });

        setMensaje('Puntos cargados correctamente');
        setMontoCompra('');
        setDescripcion('');
        await buscarDatosCliente();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar puntos');
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

            <div className="row g-3 align-items-end">
                <div className="col-md-4">
                <label className="form-label">Cliente ID</label>
                <input
                    type="number"
                    className="form-control"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                />
                </div>

                <div className="col-md-3">
                <button
                    className="btn btn-primary"
                    onClick={buscarDatosCliente}
                    disabled={!clienteId}
                >
                    Buscar saldo e historial
                </button>
                </div>
            </div>
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
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
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
        </div>
    );
}

export default PuntosPage;