function HistorialCompletoModal({ show, historial, onClose }) {
    if (!show) return null;

    return (
        <div
        className="modal show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
        <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">Historial completo</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
                {historial.length === 0 ? (
                <p className="text-muted mb-0">No hay movimientos para mostrar.</p>
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

            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default HistorialCompletoModal;