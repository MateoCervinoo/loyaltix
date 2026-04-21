import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import BeneficioDetalleModal from '../../components/BeneficioDetalleModal';
import HistorialCompletoModal from '../../components/HistorialCompletoModal';

function MiCuentaPage() {
    const [saldo, setSaldo] = useState(0);
    const [historial, setHistorial] = useState([]);
    const [beneficios, setBeneficios] = useState([]);

    const [beneficioSeleccionado, setBeneficioSeleccionado] = useState(null);
    const [showBeneficioModal, setShowBeneficioModal] = useState(false);

    const [showHistorialModal, setShowHistorialModal] = useState(false);

    const [loadingSaldo, setLoadingSaldo] = useState(true);
    const [loadingHistorial, setLoadingHistorial] = useState(true);
    const [loadingBeneficios, setLoadingBeneficios] = useState(true);

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const fetchDatos = async () => {
        const [saldoRes, historialRes, beneficiosRes] = await Promise.all([
        api.get('/puntos/mis-puntos'),
        api.get('/puntos/mi-historial'),
        api.get('/beneficios'),
        ]);

        setSaldo(saldoRes.data.saldo || 0);
        setHistorial(historialRes.data || []);
        setBeneficios(beneficiosRes.data || []);
    };

    const recargarDatos = async () => {
        try {
        setError('');
        setMensaje('');
        setLoadingSaldo(true);
        setLoadingHistorial(true);
        setLoadingBeneficios(true);

        await fetchDatos();
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
        const loadInitialData = async () => {
        try {
            setError('');
            setMensaje('');
            await fetchDatos();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar los datos');
        } finally {
            setLoadingSaldo(false);
            setLoadingHistorial(false);
            setLoadingBeneficios(false);
        }
        };

        loadInitialData();
    }, []);

    const ultimosMovimientos = useMemo(() => historial.slice(0, 5), [historial]);

    const handleOpenBeneficio = (beneficio) => {
        setBeneficioSeleccionado(beneficio);
        setShowBeneficioModal(true);
    };

    const handleCloseBeneficio = () => {
        setBeneficioSeleccionado(null);
        setShowBeneficioModal(false);
    };

    const handleCanjear = async (beneficioId) => {
        const confirmar = window.confirm('¿Querés canjear este beneficio?');
        if (!confirmar) return;

        try {
        setError('');
        setMensaje('');

        await api.post('/puntos/canjear', {
            beneficio_id: beneficioId,
            descripcion: 'Canje realizado desde frontend',
        });

        setMensaje('Canje realizado correctamente');
        handleCloseBeneficio();
        await recargarDatos();
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

        <div className="row g-4 mb-4">
            <div className="col-lg-4">
            <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-title">Saldo actual</h5>
                {loadingSaldo ? (
                    <p className="mb-0">Cargando...</p>
                ) : (
                    <h2 className="mb-0">{saldo} puntos</h2>
                )}
                </div>
            </div>
            </div>

            <div className="col-lg-8">
            <div className="card shadow-sm h-100">
                <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Últimos movimientos</h5>
                    <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowHistorialModal(true)}
                    disabled={historial.length === 0}
                    >
                    Ver todos
                    </button>
                </div>

                {loadingHistorial ? (
                    <p className="mb-0">Cargando historial...</p>
                ) : ultimosMovimientos.length === 0 ? (
                    <p className="text-muted mb-0">No hay movimientos todavía.</p>
                ) : (
                    <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                        <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Descripción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {ultimosMovimientos.map((mov) => (
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
        </div>

        <div className="card shadow-sm">
            <div className="card-body">
            <h5 className="card-title mb-3">Beneficios disponibles</h5>

            {loadingBeneficios ? (
                <p>Cargando beneficios...</p>
            ) : beneficios.length === 0 ? (
                <p className="text-muted mb-0">No hay beneficios disponibles.</p>
            ) : (
                <div className="row g-3">
                {beneficios.map((beneficio) => (
                    <div key={beneficio.id} className="col-xl-3 col-lg-4 col-md-6">
                    <div
                        className="card h-100 shadow-sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenBeneficio(beneficio)}
                    >
                        {beneficio.imagen_url && (
                        <img
                            src={beneficio.imagen_url}
                            alt={beneficio.nombre}
                            className="card-img-top"
                            style={{ height: '180px', objectFit: 'cover' }}
                        />
                        )}

                        <div className="card-body">
                        <h6 className="card-title">{beneficio.nombre}</h6>
                        <p className="card-text mb-0">
                            <strong>{beneficio.puntos_requeridos}</strong> puntos
                        </p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>

        <BeneficioDetalleModal
            show={showBeneficioModal}
            beneficio={beneficioSeleccionado}
            saldo={saldo}
            onClose={handleCloseBeneficio}
            onCanjear={handleCanjear}
        />

        <HistorialCompletoModal
            show={showHistorialModal}
            historial={historial}
            onClose={() => setShowHistorialModal(false)}
        />
        </div>
    );
}

export default MiCuentaPage;