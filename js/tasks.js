/* tasks.js - Advanced Drag & Drop Task Manager Logic */

window.EduTasks = (() => {
    let tasks = [];
    let currentStatusFilter = 'all';
    let currentPriorityFilter = 'all';
    let searchQuery = '';

    // DOM Selectors
    const taskListContainer = document.getElementById('taskListContainer');
    const addTaskModal = document.getElementById('addTaskModal');
    const addTaskForm = document.getElementById('addTaskForm');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');
    const cancelTaskModalBtn = document.getElementById('cancelTaskModalBtn');
    const modalTitle = document.getElementById('modalTitle');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskSearchInput = document.getElementById('taskSearchInput');

    function initTasks() {
        tasks = EduStorage.getTasks();
        
        // Render lists
        loadAndRenderTasks();

        // Bind core buttons
        if (addTaskBtn) addTaskBtn.addEventListener('click', () => openModal());
        if (closeTaskModalBtn) closeTaskModalBtn.addEventListener('click', closeModal);
        if (cancelTaskModalBtn) cancelTaskModalBtn.addEventListener('click', closeModal);
        
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', handleFormSubmit);
        }

        // Search binder
        if (taskSearchInput) {
            taskSearchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                loadAndRenderTasks();
            });
        }

        // Status Tabs binders
        const tabButtons = document.querySelectorAll('#taskTabs .tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentStatusFilter = btn.dataset.filter;
                loadAndRenderTasks();
            });
        });

        // Priority Filter binders
        const prioButtons = document.querySelectorAll('.priority-filter-btn');
        prioButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                prioButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPriorityFilter = btn.dataset.priority;
                loadAndRenderTasks();
            });
        });

        // Drag over container handler to handle dynamic re-ordering
        if (taskListContainer) {
            taskListContainer.addEventListener('dragover', handleDragOver);
        }
    }

    function loadAndRenderTasks() {
        if (!taskListContainer) return;
        
        tasks = EduStorage.getTasks();

        // Apply filters
        const filtered = tasks.filter(task => {
            const matchesStatus = currentStatusFilter === 'all' || task.status === currentStatusFilter;
            const matchesPriority = currentPriorityFilter === 'all' || task.priority === currentPriorityFilter;
            
            const titleMatches = task.title.toLowerCase().includes(searchQuery);
            const subjectMatches = (task.subject || '').toLowerCase().includes(searchQuery);
            const matchesSearch = titleMatches || subjectMatches;

            return matchesStatus && matchesPriority && matchesSearch;
        });

        taskListContainer.innerHTML = '';

        if (filtered.length === 0) {
            taskListContainer.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">📚</span>
                    <p style="font-weight: 600;">No tasks found matching your filters.</p>
                </div>
            `;
            return;
        }

        filtered.forEach((task, index) => {
            const item = document.createElement('div');
            item.className = 'task-item glass-card';
            item.draggable = true;
            item.dataset.id = task.id;

            // Date conversions
            const dueDate = new Date(task.dueDate + 'T00:00:00');
            const formattedDate = dueDate.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            // Format time display
            const timeDisplay = formatTimeText(task.time);

            // Status Icon selector
            const statusIcons = {
                pending: '🕒',
                'in-progress': '⏳',
                completed: '✅'
            };
            const statusIcon = statusIcons[task.status] || '🕒';
            const statusTitle = `Status: ${task.status.replace('-', ' ')} (Click to toggle)`;

            item.innerHTML = `
                <div class="task-status-indicator" data-id="${task.id}" title="${statusTitle}">
                    ${statusIcon}
                </div>
                <div class="task-content ${task.status === 'completed' ? 'completed' : ''}">
                    <h4>${task.title}</h4>
                    <div class="subject">${task.subject || 'General'}</div>
                    ${task.description ? `<p class="description">${task.description}</p>` : ''}
                </div>
                <div class="task-meta">
                    <span class="priority-badge ${task.priority}">${task.priority}</span>
                    <div class="task-time-due">
                        <div>📅 ${formattedDate}</div>
                        <div>⏱️ ${timeDisplay}</div>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn edit-btn" data-id="${task.id}" title="Edit Task">📝</button>
                        <button class="action-btn delete-btn" data-id="${task.id}" title="Delete Task">🗑️</button>
                    </div>
                </div>
            `;

            // Bind click to status indicator
            const statusBtn = item.querySelector('.task-status-indicator');
            statusBtn.addEventListener('click', () => toggleTaskStatus(task.id));

            // Bind CRUD buttons
            item.querySelector('.edit-btn').addEventListener('click', () => openModal(task.id));
            item.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

            // Bind Drag events
            item.addEventListener('dragstart', () => item.classList.add('dragging'));
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                saveNewDragOrder();
            });

            taskListContainer.appendChild(item);
        });
    }

    function toggleTaskStatus(taskId) {
        tasks = EduStorage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            const oldStatus = task.status;
            if (oldStatus === 'pending') {
                task.status = 'in-progress';
                delete task.completedAt;
            } else if (oldStatus === 'in-progress') {
                task.status = 'completed';
                task.completedAt = new Date().toISOString(); // Tracks completed date for charts
            } else {
                task.status = 'pending';
                delete task.completedAt;
            }

            EduStorage.saveTasks(tasks);
            loadAndRenderTasks();
            
            if (window.EduToast) {
                EduToast.success('Status Updated', `Task is now marked as "${task.status.replace('-', ' ')}".`);
            }
        }
    }

    function formatTimeText(minutes) {
        if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const hrs = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hrs} hr${mins > 0 ? ` ${mins}m` : ''}`;
    }

    // Modal Handling
    function openModal(taskId = null) {
        addTaskModal.classList.add('visible');
        
        if (taskId) {
            // EDITING
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                modalTitle.textContent = 'Edit Task';
                saveTaskBtn.textContent = 'Save Changes';
                addTaskForm.dataset.editingId = taskId;

                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskSubject').value = task.subject || '';
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskDueDate').value = task.dueDate;
                document.getElementById('taskPriority').value = task.priority;
                
                // Parse time back
                const timeVal = document.getElementById('taskTimeValue');
                const timeUnit = document.getElementById('taskTimeUnit');
                
                if (task.time >= 60 && task.time % 60 === 0) {
                    timeVal.value = task.time / 60;
                    timeUnit.value = 'hours';
                } else if (task.time < 1) {
                    timeVal.value = Math.round(task.time * 60);
                    timeUnit.value = 'seconds';
                } else {
                    timeVal.value = task.time;
                    timeUnit.value = 'minutes';
                }
            }
        } else {
            // ADDING NEW
            modalTitle.textContent = 'Add New Task';
            saveTaskBtn.textContent = 'Add Task';
            addTaskForm.removeAttribute('data-editing-id');
            addTaskForm.reset();
            // Autofill today's date
            document.getElementById('taskDueDate').value = new Date().toISOString().split('T')[0];
        }
    }

    function closeModal() {
        addTaskModal.classList.remove('visible');
        addTaskForm.reset();
        addTaskForm.removeAttribute('data-editing-id');
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const editingId = addTaskForm.dataset.editingId ? Number(addTaskForm.dataset.editingId) : null;
        
        const title = document.getElementById('taskTitle').value.trim();
        const subject = document.getElementById('taskSubject').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;
        const timeVal = Number(document.getElementById('taskTimeValue').value);
        const timeUnit = document.getElementById('taskTimeUnit').value;

        // Convert estimated time to standard minutes
        let timeInMinutes = 0;
        if (timeUnit === 'hours') timeInMinutes = timeVal * 60;
        else if (timeUnit === 'seconds') timeInMinutes = timeVal / 60;
        else timeInMinutes = timeVal;

        tasks = EduStorage.getTasks();

        if (editingId) {
            // Update
            const task = tasks.find(t => t.id === editingId);
            if (task) {
                task.title = title;
                task.subject = subject;
                task.description = description;
                task.dueDate = dueDate;
                task.priority = priority;
                task.time = timeInMinutes;

                if (window.EduToast) EduToast.success('Task Saved', 'Task modifications updated successfully.');
            }
        } else {
            // Create
            const newTask = {
                id: Date.now(),
                title,
                subject,
                description,
                dueDate,
                priority,
                time: timeInMinutes,
                status: 'pending'
            };
            tasks.push(newTask);
            
            if (window.EduToast) EduToast.success('Task Added', 'New task added to your backlog.');
        }

        EduStorage.saveTasks(tasks);
        loadAndRenderTasks();
        closeModal();
    }

    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = EduStorage.getTasks();
            tasks = tasks.filter(t => t.id !== taskId);
            
            EduStorage.saveTasks(tasks);
            loadAndRenderTasks();

            if (window.EduToast) EduToast.warning('Task Deleted', 'Task was removed from your planner.');
        }
    }

    // --- HTML5 Drag and Drop Sorting Logic ---
    function handleDragOver(e) {
        e.preventDefault();
        const draggingElement = document.querySelector('.task-item.dragging');
        if (!draggingElement) return;

        const afterElement = getDragAfterElement(taskListContainer, e.clientY);
        if (afterElement == null) {
            taskListContainer.appendChild(draggingElement);
        } else {
            taskListContainer.insertBefore(draggingElement, afterElement);
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function saveNewDragOrder() {
        const renderedItems = [...taskListContainer.querySelectorAll('.task-item')];
        const newOrderedIds = renderedItems.map(item => Number(item.dataset.id));
        
        // Grab current complete tasks list from storage
        const currentTasks = EduStorage.getTasks();
        
        // Rebuild array maintaining un-rendered elements (those filtered out) and sorting the rendered ones in their new indices!
        const orderedTasks = [];
        
        // 1. First add the rendered tasks in their new order
        newOrderedIds.forEach(id => {
            const task = currentTasks.find(t => t.id === id);
            if (task) orderedTasks.push(task);
        });

        // 2. Add tasks that were not rendered due to active filter chips
        currentTasks.forEach(task => {
            if (!newOrderedIds.includes(task.id)) {
                orderedTasks.push(task);
            }
        });

        // Save
        EduStorage.saveTasks(orderedTasks);
        
        if (window.EduToast) {
            EduToast.info('Priority Saved', 'Custom priority task order updated.');
        }
    }

    // Bind initialization
    document.addEventListener('DOMContentLoaded', initTasks);

    return {
        initTasks,
        loadAndRenderTasks,
        toggleTaskStatus,
        deleteTask
    };
})();
