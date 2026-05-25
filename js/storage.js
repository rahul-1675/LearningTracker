/* storage.js - LocalStorage Persistence & Isolated Data Helper */

window.EduStorage = (() => {
    
    // Get the currently logged-in user (persisted in localStorage or sessionStorage)
    function getCurrentUser() {
        return localStorage.getItem('edu_loggedInUser') || sessionStorage.getItem('loggedInUser');
    }

    // Isolate key generation per user to prevent data cross-talk
    function getUserKey(suffix) {
        const user = getCurrentUser();
        return user ? `edu_${user}_${suffix}` : null;
    }

    function getTasks() {
        const key = getUserKey('tasks');
        if (!key) return [];
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function saveTasks(tasks) {
        const key = getUserKey('tasks');
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(tasks));
    }

    function getGoals() {
        const key = getUserKey('goals');
        if (!key) return [];
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function saveGoals(goals) {
        const key = getUserKey('goals');
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(goals));
    }

    function getTheme() {
        const key = getUserKey('theme');
        return key ? localStorage.getItem(key) || 'light' : 'light';
    }

    function saveTheme(theme) {
        const key = getUserKey('theme');
        if (!key) return;
        localStorage.setItem(key, theme);
    }

    function getPomodoroState() {
        const key = getUserKey('pomodoro');
        if (!key) return null;
        return JSON.parse(localStorage.getItem(key) || 'null');
    }

    function savePomodoroState(state) {
        const key = getUserKey('pomodoro');
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(state));
    }

    // --- Study Streak Calculation Logic 🔥 ---
    // Calculates consecutive days with at least one task completed.
    function calculateStreak() {
        const tasks = getTasks();
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
        
        if (completedTasks.length === 0) return 0;

        // Extract unique completed dates formatted as YYYY-MM-DD
        const completedDates = [...new Set(completedTasks.map(t => t.completedAt.split('T')[0]))]
            .map(dateStr => new Date(dateStr))
            .sort((a, b) => b - a); // Sort descending (newest first)

        if (completedDates.length === 0) return 0;

        const today = new Date();
        today.setHours(0,0,0,0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if the most recent completion was today or yesterday
        const mostRecent = completedDates[0];
        mostRecent.setHours(0,0,0,0);

        if (mostRecent < yesterday) {
            // Streak broken (gap of more than 1 day)
            return 0;
        }

        let streak = 0;
        let checkDate = new Date(mostRecent);

        for (let i = 0; i < completedDates.length; i++) {
            const currentDate = completedDates[i];
            currentDate.setHours(0,0,0,0);

            // Compare checkDate and currentDate
            const diffTime = Math.abs(checkDate - currentDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day, increment streak if it's the start of check
                if (streak === 0) streak = 1;
            } else if (diffDays === 1) {
                // Consecutive day
                streak++;
                checkDate = currentDate; // shift checkDate
            } else {
                // Streak broken in sequence
                break;
            }
        }

        return streak;
    }

    return {
        getCurrentUser,
        getTasks,
        saveTasks,
        getGoals,
        saveGoals,
        getTheme,
        saveTheme,
        getPomodoroState,
        savePomodoroState,
        calculateStreak
    };
})();
