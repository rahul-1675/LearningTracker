/* pomodoro.js - Advanced Session-Persistent Pomodoro Timer Widget */

window.EduPomodoro = (() => {
    let timerInterval = null;
    
    // Configurations in seconds
    const MODES = {
        work: { duration: 25 * 60, label: 'Focus Time' },
        break: { duration: 5 * 60, label: 'Short Break' }
    };

    let state = {
        mode: 'work',
        duration: MODES.work.duration,
        elapsed: 0,
        isTicking: false,
        startTime: 0
    };

    function loadState() {
        const saved = EduStorage.getPomodoroState();
        if (saved) {
            state = saved;
            // If it was ticking, calculate actual elapsed time since start
            if (state.isTicking) {
                const now = Date.now();
                const deltaSeconds = Math.floor((now - state.startTime) / 1000);
                state.elapsed += deltaSeconds;
                state.startTime = now; // Shift start time to now for subsequent calculations
                
                if (state.elapsed >= state.duration) {
                    // Completed while offline/on another page
                    state.elapsed = state.duration;
                    state.isTicking = false;
                    handleTimerEnd(false); // End silently without alarm burst
                }
            }
        }
    }

    function saveState() {
        EduStorage.savePomodoroState(state);
    }

    // Sound alert generator using Web Audio API (cross-browser synthetic beep)
    function playChime() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Premium double beep
            const playBeep = (time, freq) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.frequency.value = freq;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.5, time + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
                
                osc.start(time);
                osc.stop(time + 0.45);
            };

            const now = audioCtx.currentTime;
            playBeep(now, 587.33); // D5
            playBeep(now + 0.25, 880); // A5
        } catch (e) {
            console.warn('Web Audio chime blocked or not supported:', e);
        }
    }

    function updateDisplay() {
        const displayEl = document.querySelector('.pomodoro-time');
        const labelEl = document.querySelector('.pomodoro-label');
        const displayWrapper = document.querySelector('.pomodoro-display');
        const playBtn = document.getElementById('pomodoroPlayBtn');

        if (!displayEl) return;

        const remaining = Math.max(0, state.duration - state.elapsed);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        
        displayEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (labelEl) {
            labelEl.textContent = MODES[state.mode].label;
        }

        // Ticking visual transitions
        if (displayWrapper) {
            if (state.isTicking) {
                displayWrapper.classList.add('ticking');
                if (state.mode === 'break') {
                    displayWrapper.classList.add('break');
                } else {
                    displayWrapper.classList.remove('break');
                }
            } else {
                displayWrapper.classList.remove('ticking', 'break');
            }
        }

        // Play/Pause button text
        if (playBtn) {
            if (state.isTicking) {
                playBtn.textContent = '⏸️';
                playBtn.title = 'Pause Timer';
            } else {
                playBtn.textContent = '▶️';
                playBtn.title = 'Start Timer';
            }

            if (state.mode === 'break') {
                playBtn.classList.add('break');
            } else {
                playBtn.classList.remove('break');
            }
        }

        // Sync mode buttons
        const modeButtons = document.querySelectorAll('.pomodoro-mode-btn');
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === state.mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function startTimer() {
        if (state.isTicking) return;
        
        state.isTicking = true;
        state.startTime = Date.now();
        saveState();
        
        timerInterval = setInterval(tick, 1000);
        updateDisplay();
        
        if (window.EduToast) {
            EduToast.success('Timer Started', `Get ready for some deep study focus.`);
        }
    }

    function pauseTimer() {
        if (!state.isTicking) return;
        
        clearInterval(timerInterval);
        state.isTicking = false;
        
        // Finalize elapsed time
        const elapsedSinceStart = Math.floor((Date.now() - state.startTime) / 1000);
        state.elapsed += elapsedSinceStart;
        
        saveState();
        updateDisplay();

        if (window.EduToast) {
            EduToast.info('Timer Paused', 'Take your time, then jump back in.');
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        state.isTicking = false;
        state.elapsed = 0;
        state.duration = MODES[state.mode].duration;
        
        saveState();
        updateDisplay();
        
        if (window.EduToast) {
            EduToast.info('Timer Reset', 'Timer has been set back to default.');
        }
    }

    function setMode(mode) {
        clearInterval(timerInterval);
        state.mode = mode;
        state.duration = MODES[mode].duration;
        state.elapsed = 0;
        state.isTicking = false;
        
        saveState();
        updateDisplay();
    }

    function tick() {
        const elapsedSinceStart = Math.floor((Date.now() - state.startTime) / 1000);
        const totalElapsed = state.elapsed + elapsedSinceStart;

        if (totalElapsed >= state.duration) {
            state.elapsed = state.duration;
            state.isTicking = false;
            clearInterval(timerInterval);
            handleTimerEnd(true);
        } else {
            // Update temporary UI visual representation without saving to storage every second (performance)
            const displayEl = document.querySelector('.pomodoro-time');
            if (displayEl) {
                const remaining = Math.max(0, state.duration - totalElapsed);
                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                displayEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
        }
    }

    function handleTimerEnd(shouldAlert) {
        saveState();
        updateDisplay();
        
        if (shouldAlert) {
            playChime();
        }

        if (window.EduToast) {
            if (state.mode === 'work') {
                EduToast.success('Focus Block Finished! 🏆', 'Sensational focus. Time for a well-deserved break!');
                // Auto switch to break
                setTimeout(() => {
                    setMode('break');
                }, 1500);
            } else {
                EduToast.success('Break Completed! 🎓', 'Refreshed? Let\'s lock in and get back to work!');
                // Auto switch to work
                setTimeout(() => {
                    setMode('work');
                }, 1500);
            }
        }
    }

    // Inits DOM hooks and event bounds
    function init() {
        loadState();
        
        // Build Pomodoro DOM under container if present
        const container = document.getElementById('pomodoroTimerContainer');
        if (container) {
            container.innerHTML = `
                <div class="pomodoro-widget">
                    <div class="pomodoro-modes">
                        <button class="pomodoro-mode-btn" data-mode="work">Work</button>
                        <button class="pomodoro-mode-btn" data-mode="break">Break</button>
                    </div>
                    <div class="pomodoro-display">
                        <div class="pomodoro-time">25:00</div>
                        <div class="pomodoro-label">Focus Time</div>
                    </div>
                    <div class="pomodoro-controls">
                        <button class="pomodoro-ctrl-btn play-btn" id="pomodoroPlayBtn">▶️</button>
                        <button class="pomodoro-ctrl-btn" id="pomodoroResetBtn">🔄</button>
                    </div>
                </div>
            `;
            
            // Add click events for modes
            container.querySelectorAll('.pomodoro-mode-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    setMode(btn.dataset.mode);
                });
            });

            // Toggle play
            const playBtn = document.getElementById('pomodoroPlayBtn');
            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    if (state.isTicking) {
                        pauseTimer();
                    } else {
                        startTimer();
                    }
                });
            }

            // Reset button
            const resetBtn = document.getElementById('pomodoroResetBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', resetTimer);
            }
        }

        if (state.isTicking) {
            // Keep ticking in the background
            timerInterval = setInterval(tick, 1000);
        }
        
        updateDisplay();
    }

    // Bind automatically on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        startTimer,
        pauseTimer,
        resetTimer,
        setMode
    };
})();
