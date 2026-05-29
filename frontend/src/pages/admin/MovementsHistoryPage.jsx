import { useEffect, useState } from 'react';
import api from '../../api/axios';
import ClienteSelectorModal from '../../components/ClienteSelectorModal';
import BackToDashboard from '../../components/BackToDashboard';

function MovementsHistoryPage() {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        cliente: '',
        tipo: '',
        desde: '',
        hasta: '',
        operador: '',
    });
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const openClientModal = () => setShowClientModal(true);
    const closeClientModal = () => setShowClientModal(false);
    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setFilters((f) => ({ ...f, cliente: client.id }));
        setShowClientModal(false);
    };
    const clearClient = () => {
        setSelectedClient(null);
        setFilters((f) => ({ ...f, cliente: '' }));
    };
    const selectedClientDisplay = (c) => `${c.nombre ? c.nombre : ''} ${c.apellido ? c.apellido : ''}`.trim() || c.email || c.id;


    useEffect(() => {
        fetchMovements();
    }, []);

    // Keep selectedClient in sync if filters.cliente is cleared by other means
    useEffect(() => {
        if (!filters.cliente) setSelectedClient(null);
    }, [filters.cliente]);


    const fetchMovements = async () => {
        setLoading(true);
        try {
            // Replace with actual API and filters logic
            const res = await api.get('/puntos/movimientos', { params: filters });
            setMovimientos(res.data || []);
        } catch (err) {
            setMovimientos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = e => {
        setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleFilterSubmit = e => {
        e.preventDefault();
        fetchMovements();
    };

    return (
        <div>
            <BackToDashboard />
            <h2 className="mb-4">Historial de movimientos</h2>

            <form className="mb-3 row g-2" onSubmit={handleFilterSubmit}>
                <div className="col-md-3">
  <div className="input-group">
    <input
      name="cliente"
      className="form-control"
      placeholder="Cliente"
      value={selectedClient ? selectedClientDisplay(selectedClient) : ''}
      readOnly
      onClick={openClientModal}
      style={{ background: '#fff', cursor: 'pointer' }}
    />
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={openClientModal}
    >
      Buscar
    </button>
    {selectedClient && (
      <button
        type="button"
        className="btn btn-outline-danger"
        onClick={clearClient}
        title="Quitar cliente"
      >
        ✕
      </button>
    )}
  </div>
</div>

<ClienteSelectorModal
  show={showClientModal}
  onClose={closeClientModal}
  onSelect={handleClientSelect}
/>
                <div className="col-md-2">
                    <select name="tipo" className="form-control" value={filters.tipo} onChange={handleFilterChange}>
                        <option value="">Tipo</option>
                        <option value="CARGA">Carga</option>
                        <option value="CARGA_MASIVA">Carga masiva</option>
                        <option value="AJUSTE">Ajuste</option>
                        <option value="CANJE">Canje</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <input name="desde" type="date" className="form-control" value={filters.desde} onChange={handleFilterChange} />
                </div>
                <div className="col-md-2">
                    <input name="hasta" type="date" className="form-control" value={filters.hasta} onChange={handleFilterChange} />
                </div>
                <div className="col-md-2">
                    <input name="operador" className="form-control" placeholder="Operador" value={filters.operador} onChange={handleFilterChange} />
                </div>
                <div className="col-md-2">
                    <button type="submit" className="btn btn-primary w-100">Filtrar</button>
                </div>
            </form>

            <div className="table-responsive">
                <table className="table table-sm table-striped align-middle">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Puntos</th>
                            <th>Descripción</th>
                            <th>Operador</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center">Cargando...</td></tr>
                        ) : movimientos.length === 0 ? (
                            <tr><td colSpan="6" className="text-center text-muted">No hay movimientos.</td></tr>
                        ) : (
                            movimientos.map(mov => (
                                <tr key={mov.id}>
                                    <td>{new Date(mov.fecha).toLocaleString()}</td>
                                    <td>{mov.cliente_nombre}</td>
                                    <td><span className={`badge bg-${mov.tipo === 'CANJE' ? 'danger' : mov.tipo === 'AJUSTE' ? 'warning' : 'primary'}`}>{mov.tipo}</span></td>
                                    <td style={{color: mov.puntos > 0 ? 'green' : 'red', fontWeight:600}}>{mov.puntos > 0 ? '+' : ''}{mov.puntos}</td>
                                    <td>{mov.descripcion}</td>
                                    <td>{mov.operador_nombre}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MovementsHistoryPage;
