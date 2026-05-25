/* goals.js - Advanced Milestones Goal Tracker Logic */

window.EduGoals = (() => {
    let goals = [];

    // DOM Selectors
    const goalListContainer = document.getElementById('goalListContainer');
    const addGoalModal = document.getElementById('addGoalModal');
    const addGoalForm = document.getElementById('addGoalForm');
    const addGoalBtn = document.getElementById('addGoalBtn');
    const closeGoalModalBtn = document.getElementById('closeGoalModalBtn');
    const cancelGoalModalBtn = document.getElementById('cancelGoalModalBtn');
    const goalModalTitle = document.getElementById('goalModalTitle');
    const saveGoalBtn = document.getElementById('saveGoalBtn');

    // Stats
    const totalGoalsStat = document.getElementById('totalGoalsStat');
    const completedGoalsStat = document.getElementById('completedGoalsStat');
    const avgProgressStat = document.getElementById('avgProgressStat');

    function initGoals() {
        goals = EduStorage.getGoals();

        // Render initially
        loadAndRenderGoals();

        // Bind modals
        if (addGoalBtn) addGoalBtn.addEventListener('click', () => openGoalModal());
        if (closeGoalModalBtn) closeGoalModalBtn.addEventListener('click', closeGoalModal);
        if (cancelGoalModalBtn) cancelGoalModalBtn.addEventListener('click', closeGoalModal);

        if (addGoalForm) {
            addGoalForm.addEventListener('submit', handleGoalFormSubmit);
        }
    }

    function loadAndRenderGoals() {
        if (!goalListContainer) return;

        goals = EduStorage.getGoals();

        // 1. Calculate Stats
        calculateGoalStats();

        // 2. Render Grid
        goalListContainer.innerHTML = '';

        if (goals.length === 0) {
            goalListContainer.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🎯</span>
                    <p style="font-weight: 600; font-size: 1.05rem;">No goals established yet.</p>
                    <p style="font-size: 0.85rem; margin-top: 0.25rem;">Create a goal with milestones to map your academic achievements.</p>
                </div>
            `;
            return;
        }

        goals.forEach(goal => {
            const card = document.createElement('div');
            card.className = 'goal-card glass-card';
            
            // Time conversions
            const formattedTime = formatTimeText(goal.time);
            const deadlineDate = new Date(goal.deadline + 'T00:00:00');
            const formattedDeadline = deadlineDate.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });

            // Calculate progress percentage
            let progress = 0;
            if (goal.milestones && goal.milestones.length > 0) {
                const completed = goal.milestones.filter(m => m.completed).length;
                progress = Math.round((completed / goal.milestones.length) * 100);
            }

            card.innerHTML = `
                <div class="goal-card-header">
                    <div class="icon">🎯</div>
                    <div class="goal-card-info">
                        <h4>${goal.title}</h4>
                        ${goal.description ? `<p>${goal.description}</p>` : ''}
                        <div class="goal-meta">
                            <span>📅 Due: ${formattedDeadline}</span>
                            <span>⏱️ Est: ${formattedTime}</span>
                        </div>
                    </div>
                    <div class="task-actions" style="align-self: flex-start; margin-top: -0.25rem;">
                        <button class="action-btn edit-btn" data-id="${goal.id}" title="Edit Goal">📝</button>
                        <button class="action-btn delete-btn" data-id="${goal.id}" title="Delete Goal">🗑️</button>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="progress-bar-container">
                    <div class="progress-bar-meta">
                        <span style="color: var(--text-secondary);">Goal Completion</span>
                        <span style="color: var(--success);">${progress}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                    </div>
                </div>

                <!-- Milestones Checkmarks -->
                <div class="milestones-container">
                    <h5>Milestones Breakdown</h5>
                    <div class="milestones-list" data-id="${goal.id}">
                        ${goal.milestones.length > 0 ? 
                            goal.milestones.map((m, index) => `
                                <div class="milestone-item">
                                    <input type="checkbox" id="m-${goal.id}-${index}" data-goal-id="${goal.id}" data-index="${index}" ${m.completed ? 'checked' : ''}>
                                    <label for="m-${goal.id}-${index}">${m.text}</label>
                                </div>
                            `).join('') : 
                            '<p style="color: var(--text-muted); font-size: 0.8rem;">No milestones logged.</p>'
                        }
                    </div>
                </div>
            `;

            // Bind checkbox listeners
            card.querySelectorAll('.milestone-item input[type="checkbox"]').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    toggleMilestone(Number(e.target.dataset.goalId), Number(e.target.dataset.index), e.target.checked);
                });
            });

            // Bind Edit and Delete clicks
            card.querySelector('.edit-btn').addEventListener('click', () => openGoalModal(goal.id));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteGoal(goal.id));

            goalListContainer.appendChild(card);
        });
    }

    function toggleMilestone(goalId, index, isCompleted) {
        goals = EduStorage.getGoals();
        const goal = goals.find(g => g.id === goalId);
        
        if (goal && goal.milestones && goal.milestones[index]) {
            const oldMilestonesCompleted = goal.milestones.filter(m => m.completed).length;
            goal.milestones[index].completed = isCompleted;
            
            const newMilestonesCompleted = goal.milestones.filter(m => m.completed).length;
            
            EduStorage.saveGoals(goals);
            loadAndRenderGoals();

            if (window.EduToast) {
                const total = goal.milestones.length;
                if (newMilestonesCompleted === total && oldMilestonesCompleted < total) {
                    // Just became 100% complete!
                    EduToast.success('Goal Achieved! 🏆', `Outstanding! You have completed all milestones for "${goal.title}"!`);
                } else {
                    EduToast.success('Milestone Toggled', isCompleted ? 'Milestone marked as complete.' : 'Milestone reopened.');
                }
            }
        }
    }

    function calculateGoalStats() {
        if (goals.length === 0) {
            if (totalGoalsStat) totalGoalsStat.textContent = '0';
            if (completedGoalsStat) completedGoalsStat.textContent = '0';
            if (avgProgressStat) avgProgressStat.textContent = '0%';
            return;
        }

        const total = goals.length;
        
        // A goal is completed if all its milestones are completed
        const completed = goals.filter(goal => {
            if (!goal.milestones || goal.milestones.length === 0) return false;
            return goal.milestones.every(m => m.completed);
        }).length;

        // Compute average progress
        let totalProgressSum = 0;
        goals.forEach(goal => {
            if (goal.milestones && goal.milestones.length > 0) {
                const comp = goal.milestones.filter(m => m.completed).length;
                totalProgressSum += (comp / goal.milestones.length) * 100;
            }
        });
        const avgProgress = Math.round(totalProgressSum / total);

        if (totalGoalsStat) totalGoalsStat.textContent = total;
        if (completedGoalsStat) completedGoalsStat.textContent = completed;
        if (avgProgressStat) avgProgressStat.textContent = `${avgProgress}%`;
    }

    function formatTimeText(minutes) {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hrs = Math.floor(minutes / 60);
        const remaining = Math.round(minutes % 60);
        return `${hrs}h${remaining > 0 ? ` ${remaining}m` : ''}`;
    }

    // Modal Operations
    function openGoalModal(goalId = null) {
        addGoalModal.classList.add('visible');

        if (goalId) {
            // EDITING
            const goal = goals.find(g => g.id === goalId);
            if (goal) {
                goalModalTitle.textContent = 'Edit Goal';
                saveGoalBtn.textContent = 'Save Changes';
                addGoalForm.dataset.editingId = goalId;

                document.getElementById('goalTitle').value = goal.title;
                document.getElementById('goalDescription').value = goal.description || '';
                document.getElementById('goalDeadline').value = goal.deadline;
                
                // Parse time back
                const val = document.getElementById('goalTimeValue');
                const unit = document.getElementById('goalTimeUnit');
                if (goal.time >= 60 && goal.time % 60 === 0) {
                    val.value = goal.time / 60;
                    unit.value = 'hours';
                } else {
                    val.value = goal.time;
                    unit.value = 'minutes';
                }

                // Map milestones back to comma-separated
                document.getElementById('goalMilestones').value = goal.milestones.map(m => m.text).join(', ');
            }
        } else {
            // ADDING NEW
            goalModalTitle.textContent = 'Create New Goal';
            saveGoalBtn.textContent = 'Create Goal';
            addGoalForm.removeAttribute('data-editing-id');
            addGoalForm.reset();
            // Autofill 2 weeks from today as default deadline
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 14);
            document.getElementById('goalDeadline').value = futureDate.toISOString().split('T')[0];
        }
    }

    function closeGoalModal() {
        addGoalModal.classList.remove('visible');
        addGoalForm.reset();
        addGoalForm.removeAttribute('data-editing-id');
    }

    function handleGoalFormSubmit(e) {
        e.preventDefault();

        const editingId = addGoalForm.dataset.editingId ? Number(addGoalForm.dataset.editingId) : null;
        
        const title = document.getElementById('goalTitle').value.trim();
        const description = document.getElementById('goalDescription').value.trim();
        const deadline = document.getElementById('goalDeadline').value;
        const timeVal = Number(document.getElementById('goalTimeValue').value);
        const timeUnit = document.getElementById('goalTimeUnit').value;
        const milestonesInput = document.getElementById('goalMilestones').value.trim();

        // Convert focus time estimate to minutes
        const timeInMinutes = timeUnit === 'hours' ? timeVal * 60 : timeVal;

        // Extract milestones
        const milestones = milestonesInput
            .split(',')
            .map(txt => txt.trim())
            .filter(txt => txt.length > 0)
            .map(txt => ({ text: txt, completed: false }));

        goals = EduStorage.getGoals();

        if (editingId) {
            // Edit
            const goal = goals.find(g => g.id === editingId);
            if (goal) {
                const existingMilestones = goal.milestones;
                
                goal.title = title;
                goal.description = description;
                goal.deadline = deadline;
                goal.time = timeInMinutes;
                goal.milestones = milestones;

                // Sync checkbox completed state for exact milestone text matches
                goal.milestones.forEach(newMilestone => {
                    const oldMatch = existingMilestones.find(om => om.text === newMilestone.text);
                    if (oldMatch) {
                        newMilestone.completed = oldMatch.completed;
                    }
                });

                if (window.EduToast) EduToast.success('Goal Saved', 'Goal details have been successfully modified.');
            }
        } else {
            // New Goal
            const newGoal = {
                id: Date.now(),
                title,
                description,
                deadline,
                time: timeInMinutes,
                milestones
            };
            goals.push(newGoal);

            if (window.EduToast) EduToast.success('Goal Created', 'New study goal set successfully.');
        }

        EduStorage.saveGoals(goals);
        loadAndRenderGoals();
        closeGoalModal();
    }

    function deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal? All milestones will be lost.')) {
            goals = EduStorage.getGoals();
            goals = goals.filter(g => g.id !== goalId);

            EduStorage.saveGoals(goals);
            loadAndRenderGoals();

            if (window.EduToast) EduToast.warning('Goal Deleted', 'Goal was removed from your tracker.');
        }
    }

    // Bind auto initialization
    document.addEventListener('DOMContentLoaded', initGoals);

    return {
        initGoals,
        loadAndRenderGoals,
        toggleMilestone,
        deleteGoal
    };
})();
