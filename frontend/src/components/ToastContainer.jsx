import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import { TOAST_EVENT } from './showToast';

function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    useEffect(() => {
        const handleToast = (event) => {
        const toast = event.detail;
        setToasts((current) => [...current, toast]);
        timersRef.current[toast.id] = window.setTimeout(() => {
            setToasts((current) => current.filter((item) => item.id !== toast.id));
            delete timersRef.current[toast.id];
        }, 5000);
        };

        window.addEventListener(TOAST_EVENT, handleToast);

        return () => {
        window.removeEventListener(TOAST_EVENT, handleToast);
        Object.values(timersRef.current).forEach((timer) => window.clearTimeout(timer));
        timersRef.current = {};
        };
    }, []);

    const handleClose = (id) => {
        if (timersRef.current[id]) {
        window.clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
        }

        setToasts((current) => current.filter((toast) => toast.id !== id));
    };

    return createPortal(
        <div className="lt-toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={handleClose} />
        ))}
        </div>,
        document.body
    );
}

export default ToastContainer;
