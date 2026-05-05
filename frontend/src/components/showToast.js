export const TOAST_EVENT = 'loyaltix:toast';

export function showToast(message, type = 'info') {
    if (!message || typeof window === 'undefined') return;

    window.dispatchEvent(
        new CustomEvent(TOAST_EVENT, {
        detail: {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            message,
            type,
        },
        })
    );
}
