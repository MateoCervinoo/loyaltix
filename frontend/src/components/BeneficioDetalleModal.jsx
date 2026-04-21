function BeneficioDetalleModal({ show, beneficio, saldo, onClose, onCanjear }) {
    if (!show || !beneficio) return null;

    const sinSaldo = saldo < beneficio.puntos_requeridos;

    return (
        <div
        className="modal show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">{beneficio.nombre}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
                {beneficio.imagen_url && (
                <img
                    src={beneficio.imagen_url}
                    alt={beneficio.nombre}
                    className="img-fluid rounded mb-3"
                    style={{ width: '100%', maxHeight: '260px', objectFit: 'cover' }}
                />
                )}

                <p className="mb-2">
                <strong>Puntos requeridos:</strong> {beneficio.puntos_requeridos}
                </p>

                <p className="mb-0">
                <strong>Descripción:</strong>{' '}
                {beneficio.descripcion || 'Sin descripción'}
                </p>

                {sinSaldo && (
                <div className="alert alert-warning mt-3 mb-0">
                    No tenés saldo suficiente para canjear este beneficio.
                </div>
                )}
            </div>

            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
                </button>
                <button
                type="button"
                className="btn btn-primary"
                onClick={() => onCanjear(beneficio.id)}
                disabled={sinSaldo}
                >
                Canjear
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default BeneficioDetalleModal;