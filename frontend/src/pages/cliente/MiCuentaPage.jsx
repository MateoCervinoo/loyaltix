import { useEffect, useState } from 'react';
import api from '../../api/axios';

function MiCuentaPage() {
    const [saldo, setSaldo] = useState(0);
    const [historial, setHistorial] = useState([]);
    const [beneficios, setBeneficios] = useState([]);

    const [loadingSaldo, setLoadingSaldo] = useState(true);
    const [loadingHistorial, setLoadingHistorial] = useState(true);
    const [loadingBeneficios, setLoadingBeneficios] = useState(true);

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const cargarDatos = async () => {
        try {
        setError('');
        setMensaje('');

        setLoadingSaldo(true);
        setLoadingHistorial(true);
        setLoadingBeneficios(true);

        const [saldoRes, historialRes, beneficiosRes] = await Promise.all([
            api.get('/puntos/mis-puntos'),
            api.get('/puntos/mi-historial'),
            api.get('/beneficios'),
        ]);

        setSaldo(saldoRes.data.saldo || 0);
        setHistorial(historialRes.data || []);
        setBeneficios(beneficiosRes.data || []);
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar los datos');
        } finally {
        setLoadingSaldo(false);
        setLoadingHistorial(false);
        setLoadingBeneficios(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleCanjear = async (beneficioId) => {
        try {
        setError('');
        setMensaje('');

        await api.post('/puntos/canjear', {
            beneficio_id: beneficioId,
            descripcion: 'Canje realizado desde frontend',
        });

        setMensaje('Canje realizado correctamente');
        await cargarDatos();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo realizar el canje');
        }
    };

    return (
        <div className="container py-3">
        <h2 className="mb-4">Mi cuenta</h2>

        {error && (
            <div className="alert alert-danger" role="alert">
            {error}
            </div>
        )}

        {mensaje && (
            <div className="alert alert-success" role="alert">
            {mensaje}
            </div>
        )}

        <div className="row g-4">
            <div className="col-md-4">
            <div className="card shadow-sm">
                <div className="card-body">
                <h5 className="card-title">Saldo actual</h5>
                {loadingSaldo ? (
                    <p className="mb-0">Cargando...</p>
                ) : (
                    <h3 className="mb-0">{saldo} puntos</h3>
                )}
                </div>
            </div>
            </div>
        </div>

        <div className="row g-4 mt-1">
            <div className="col-lg-7">
            <div className="card shadow-sm">
                <div className="card-body">
                <h5 className="card-title mb-3">Historial de movimientos</h5>

                {loadingHistorial ? (
                    <p>Cargando historial...</p>
                ) : historial.length === 0 ? (
                    <p className="text-muted mb-0">No hay movimientos todavía.</p>
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

            <div className="col-lg-5">
            <div className="card shadow-sm">
                <div className="card-body">
                <h5 className="card-title mb-3">Beneficios disponibles</h5>

                {loadingBeneficios ? (
                    <p>Cargando beneficios...</p>
                ) : beneficios.length === 0 ? (
                    <p className="text-muted mb-0">No hay beneficios disponibles.</p>
                ) : (
                    <div className="d-flex flex-column gap-3">
                    {beneficios.map((beneficio) => (
                        <div key={beneficio.id} className="border rounded p-3">
                        <h6 className="mb-1">{beneficio.nombre}</h6>
                        <p className="mb-2 text-muted">{beneficio.descripcion}</p>
                        <p className="mb-2">
                            <strong>{beneficio.puntos_requeridos}</strong> puntos
                        </p>

                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCanjear(beneficio.id)}
                            disabled={saldo < beneficio.puntos_requeridos}
                        >
                            Canjear
                        </button>

                        {saldo < beneficio.puntos_requeridos && (
                            <div className="form-text text-danger">
                            No tenés saldo suficiente
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default MiCuentaPage;