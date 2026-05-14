import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';
import ClienteSelectorModal from '../../components/ClienteSelectorModal';
import FormLabel from '../../components/FormLabel';
import BackToDashboard from '../../components/BackToDashboard';
import ConfirmModal from '../../components/ConfirmModal';
import { showToast } from '../../components/showToast';

const buildBulkSummary = (rows) => ({
    totalFilas: rows.length,
    validas: rows.filter((row) => row.valido).length,
    invalidas: rows.filter((row) => !row.valido).length,
    puntosTotales: rows.reduce((total, row) => total + (row.valido ? Number(row.puntos || 0) : 0), 0),
});

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
});

function BulkEditModal({ row, saving, onChange, onCancel, onSubmit }) {
    if (!row) return null;

    return createPortal(
        <div className="lt-confirm-overlay" role="presentation">
        <div
            className="lt-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-edit-title"
        >
            <h5 id="bulk-edit-title" className="lt-confirm-title">
            Editar fila {row.fila}
            </h5>

            <form onSubmit={onSubmit} className="mt-3">
            <div className="mb-3">
                <FormLabel htmlFor="bulk-identificador" required>Identificador</FormLabel>
                <input
                id="bulk-identificador"
                type="text"
                className="form-control"
                value={row.identificador}
                onChange={(e) => onChange({ ...row, identificador: e.target.value })}
                required
                />
            </div>

            <div className="mb-3">
                <FormLabel htmlFor="bulk-monto" required>Monto</FormLabel>
                <input
                id="bulk-monto"
                type="number"
                step="0.01"
                className="form-control"
                value={row.monto}
                onChange={(e) => onChange({ ...row, monto: e.target.value })}
                required
                />
            </div>

            <div className="mb-3">
                <FormLabel htmlFor="bulk-descripcion" required>Descripcion</FormLabel>
                <input
                id="bulk-descripcion"
                type="text"
                className="form-control"
                value={row.descripcion}
                onChange={(e) => onChange({ ...row, descripcion: e.target.value })}
                required
                />
            </div>

            <div className="lt-confirm-actions">
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>
                Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Validando...' : 'Guardar'}
                </button>
            </div>
            </form>
        </div>
        </div>,
        document.body
    );
}

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

    const [bulkFile, setBulkFile] = useState(null);
    const [bulkRows, setBulkRows] = useState([]);
    const [bulkSummary, setBulkSummary] = useState(null);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkConfirming, setBulkConfirming] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [savingRow, setSavingRow] = useState(false);

    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const canConfirmBulk = useMemo(
        () => bulkRows.length > 0 && bulkRows.every((row) => row.valido) && !bulkConfirming,
        [bulkRows, bulkConfirming]
    );

    const buscarDatosCliente = async () => {
        try {
        setLoading(true);

        const [saldoRes, historialRes] = await Promise.all([
            api.get(`/puntos/cliente/${clienteId}/saldo`),
            api.get(`/puntos/cliente/${clienteId}/historial`),
        ]);

        setSaldo(saldoRes.data.saldo);
        setHistorial(historialRes.data || []);
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudieron cargar los datos', 'error');
        setSaldo(null);
        setHistorial([]);
        } finally {
        setLoading(false);
        }
    };

    const handleBuscar = async (e) => {
        e.preventDefault();

        if (!clienteId) {
        showToast('Selecciona un cliente', 'error');
        return;
        }

        await buscarDatosCliente();
    };

    const handleSelectCliente = (cliente) => {
        setClienteId(cliente.id);
        setClienteSeleccionado(cliente);
        setShowClienteModal(false);
    };

    const cargarPuntos = async () => {
        try {
        await api.post('/puntos/cargar', {
            cliente_id: Number(clienteId),
            monto_compra: Number(montoCompra),
            descripcion: descripcionCarga || 'Carga desde frontend',
        });

        showToast('Puntos acreditados', 'success');
        setMontoCompra('');
        setDescripcionCarga('');
        await buscarDatosCliente();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudieron cargar puntos', 'error');
        }
    };

    const aplicarAjuste = async () => {
        try {
        await api.post('/puntos/ajustar', {
            cliente_id: Number(clienteId),
            cantidad: Number(cantidadAjuste),
            descripcion: descripcionAjuste || 'Ajuste desde frontend',
        });

        showToast('Ajuste aplicado', 'success');
        setCantidadAjuste('');
        setDescripcionAjuste('');
        await buscarDatosCliente();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudo realizar el ajuste', 'error');
        }
    };

    const handleCargarPuntos = (e) => {
        e.preventDefault();
        setConfirmAction({
        message: 'Confirmas la carga de puntos?',
        onConfirm: cargarPuntos,
        });
    };

    const handleAjuste = (e) => {
        e.preventDefault();
        setConfirmAction({
        message: 'Queres aplicar este ajuste manual?',
        onConfirm: aplicarAjuste,
        });
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();

        if (!bulkFile) {
        showToast('Selecciona un archivo Excel', 'error');
        return;
        }

        try {
        setBulkUploading(true);
        const fileBase64 = await readFileAsBase64(bulkFile);
        const res = await api.post('/puntos/bulk-preview', {
            fileName: bulkFile.name,
            fileBase64,
        });

        setBulkRows(res.data.filas || []);
        setBulkSummary(res.data.resumen || buildBulkSummary(res.data.filas || []));
        showToast('Archivo validado', 'success');
        } catch (err) {
        console.error(err);
        setBulkRows([]);
        setBulkSummary(null);
        showToast(err.response?.data?.error || err.response?.data?.message || 'No se pudo procesar el archivo', 'error');
        } finally {
        setBulkUploading(false);
        }
    };

    const updateBulkRows = (rows) => {
        setBulkRows(rows);
        setBulkSummary(buildBulkSummary(rows));
    };

    const handleDeleteBulkRow = (fila) => {
        updateBulkRows(bulkRows.filter((row) => row.fila !== fila));
    };

    const handleEditBulkRow = (row) => {
        setEditingRow({
        fila: row.fila,
        identificador: row.identificador || '',
        monto: row.monto ?? '',
        descripcion: row.descripcion || '',
        });
    };

    const handleSaveEditedRow = async (e) => {
        e.preventDefault();

        try {
        setSavingRow(true);
        const res = await api.post('/puntos/bulk-revalidate-row', editingRow);
        const updatedRows = bulkRows.map((row) => (
            row.fila === res.data.fila ? res.data : row
        ));

        updateBulkRows(updatedRows);
        setEditingRow(null);
        showToast(res.data.valido ? 'Fila validada' : 'La fila sigue invalida', res.data.valido ? 'success' : 'error');
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.error || err.response?.data?.message || 'No se pudo validar la fila', 'error');
        } finally {
        setSavingRow(false);
        }
    };

    const confirmarCargaMasiva = async () => {
        try {
        setBulkConfirming(true);
        const res = await api.post('/puntos/bulk-confirm', {
            rows: bulkRows,
        });

        showToast(res.data.message || `${res.data.movimientosCreados} movimientos acreditados`, 'success');
        setBulkFile(null);
        setBulkRows([]);
        setBulkSummary(null);
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.error || err.response?.data?.message || 'No se pudo confirmar la carga', 'error');
        } finally {
        setBulkConfirming(false);
        }
    };

    const handleConfirmBulkClick = () => {
        setConfirmAction({
        title: 'Confirmar acreditacion',
        message: `Confirmar acreditacion de ${bulkSummary?.validas || 0} movimientos por un total de ${bulkSummary?.puntosTotales || 0} puntos?`,
        confirmText: 'Confirmar carga',
        onConfirm: confirmarCargaMasiva,
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
        <h2 className="mb-4">Puntos</h2>

        <div className="card shadow-sm mb-4">
            <div className="card-body">
            <h5 className="mb-3">Buscar cliente</h5>

            <form onSubmit={handleBuscar}>
                <div className="row g-3 align-items-end">
                <div className="col-md-5">
                    <FormLabel htmlFor="cliente-selector" required>Cliente</FormLabel>
                    <div className="input-group">
                    <input
                        id="cliente-selector"
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
            <>
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="mb-3">Cargar puntos</h5>

                <form onSubmit={handleCargarPuntos}>
                <div className="row g-3">
                    <div className="col-md-4">
                    <FormLabel htmlFor="montoCompra" required>Monto de compra</FormLabel>
                    <input
                        id="montoCompra"
                        type="number"
                        className="form-control"
                        value={montoCompra}
                        onChange={(e) => setMontoCompra(e.target.value)}
                        min="1"
                        required
                    />
                    </div>

                    <div className="col-md-8">
                    <FormLabel htmlFor="descripcionCarga">Descripcion</FormLabel>
                    <input
                        id="descripcionCarga"
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

            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div>
                    <h5 className="mb-1">Carga masiva por Excel</h5>
                    <p className="text-muted mb-0">Columnas requeridas: identificador, monto, descripcion.</p>
                </div>
                {bulkSummary && (
                    <div className="d-flex flex-wrap gap-2">
                    <span className="badge text-bg-secondary">Filas: {bulkSummary.totalFilas}</span>
                    <span className="badge text-bg-success">Validas: {bulkSummary.validas}</span>
                    <span className="badge text-bg-warning">Invalidas: {bulkSummary.invalidas}</span>
                    <span className="badge text-bg-primary">Puntos: {bulkSummary.puntosTotales}</span>
                    </div>
                )}
                </div>

                <form onSubmit={handleBulkUpload}>
                <div className="row g-3 align-items-end">
                    <div className="col-md-7">
                    <FormLabel htmlFor="bulkExcel" required>Archivo Excel</FormLabel>
                    <input
                        id="bulkExcel"
                        type="file"
                        className="form-control"
                        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                    />
                    </div>

                    <div className="col-md-5 d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={bulkUploading}>
                        {bulkUploading ? 'Validando...' : 'Validar archivo'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-success"
                        disabled={!canConfirmBulk}
                        onClick={handleConfirmBulkClick}
                    >
                        {bulkConfirming ? 'Confirmando...' : 'Confirmar carga'}
                    </button>
                    </div>
                </div>
                </form>

                {bulkRows.length > 0 && (
                <div className="table-responsive mt-4">
                    <table className="table table-sm align-middle">
                    <thead>
                        <tr>
                        <th>Estado</th>
                        <th>Cliente</th>
                        <th>Monto</th>
                        <th>Puntos</th>
                        <th>Descripcion</th>
                        <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bulkRows.map((row) => (
                        <tr key={row.fila} className={row.valido ? '' : 'table-warning'}>
                            <td>
                            {row.valido ? (
                                <span className="badge text-bg-success">OK</span>
                            ) : (
                                <div>
                                <span className="badge text-bg-warning">! Fila {row.fila}</span>
                                <div className="small text-danger mt-1">{row.error}</div>
                                </div>
                            )}
                            </td>
                            <td>
                            {row.valido ? row.cliente_nombre : (
                                <span className="text-muted">{row.identificador || 'Sin identificador'}</span>
                            )}
                            </td>
                            <td>{row.monto}</td>
                            <td>{row.puntos}</td>
                            <td>{row.descripcion}</td>
                            <td>
                            <div className="d-flex gap-2">
                                <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditBulkRow(row)}
                                >
                                Editar
                                </button>
                                <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteBulkRow(row.fila)}
                                >
                                Eliminar
                                </button>
                            </div>
                            </td>
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

        {usuario?.rol === 'ADMIN' && (
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="mb-3">Ajuste manual</h5>

                <form onSubmit={handleAjuste}>
                <div className="row g-3">
                    <div className="col-md-4">
                    <FormLabel htmlFor="cantidadAjuste" required>Cantidad de ajuste</FormLabel>
                    <input
                        id="cantidadAjuste"
                        type="number"
                        className="form-control"
                        value={cantidadAjuste}
                        onChange={(e) => setCantidadAjuste(e.target.value)}
                        required
                    />
                    <div className="form-text">
                        Usa positivo para sumar y negativo para restar.
                    </div>
                    </div>

                    <div className="col-md-8">
                    <FormLabel htmlFor="descripcionAjuste">Descripcion</FormLabel>
                    <input
                        id="descripcionAjuste"
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
                        <th>Descripcion</th>
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

        <BulkEditModal
            row={editingRow}
            saving={savingRow}
            onChange={setEditingRow}
            onCancel={() => setEditingRow(null)}
            onSubmit={handleSaveEditedRow}
        />

        <ConfirmModal
            show={Boolean(confirmAction)}
            title={confirmAction?.title}
            message={confirmAction?.message}
            confirmText={confirmAction?.confirmText}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
        />
        </div>
    );
}

export default PuntosPage;
