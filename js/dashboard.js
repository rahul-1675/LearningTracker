/* dashboard.js - Comprehensive Dashboard Management & Analytics Engine */

window.EduDashboard = (() => {
    let productivityChart = null;

    function initDashboard() {
        // 1. Set current date display
        const dateText = document.getElementById('dateText');
        if (dateText) {
            dateText.textContent = new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // 2. Render quotes
        const quoteBox = document.getElementById('quoteSection');
        if (quoteBox) {
            EduQuotes.renderQuote(quoteBox);
            quoteBox.addEventListener('click', () => EduQuotes.renderQuote(quoteBox));
        }

        // 3. Compute and populate metrics
        calculateAndRenderMetrics();

        // 4. Render lists
        renderUpcomingDeadlines();
        renderGoalsProgression();

        // 5. Initialize Chart
        renderProductivityTrendChart();

        // Listen for storage changes or theme updates to redraw chart beautifully
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                // Re-render chart with correct theme colors after a micro-timeout
                setTimeout(renderProductivityTrendChart, 100);
            });
        }
    }

    function calculateAndRenderMetrics() {
        const tasks = EduStorage.getTasks();
        const goals = EduStorage.getGoals();

        // --- Tasks statistics ---
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        
        const totalTasksEl = document.getElementById('totalTasksStat');
        const completedTasksEl = document.getElementById('completedTasksStat');

        if (totalTasksEl) totalTasksEl.textContent = totalTasks;
        if (completedTasksEl) completedTasksEl.textContent = `${completedTasks} completed`;

        // --- Streak ---
        const streak = EduStorage.calculateStreak();
        const streakEl = document.getElementById('streakStat');
        const streakDetailEl = document.getElementById('streakDetailStat');

        if (streakEl) streakEl.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
        if (streakDetailEl) {
            if (streak > 0) {
                streakDetailEl.textContent = 'Streak is hot! 🔥 Keep focused.';
            } else {
                streakDetailEl.textContent = 'Complete tasks to start a streak!';
            }
        }

        // --- Productivity & Grade ---
        const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const prodEl = document.getElementById('productivityStat');
        const gradeDetailEl = document.getElementById('gradeDetailStat');

        if (prodEl) prodEl.textContent = `${productivity}%`;
        if (gradeDetailEl) {
            let grade = 'N/A';
            let message = 'Get started!';
            if (totalTasks > 0) {
                if (productivity >= 90) { grade = 'A+'; message = 'Sensationally active! 🏆'; }
                else if (productivity >= 80) { grade = 'A'; message = 'Excellent focus! 🌟'; }
                else if (productivity >= 70) { grade = 'B+'; message = 'Good consistency! 👍'; }
                else if (productivity >= 60) { grade = 'B'; message = 'Steady progress! Keep going.'; }
                else if (productivity >= 50) { grade = 'C'; message = 'Making strides!'; }
                else { grade = 'D'; message = 'Time to ramp up!'; }
            }
            gradeDetailEl.textContent = `Grade: ${grade} (${message})`;
        }

        // --- Study Time ---
        // Sum total estimated time of all tasks & completed tasks
        const taskMinutes = tasks.reduce((sum, t) => sum + Number(t.time || 0), 0);
        const goalMinutes = goals.reduce((sum, g) => sum + Number(g.time || 0), 0);
        const totalHours = ((taskMinutes + goalMinutes) / 60).toFixed(1);

        const studyHoursEl = document.getElementById('studyHoursStat');
        const timeDetailEl = document.getElementById('timeDetailStat');

        if (studyHoursEl) studyHoursEl.textContent = `${totalHours} hrs`;
        if (timeDetailEl) {
            const completedMinutes = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + Number(t.time || 0), 0);
            const completedHours = (completedMinutes / 60).toFixed(1);
            timeDetailEl.textContent = `${completedHours} hrs achieved`;
        }
    }

    function renderUpcomingDeadlines() {
        const container = document.getElementById('upcomingTasksContainer');
        if (!container) return;

        const tasks = EduStorage.getTasks();
        const upcoming = tasks
            .filter(t => t.status !== 'completed' && t.dueDate)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 4);

        container.innerHTML = '';

        if (upcoming.length === 0) {
            container.innerHTML = `<p style="padding: 0.5rem 0; color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">No upcoming deadlines. Great job!</p>`;
            return;
        }

        upcoming.forEach(task => {
            const item = document.createElement('div');
            item.className = 'upcoming-task-item';
            
            const dueDate = new Date(task.dueDate + 'T00:00:00');
            const formattedDate = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            item.innerHTML = `
                <div class="info">
                    <h4>${task.title}</h4>
                    <p>${task.subject || 'No Category'}</p>
                </div>
                <div class="due-date">${formattedDate}</div>
            `;
            container.appendChild(item);
        });
    }

    function renderGoalsProgression() {
        const container = document.getElementById('dashboardGoalsContainer');
        if (!container) return;

        const goals = EduStorage.getGoals();
        container.innerHTML = '';

        if (goals.length === 0) {
            container.innerHTML = `<p style="padding: 0.5rem 0; color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">No goals established yet. Start planning!</p>`;
            return;
        }

        // Render top 3 goals
        goals.slice(0, 3).forEach(goal => {
            let progress = 0;
            if (goal.milestones && goal.milestones.length > 0) {
                const completed = goal.milestones.filter(m => m.completed).length;
                progress = Math.round((completed / goal.milestones.length) * 100);
            }

            const item = document.createElement('div');
            item.className = 'progress-item';
            item.style.marginBottom = '0.75rem';
            
            item.innerHTML = `
                <div class="progress-bar-meta" style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:0.25rem;">
                    <span style="color:var(--text-primary); white-space:nowrap; text-overflow:ellipsis; overflow:hidden; max-width:80%;">${goal.title}</span>
                    <span style="color:var(--primary);">${progress}%</span>
                </div>
                <div class="progress-bar-bg" style="width:100%; height:6px; background:var(--border-color); border-radius:var(--radius-full); overflow:hidden;">
                    <div class="progress-bar-fill" style="width:${progress}%; height:100%; background:linear-gradient(90deg, var(--primary) 0%, var(--info) 100%); border-radius:var(--radius-full);"></div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // --- Chart.js Weekly completed tasks aggregator ---
    function renderProductivityTrendChart() {
        const canvas = document.getElementById('productivityChart');
        if (!canvas) return;

        // Destroy existing chart to prevent garbage overlays
        if (productivityChart) {
            productivityChart.destroy();
        }

        // Get past 7 dates starting from 6 days ago up to today
        const labels = [];
        const dateStrings = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
            
            // Format YYYY-MM-DD
            const yr = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dateStrings.push(`${yr}-${mo}-${day}`);
        }

        // Extract tasks data completed on each specific day
        const tasks = EduStorage.getTasks();
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);

        const chartData = dateStrings.map(dateStr => {
            return completedTasks.filter(t => t.completedAt.split('T')[0] === dateStr).length;
        });

        // Theme colors matching CSS
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const primaryColor = isDark ? '#6366f1' : '#4f46e5';
        const textColor = isDark ? '#94a3b8' : '#475569';
        const gridColor = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(226, 232, 240, 0.6)';

        const ctx = canvas.getContext('2d');
        
        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.2)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

        productivityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tasks Completed',
                    data: chartData,
                    borderColor: primaryColor,
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: primaryColor,
                    pointBorderColor: isDark ? '#111827' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1f2937' : '#0f172a',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Completed: ${context.parsed.y} ${context.parsed.y === 1 ? 'task' : 'tasks'}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: 'Plus Jakarta Sans',
                                weight: 600,
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            stepSize: 1,
                            precision: 0,
                            font: {
                                family: 'Plus Jakarta Sans',
                                weight: 500,
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    // Run on load
    document.addEventListener('DOMContentLoaded', initDashboard);

    return {
        initDashboard,
        calculateAndRenderMetrics,
        renderProductivityTrendChart
    };
})();
