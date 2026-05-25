/* calendar.js - Premium Interactive Study Calendar Engine */

window.EduCalendar = (() => {
    let currentDate = new Date();
    let tasks = [];
    let goals = [];

    // DOM Elements
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    
    // Day Details Modal Selectors
    const calendarDayModal = document.getElementById('calendarDayModal');
    const closeDayModalBtn = document.getElementById('closeDayModalBtn');
    const closeDayModalFooterBtn = document.getElementById('closeDayModalFooterBtn');
    const dayModalDateTitle = document.getElementById('dayModalDateTitle');
    const dayModalDetailsContent = document.getElementById('dayModalDetailsContent');

    function initCalendar() {
        tasks = EduStorage.getTasks();
        goals = EduStorage.getGoals();

        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

        // Bind Nav buttons
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
            });
        }
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
            });
        }

        // Bind Modal Close buttons
        if (closeDayModalBtn) closeDayModalBtn.addEventListener('click', closeDayModal);
        if (closeDayModalFooterBtn) closeDayModalFooterBtn.addEventListener('click', closeDayModal);
    }

    function renderCalendar(year, month) {
        if (!calendarGrid || !monthYearDisplay) return;

        // Sync local caches
        tasks = EduStorage.getTasks();
        goals = EduStorage.getGoals();

        calendarGrid.innerHTML = '';
        const today = new Date();

        // Set Month/Year Display Title
        monthYearDisplay.textContent = new Date(year, month).toLocaleString(undefined, {
            month: 'long',
            year: 'numeric'
        });

        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // 1. Render previous month other dates (fade out effect)
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const prevMonthDate = new Date(year, month - 1, dayNum);
            const dateStr = formatDateKey(prevMonthDate);

            const cell = document.createElement('div');
            cell.className = 'calendar-day other-month';
            cell.innerHTML = `<div class="day-number">${dayNum}</div>`;
            cell.addEventListener('click', () => openDayDetailsModal(dateStr));
            calendarGrid.appendChild(cell);
        }

        // 2. Render current month active dates
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            const cell = document.createElement('div');
            cell.className = `calendar-day ${isToday ? 'is-today' : ''}`;
            
            // Events list mapping
            let eventsHTML = '<div class="calendar-events">';
            
            // Add Task badges
            tasks.filter(t => t.dueDate === dateStr).forEach(t => {
                const isCompleted = t.status === 'completed';
                eventsHTML += `
                    <div class="calendar-event-dot ${isCompleted ? 'completed-task' : 'task'}" title="Task: ${t.title}">
                        ${isCompleted ? '✅' : '🕒'} ${t.title}
                    </div>
                `;
            });

            // Add Goals deadlines
            goals.filter(g => g.deadline === dateStr).forEach(g => {
                eventsHTML += `
                    <div class="calendar-event-dot goal" title="Goal Deadline: ${g.title}">
                        🎯 ${g.title}
                    </div>
                `;
            });

            eventsHTML += '</div>';

            cell.innerHTML = `
                <div class="day-number">${i}</div>
                ${eventsHTML}
            `;

            // Bind click detail modal opening
            cell.addEventListener('click', () => openDayDetailsModal(dateStr));
            calendarGrid.appendChild(cell);
        }

        // 3. Render next month other dates to fill grid (42 slots total)
        const totalRendered = firstDayIndex + daysInMonth;
        const remainingSlots = 42 - totalRendered;
        for (let i = 1; i <= remainingSlots; i++) {
            const nextMonthDate = new Date(year, month + 1, i);
            const dateStr = formatDateKey(nextMonthDate);

            const cell = document.createElement('div');
            cell.className = 'calendar-day other-month';
            cell.innerHTML = `<div class="day-number">${i}</div>`;
            cell.addEventListener('click', () => openDayDetailsModal(dateStr));
            calendarGrid.appendChild(cell);
        }
    }

    function formatDateKey(dateObj) {
        const yr = dateObj.getFullYear();
        const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dy = String(dateObj.getDate()).padStart(2, '0');
        return `${yr}-${mo}-${dy}`;
    }

    function openDayDetailsModal(dateStr) {
        if (!calendarDayModal || !dayModalDetailsContent || !dayModalDateTitle) return;

        tasks = EduStorage.getTasks();
        goals = EduStorage.getGoals();

        // 1. Format title
        const parsedDate = new Date(dateStr + 'T00:00:00');
        dayModalDateTitle.textContent = parsedDate.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 2. Fetch events matching this date
        const dayTasks = tasks.filter(t => t.dueDate === dateStr);
        const dayGoals = goals.filter(g => g.deadline === dateStr);

        dayModalDetailsContent.innerHTML = '';

        if (dayTasks.length === 0 && dayGoals.length === 0) {
            dayModalDetailsContent.innerHTML = `
                <div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
                    <p style="font-weight:600; font-size:1rem;">☕ No Scheduled items</p>
                    <p style="font-size:0.8rem; margin-top:0.15rem;">No tasks due or milestones set for this day.</p>
                </div>
            `;
            calendarDayModal.classList.add('visible');
            return;
        }

        // --- Render Tasks Section ---
        if (dayTasks.length > 0) {
            const taskHeader = document.createElement('h4');
            taskHeader.style.marginBottom = '0.5rem';
            taskHeader.style.color = 'var(--primary)';
            taskHeader.textContent = '📚 Study Tasks Due';
            dayModalDetailsContent.appendChild(taskHeader);

            const taskList = document.createElement('div');
            taskList.className = 'task-list';
            taskList.style.marginBottom = '1.5rem';

            dayTasks.forEach(task => {
                const item = document.createElement('div');
                item.className = 'task-item glass-card';
                item.style.padding = '0.75rem 1rem';
                item.style.gap = '0.75rem';
                item.style.boxShadow = 'none';

                const isCompleted = task.status === 'completed';

                item.innerHTML = `
                    <input type="checkbox" id="modal-task-${task.id}" ${isCompleted ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:var(--primary);">
                    <div class="task-content ${isCompleted ? 'completed' : ''}" style="margin-top:-2px;">
                        <h5 style="font-weight: 700; font-size:0.9rem; color:var(--text-primary);">${task.title}</h5>
                        <div class="subject" style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--primary);">${task.subject || 'General'}</div>
                    </div>
                `;

                // Handle Checkbox clicks directly inside day modal (updates dashboard metrics immediately!)
                const checkbox = item.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', (e) => {
                    toggleTaskStatusInCalendar(task.id, dateStr);
                });

                taskList.appendChild(item);
            });
            dayModalDetailsContent.appendChild(taskList);
        }

        // --- Render Goals Section ---
        if (dayGoals.length > 0) {
            const goalHeader = document.createElement('h4');
            goalHeader.style.marginBottom = '0.5rem';
            goalHeader.style.color = 'var(--success)';
            goalHeader.textContent = '🎯 Academic Milestones';
            dayModalDetailsContent.appendChild(goalHeader);

            const goalList = document.createElement('div');
            goalList.className = 'goal-list';
            goalList.style.gridTemplateColumns = '1fr';

            dayGoals.forEach(goal => {
                let progress = 0;
                if (goal.milestones && goal.milestones.length > 0) {
                    const completed = goal.milestones.filter(m => m.completed).length;
                    progress = Math.round((completed / goal.milestones.length) * 100);
                }

                const item = document.createElement('div');
                item.className = 'goal-card glass-card';
                item.style.padding = '0.75rem 1rem';
                item.style.boxShadow = 'none';

                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; font-weight:700; font-size:0.9rem; margin-bottom:0.25rem;">
                        <span style="color:var(--text-primary);">${goal.title}</span>
                        <span style="color:var(--success);">${progress}%</span>
                    </div>
                    <div class="progress-bar-bg" style="height:6px;">
                        <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                    </div>
                `;
                goalList.appendChild(item);
            });
            dayModalDetailsContent.appendChild(goalList);
        }

        calendarDayModal.classList.add('visible');
    }

    function toggleTaskStatusInCalendar(taskId, dateStr) {
        tasks = EduStorage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            const isCompleted = task.status === 'completed';
            if (isCompleted) {
                task.status = 'pending';
                delete task.completedAt;
            } else {
                task.status = 'completed';
                task.completedAt = new Date().toISOString();
            }

            EduStorage.saveTasks(tasks);
            
            // Re-render grid cell markings
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
            
            // Refresh modal list live!
            openDayDetailsModal(dateStr);

            if (window.EduToast) {
                EduToast.success('Status Synced', `Task status updated to "${task.status}".`);
            }
        }
    }

    function closeDayModal() {
        if (calendarDayModal) calendarDayModal.classList.remove('visible');
    }

    // Auto initialize calendar on DOM Content load
    document.addEventListener('DOMContentLoaded', initCalendar);

    return {
        initCalendar,
        renderCalendar,
        openDayDetailsModal,
        closeDayModal
    };
})();
