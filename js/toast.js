/* toast.js - Modular Premium Toast Notification System */

window.EduToast = (() => {
    let container = null;

    // Create the toast container on the fly if it doesn't exist
    function getContainer() {
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function show({ title, message, type = 'info', duration = 3000 }) {
        const toastContainer = getContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '🔔'
        };

        toast.innerHTML = `
            <div class="toast-icon">${iconMap[type] || '🔔'}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close">&times;</button>
        `;

        // Close event
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toast));

        // Auto close timer
        const timer = setTimeout(() => {
            removeToast(toast);
        }, duration);

        toast.dataset.timerId = timer;
        toastContainer.appendChild(toast);
    }

    function removeToast(toast) {
        if (toast.classList.contains('toast-out')) return;
        
        clearTimeout(Number(toast.dataset.timerId));
        toast.classList.add('toast-out');
        
        toast.addEventListener('animationend', () => {
            toast.remove();
            // Clean up container if empty
            if (container && container.children.length === 0) {
                container.remove();
                container = null;
            }
        });
    }

    return {
        show,
        success: (title, message) => show({ title, message, type: 'success' }),
        error: (title, message) => show({ title, message, type: 'error' }),
        warning: (title, message) => show({ title, message, type: 'warning' }),
        info: (title, message) => show({ title, message, type: 'info' })
    };
})();
