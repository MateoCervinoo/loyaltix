const toastIcon = {
    success: '✔',
    error: '❌',
    info: 'i',
};

function Toast({ toast, onClose }) {
    const type = toast.type || 'info';

    return (
        <div className={`lt-toast lt-toast-${type}`} role="status" aria-live="polite">
        <span className="lt-toast-icon" aria-hidden="true">
            {toastIcon[type] || toastIcon.info}
        </span>
        <span className="lt-toast-message">{toast.message}</span>
        <button
            type="button"
            className="lt-toast-close"
            aria-label="Cerrar notificación"
            onClick={() => onClose(toast.id)}
        >
            ×
        </button>
        </div>
    );
}

export default Toast;
