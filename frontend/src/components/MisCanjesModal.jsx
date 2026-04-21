function MisCanjesModal({ show, canjes, onClose }) {
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
                <h5 className="modal-title">Mis canjes</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
                {canjes.length === 0 ? (
                <p className="text-muted mb-0">No hay canjes para mostrar.</p>
                ) : (
                <div className="table-responsive">
                    <table className="table table-sm align-middle">
                    <thead>
                        <tr>
                        <th>Código</th>
                        <th>Beneficio</th>
                        <th>Estado</th>
                        <th>Fecha creación</th>
                        <th>Fecha utilización</th>
                        </tr>
                    </thead>
                    <tbody>
                        {canjes.map((canje) => (
                        <tr key={canje.id}>
                            <td>{canje.codigo}</td>
                            <td>{canje.beneficio?.nombre || '-'}</td>
                            <td>{canje.estado}</td>
                            <td>{new Date(canje.fecha_creacion).toLocaleString()}</td>
                            <td>
                            {canje.fecha_utilizacion
                                ? new Date(canje.fecha_utilizacion).toLocaleString()
                                : '-'}
                            </td>
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

export default MisCanjesModal;