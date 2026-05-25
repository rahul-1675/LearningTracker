/* auth.js - User Authentication, Route Protection & Dynamic Session Greeter */

window.EduAuth = (() => {
    const protectedPages = ['dashboard.html', 'tasks.html', 'goals.html', 'calendar.html'];
    const authPages = ['login.html', 'register.html'];
    
    // Get currently logged-in user
    function getLoggedInUser() {
        return localStorage.getItem('edu_loggedInUser') || sessionStorage.getItem('loggedInUser');
    }

    function checkAuth() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        const user = getLoggedInUser();

        // Determine if currently in the /pages directory
        const inPagesFolder = path.includes('/pages/') || path.includes('\\pages\\');

        if (protectedPages.includes(page) && !user) {
            // Protected page but no user session -> redirect to login
            const redirectUrl = inPagesFolder ? 'login.html' : 'pages/login.html';
            window.location.href = redirectUrl;
        } else if (authPages.includes(page) && user) {
            // Auth page but user already logged in -> redirect to dashboard
            const redirectUrl = inPagesFolder ? 'dashboard.html' : 'pages/dashboard.html';
            window.location.href = redirectUrl;
        }
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem('edu_users') || '{}');
    }

    function register(username, password) {
        const users = getUsers();
        if (users[username.toLowerCase()]) {
            return { success: false, message: 'Username is already taken.' };
        }
        users[username.toLowerCase()] = { username, password };
        localStorage.setItem('edu_users', JSON.stringify(users));
        return { success: true };
    }

    function login(username, password, rememberMe = true) {
        const users = getUsers();
        const userRecord = users[username.toLowerCase()];
        
        if (userRecord && userRecord.password === password) {
            // Success
            if (rememberMe) {
                localStorage.setItem('edu_loggedInUser', userRecord.username);
            } else {
                sessionStorage.setItem('loggedInUser', userRecord.username);
            }
            return { success: true };
        }
        return { success: false, message: 'Invalid username or password.' };
    }

    function logout() {
        localStorage.removeItem('edu_loggedInUser');
        sessionStorage.removeItem('loggedInUser');
        
        // Redirect to login. Determine paths
        const path = window.location.pathname;
        const inPagesFolder = path.includes('/pages/') || path.includes('\\pages\\');
        const redirectUrl = inPagesFolder ? 'login.html' : 'pages/login.html';
        window.location.href = redirectUrl;
    }

    function initAuthListeners() {
        // --- Form binds ---
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('rememberMe')?.checked ?? true;
                const errorEl = document.getElementById('loginError');

                if (errorEl) errorEl.textContent = '';

                const result = login(username, password, rememberMe);
                if (result.success) {
                    if (window.EduToast) EduToast.success('Login Successful', `Welcome back, ${username}!`);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    if (errorEl) errorEl.textContent = result.message;
                    if (window.EduToast) EduToast.error('Login Failed', result.message);
                }
            });
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const errorEl = document.getElementById('registerError');

                if (errorEl) errorEl.textContent = '';

                if (password !== confirmPassword) {
                    if (errorEl) errorEl.textContent = 'Passwords do not match.';
                    return;
                }

                if (username.length < 3) {
                    if (errorEl) errorEl.textContent = 'Username must be at least 3 characters.';
                    return;
                }

                const result = register(username, password);
                if (result.success) {
                    if (window.EduToast) EduToast.success('Account Created', 'Registration successful! Directing to login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    if (errorEl) errorEl.textContent = result.message;
                    if (window.EduToast) EduToast.error('Registration Failed', result.message);
                }
            });
        }

        // --- Logout Button binds ---
        const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-trigger');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        });

        // --- Greeter & Active Session elements ---
        const usernameDisplay = document.getElementById('loggedInUsername');
        const user = getLoggedInUser();
        if (usernameDisplay && user) {
            usernameDisplay.textContent = user;
        }

        // --- Responsive Sidebar Toggle binds ---
        const sidebar = document.querySelector('.sidebar');
        const openBtn = document.querySelector('.open-sidebar-btn');
        const closeBtn = document.querySelector('.close-sidebar-btn');
        const overlay = document.querySelector('.overlay');

        if (openBtn && sidebar && overlay) {
            openBtn.addEventListener('click', () => {
                sidebar.classList.add('is-open');
                overlay.classList.add('is-visible');
            });
        }
        if (closeBtn && sidebar && overlay) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('is-open');
                overlay.classList.remove('is-visible');
            });
        }
        if (overlay && sidebar) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('is-open');
                overlay.classList.remove('is-visible');
            });
        }
    }

    // Run auth check immediately
    checkAuth();

    // DOM Ready setups
    document.addEventListener('DOMContentLoaded', () => {
        initAuthListeners();

        // Register Progressive Web App Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Adjust service worker path relative to the active directory structure
                const isPages = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
                const swPath = isPages ? '../sw.js' : './sw.js';
                
                navigator.serviceWorker.register(swPath)
                    .then(reg => console.log('[PWA] Service Worker registered with scope:', reg.scope))
                    .catch(err => console.error('[PWA] Service Worker registration failed:', err));
            });
        }
    });

    return {
        getLoggedInUser,
        logout,
        checkAuth
    };
})();
