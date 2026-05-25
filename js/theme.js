/* theme.js - Light/Dark Theme Switcher Module */

window.EduTheme = (() => {
    
    // Apply theme immediately to prevent flashing
    function initTheme() {
        const savedTheme = EduStorage.getTheme();
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        EduStorage.saveTheme(theme);
        updateToggleBtnUI(theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        
        if (window.EduToast) {
            EduToast.info('Theme Updated', `Switched to ${newTheme} mode.`);
        }
    }

    function updateToggleBtnUI(theme) {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        
        const label = document.getElementById('themeToggleLabel');
        if (theme === 'dark') {
            btn.textContent = '☀️';
            btn.title = 'Switch to Light Mode';
            if (label) label.textContent = 'Dark Mode Enabled';
        } else {
            btn.textContent = '🌙';
            btn.title = 'Switch to Dark Mode';
            if (label) label.textContent = 'Light Mode Enabled';
        }
    }

    // Bind event listeners (called when DOM is fully loaded)
    function bindEvents() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
        // Update UI states
        const savedTheme = EduStorage.getTheme();
        updateToggleBtnUI(savedTheme);
    }

    // Immediate execution on load
    initTheme();

    // Bind on load
    document.addEventListener('DOMContentLoaded', bindEvents);

    return {
        getTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
        setTheme,
        toggleTheme
    };
})();
