import { createPortal } from 'react-dom';

function ConfirmModal({
    show,
    title = 'Confirmar acción',
    message,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
}) {
    if (!show) return null;

    return createPortal(
        <div className="lt-confirm-overlay" role="presentation">
        <div
            className="lt-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lt-confirm-title"
            aria-describedby="lt-confirm-message"
        >
            <h5 id="lt-confirm-title" className="lt-confirm-title">
            {title}
            </h5>

            <p id="lt-confirm-message" className="lt-confirm-message">
            {message}
            </p>

            <div className="lt-confirm-actions">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                {cancelText}
            </button>
            <button type="button" className="btn btn-primary" onClick={onConfirm}>
                {confirmText}
            </button>
            </div>
        </div>
        </div>,
        document.body
    );
}

export default ConfirmModal;
