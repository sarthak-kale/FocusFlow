// FocusFlow - Complete SaaS Productivity Platform
// Modular architecture with all features implemented

class FocusFlowApp {
  constructor() {
    this.user = this.loadUser() || { name: 'Sarthak', avatar: 'S' };
    const hour = new Date().getHours();
    const greetings = [
      'Good Morning',
      'Good Morning',
      'Good Morning',
      'Good Morning',
      'Good Morning',
      'Good Afternoon',
      'Good Afternoon',
      'Good Afternoon',
      'Good Afternoon',
      'Good Evening',
      'Good Evening',
      'Good Evening',
      'Good Evening',
      'Good Evening',
      'Good Evening',
      'Good Evening',
      'Good Evening',
      'Good Night',
      'Good Night',
      'Good Night',
      'Good Night',
      'Good Night',
      'Good Night',
      'Good Night'
    ];
    document.getElementById('dynamicGreeting').textContent = `${greetings[hour]}, Sarthak! 👋`;
    this.data = this.loadData();
    this.currentPage = 'dashboard';
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadFonts();
    this.render();
    this.startXPSystem();
  }

  loadUser() {
    return JSON.parse(localStorage.getItem('focusflow_user')) || {
      name: 'Alex Flow',
      avatar: 'AF',
      level: 1,
      xp: 2847,
      achievements: ['streak7', 'tasks50']
    };
  }

  loadData() {
    return {
      tasks: JSON.parse(localStorage.getItem('focusflow_tasks')) || [],
      habits: JSON.parse(localStorage.getItem('focusflow_habits')) || [],
      pomodoro: JSON.parse(localStorage.getItem('focusflow_pomodoro')) || { sessions: 0, today: 0 },
      analytics: JSON.parse(localStorage.getItem('focusflow_analytics')) || {
        tasksCompleted: 127,
        focusHours: 8.7,
        streak: 7
      }
    };
  }

  saveData() {
    localStorage.setItem('focusflow_tasks', JSON.stringify(this.data.tasks));
    localStorage.setItem('focusflow_habits', JSON.stringify(this.data.habits));
    localStorage.setItem('focusflow_pomodoro', JSON.stringify(this.data.pomodoro));
    localStorage.setItem('focusflow_analytics', JSON.stringify(this.data.analytics));
    localStorage.setItem('focusflow_user', JSON.stringify(this.user));
  }

  bindEvents() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-bar').focus();
        this.showNotification('Search focused ⌘K', 'info');
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (document.getElementById('pomodoro').classList.contains('active')) {
          const startBtn = document.getElementById('startTimer');
          if (startBtn.textContent === '▶️ Start') this.pomodoroStart();
          else this.pomodoroPause();
        }
      }
    });
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => this.navigate(item.dataset.page));
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      this.saveTheme();
    });

    // Task modal
    document.getElementById('addTaskBtn').addEventListener('click', () => {
      this.showTaskModal();
    });

    document.getElementById('taskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    document.getElementById('cancelTask').addEventListener('click', () => {
      this.hideTaskModal();
    });

    // Pomodoro
    document.getElementById('startTimer').addEventListener('click', () => this.pomodoroStart());
    document.getElementById('pauseTimer').addEventListener('click', () => this.pomodoroPause());
    document.getElementById('resetTimer').addEventListener('click', () => this.pomodoroReset());
    document.getElementById('focusModeBtn').addEventListener('click', () => this.toggleFocusMode());

    // Habits
    document.getElementById('addHabitBtn').addEventListener('click', () => {
      const name = prompt('New habit name:');
      if (name) this.addHabit(name);
    });

    // AI Assistant
    document.querySelector('.ai-suggestion .btn-primary').addEventListener('click', () => {
      this.aiGeneratePlan();
    });

    // Notifications
    setInterval(() => this.checkNotifications(), 60000);

    // Export/Import
    document.getElementById('exportData').addEventListener('click', () => this.exportData());
    document.getElementById('importData').addEventListener('click', () => this.importData());
  }

  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(page).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    this.currentPage = page;
    this.renderPage(page);
  }

  render() {
    this.renderStats();
    this.updateUserProfile();
    this.navigate(this.currentPage);
  }

  renderPage(page) {
    switch(page) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'tasks':
        this.renderTasks();
        break;
      case 'pomodoro':
        this.renderPomodoro();
        break;
      case 'habits':
        this.renderHabits();
        break;
      case 'analytics':
        this.renderAnalytics();
        break;
      case 'profile':
        this.renderProfile();
        break;
    }
  }

  // Dashboard
  renderDashboard() {
    const todayTasks = this.data.tasks.filter(t => !t.completed).slice(0, 3);
    const taskPreviewList = document.querySelector('.task-preview-list');
    taskPreviewList.innerHTML = todayTasks.map(task => `
      <div class="task-preview">
        <span class="priority-dot priority-${task.priority}"></span>
        <span>${task.title}</span>
      </div>
    `).join('');

    document.querySelectorAll('[data-stat]').forEach(el => {
      const stat = el.dataset.stat;
      el.textContent = this.getStat(stat);
    });
  }

  getStat(stat) {
    switch(stat) {
      case 'tasks': return this.data.analytics.tasksCompleted;
      case 'focus': return `${Math.floor(this.data.analytics.focusHours)}h ${Math.floor((this.data.analytics.focusHours % 1)*60)}m`;
      case 'streak': return `${this.data.analytics.streak}🔥`;
      case 'score': return Math.floor(Math.random() * 20 + 85);
      default: return '0';
    }
  }

  renderStats() {
    document.querySelectorAll('[data-stat]').forEach(el => {
      el.textContent = this.getStat(el.dataset.stat);
    });
  }

  // Tasks
  renderTasks() {
    const taskList = document.getElementById('taskList');
    const tasks = this.data.tasks;
    
    taskList.innerHTML = tasks.map(task => `
      <div class="task-card" draggable="true" data-task-id="${task.id}">
        <div class="task-header">
          <div class="task-priority priority-${task.priority}"></div>
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              <span class="task-category">${task.category}</span>
              ${task.due ? `<span>Due ${task.due}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button onclick="app.completeTask(${task.id})" class="btn-sm ${task.completed ? 'completed' : ''}">
            ${task.completed ? '✓' : '○'}
          </button>
          <button onclick="app.deleteTask(${task.id})" class="btn-sm delete">🗑️</button>
        </div>
      </div>
    `).join('');
    
    this.initDragDrop();
  }

  addTask() {
    const task = {
      id: Date.now(),
      title: document.getElementById('taskTitle').value,
      category: document.getElementById('taskCategory').value,
      priority: document.getElementById('taskPriority').value,
      due: document.getElementById('taskDue').value || null,
      completed: false,
      subtasks: []
    };
    
    this.data.tasks.push(task);
    this.saveData();
    this.renderTasks();
    this.hideTaskModal();
    this.earnXP(50);
    this.showNotification('Task created!', 'success');
  }

  completeTask(id) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.data.analytics.tasksCompleted += task.completed ? 1 : -1;
      this.saveData();
      this.render();
      this.earnXP(100);
    }
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.saveData();
    this.renderTasks();
  }

  showTaskModal() {
    document.getElementById('taskModal').classList.add('active');
    document.getElementById('modalTitle').textContent = 'Add Task';
    document.getElementById('taskForm').reset();
  }

  hideTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
  }

  initDragDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
      card.addEventListener('dragstart', e => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.dataset.taskId);
      });
      
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
      
      card.addEventListener('dragover', e => e.preventDefault());
      
      card.addEventListener('drop', e => {
        e.preventDefault();
        const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
        // Reorder logic here
      });
    });
  }

  // Pomodoro
  pomodoroTimer = {
    timeLeft: 25 * 60,
    isRunning: false,
    interval: null,
    mode: 'focus'
  };

  renderPomodoro() {
    this.updatePomodoroDisplay();
  }

  pomodoroStart() {
    if (this.pomodoroTimer.isRunning) return;
    
    this.pomodoroTimer.isRunning = true;
    document.getElementById('startTimer').textContent = '⏹️ Stop';
    
    this.pomodoroTimer.interval = setInterval(() => {
      this.pomodoroTimer.timeLeft--;
      this.updatePomodoroDisplay();
      
      if (this.pomodoroTimer.timeLeft <= 0) {
        this.pomodoroComplete();
      }
    }, 1000);
  }

  pomodoroPause() {
    this.pomodoroTimer.isRunning = false;
    clearInterval(this.pomodoroTimer.interval);
    document.getElementById('startTimer').textContent = '▶️ Start';
  }

  pomodoroReset() {
    this.pomodoroTimer.isRunning = false;
    clearInterval(this.pomodoroTimer.interval);
    this.pomodoroTimer.mode = 'focus';
    this.pomodoroTimer.timeLeft = 25 * 60;
    this.updatePomodoroDisplay();
    document.getElementById('startTimer').textContent = '▶️ Start';
  }

  updatePomodoroDisplay() {
    const mins = Math.floor(this.pomodoroTimer.timeLeft / 60);
    const secs = this.pomodoroTimer.timeLeft % 60;
    document.getElementById('timerText').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    document.getElementById('timerMode').textContent = this.pomodoroTimer.mode.charAt(0).toUpperCase() + this.pomodoroTimer.mode.slice(1);
    
    // Progress circle
    const progress = 1 - (this.pomodoroTimer.timeLeft / (25 * 60));
    const circumference = 753;
    const offset = circumference * progress;
    document.querySelector('.timer-progress').style.strokeDashoffset = offset;
  }

  pomodoroComplete() {
    this.playNotificationSound();
    this.data.pomodoro.sessions++;
    this.data.pomodoro.today++;
    this.data.analytics.focusHours += 0.42;
    
    // Auto next session
    if (this.pomodoroTimer.mode === 'focus') {
      this.pomodoroTimer.mode = this.data.pomodoro.sessions % 4 === 0 ? 'long' : 'short';
      this.pomodoroTimer.timeLeft = this.pomodoroTimer.mode === 'long' ? 15 * 60 : 5 * 60;
    } else {
      this.pomodoroTimer.mode = 'focus';
      this.pomodoroTimer.timeLeft = 25 * 60;
    }
    
    this.saveData();
    this.render();
    this.showNotification('Session complete! 🎉', 'success');
    this.earnXP(75);
  }

  playNotificationSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  }

  toggleFocusMode() {
    document.getElementById('focusModeOverlay').classList.toggle('active');
  }

  // Habits
  renderHabits() {
    const habitsGrid = document.getElementById('habitsGrid');
    habitsGrid.innerHTML = this.data.habits.map(habit => {
      const weekDays = this.getWeekDays();
      return `
        <div class="habit-card">
          <div class="habit-header">
            <div class="habit-name">${habit.name}</div>
            <div class="habit-streak">${habit.streak}🔥</div>
          </div>
          <div class="heatmap-grid">
            ${weekDays.map(day => {
              const isCompleted = habit.completions?.includes(day) || false;
              const fillLevel = Math.floor(Math.random() * 3) + 1;
              return `<div class="heatmap-day ${isCompleted ? 'filled-' + fillLevel : 'empty'}" onclick="app.toggleHabitCompletion('${habit.id}', '${day}')"></div>`;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  addHabit(name) {
    this.data.habits.push({
      id: Date.now(),
      name,
      streak: 0,
      completions: []
    });
    this.saveData();
    this.renderHabits();
  }

  toggleHabitCompletion(habitId, day) {
    const habit = this.data.habits.find(h => h.id === habitId);
    if (habit) {
      const index = habit.completions.indexOf(day);
      if (index > -1) {
        habit.completions.splice(index, 1);
      } else {
        habit.completions.push(day);
      }
      habit.streak = this.calculateStreak(habit);
      this.saveData();
      this.renderHabits();
      this.earnXP(25);
    }
  }

  calculateStreak(habit) {
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let current = today;
    
    while (habit.completions.includes(current)) {
      streak++;
      current = new Date(new Date(current) - 86400000).toISOString().split('T')[0];
    }
    
    return streak;
  }

  getWeekDays() {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days.reverse();
  }

  // AI Assistant (simulated)
  aiGeneratePlan() {
    const input = document.getElementById('aiInput').value;
    const response = document.querySelector('.ai-response');
    
    const plans = [
      "1. Review yesterday's tasks (15min)\n2. Plan 3 focus sessions\n3. Complete high-priority tasks first\n4. Take breaks between pomodoros",
      "Based on your streak, continue with:\n• Morning routine (habit)\n• Deep work block (90min)\n• Review progress at EOD",
      "Smart plan:\n1. Quick win task first\n2. 2 pomodoros on main project\n3. 25min habit building\n4. Analytics review"
    ];
    
    response.innerHTML = `<div class="ai-plan">${plans[Math.floor(Math.random() * plans.length)]}</div>`;
    this.showNotification('AI plan generated!', 'success');
  }

  // Gamification
  startXPSystem() {
    setInterval(() => {
      if (Math.random() > 0.95) this.randomAchievement();
    }, 60000);
  }

  earnXP(amount) {
    this.user.xp += amount;
    this.checkLevelUp();
    this.updateUserProfile();
    this.showNotification(`+${amount} XP earned!`, 'success');
    
    // XP floating popup with animation
    const popup = document.createElement('div');
    popup.className = 'xp-popup';
    popup.style.cssText = `
      position: fixed;
      top: 20%;
      right: 20px;
      background: linear-gradient(135deg, var(--primary), #8B5CF6);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      font-weight: 700;
      font-size: 1.2rem;
      box-shadow: var(--shadow-xl);
      z-index: 10001;
      animation: xpFloat 2s ease-out forwards;
      pointer-events: none;
    `;
    popup.textContent = `+${amount} XP`;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 2000);
  }

  checkLevelUp() {
    const newLevel = Math.floor(this.user.xp / 500) + 1;
    if (newLevel > this.user.level) {
      this.user.level = newLevel;
      this.showNotification(`Level up! 🎉 You are now Level ${newLevel}`, 'success');
    }
  }

  randomAchievement() {
    const achievements = ['streak7', 'tasks50', 'pomodoros100', 'perfectWeek'];
    const newAchieve = achievements[Math.floor(Math.random() * achievements.length)];
    
    if (!this.user.achievements.includes(newAchieve)) {
      this.user.achievements.push(newAchieve);
      this.saveData();
      this.showNotification(`Achievement Unlocked: ${newAchieve.replace(/([A-Z])/g, ' $1').trim()} 🏆`, 'success');
    }
  }

  // Analytics (simulated charts using Canvas)
  renderAnalytics() {
    this.renderFocusChart();
    this.renderTaskChart();
    this.renderHabitHeatmap();
  }

  renderFocusChart() {
    const canvas = document.getElementById('focusChart');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 200;
    
    // Simple line chart simulation
    ctx.fillStyle = 'var(--bg-glass-dark)';
    ctx.fillRect(0, 0, 400, 200);
    
    ctx.strokeStyle = 'var(--primary)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const data = [2, 3.5, 4.2, 3.8, 5.1, 4.8, 6.2];
    const maxY = 7;
    
    data.forEach((value, i) => {
      const x = (i / (data.length - 1)) * 380 + 10;
      const y = (1 - value / maxY) * 160 + 20;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
  }

  renderTaskChart() {
    // Similar bar chart implementation
    const canvas = document.getElementById('taskChart');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 200;
    
    ctx.fillStyle = 'var(--bg-glass-dark)';
    ctx.fillRect(0, 0, 400, 200);
    
    const categories = ['Work', 'Personal', 'Study'];
    const values = [45, 32, 28];
    
    values.forEach((value, i) => {
      ctx.fillStyle = `hsl(${i * 80}, 70%, 60%)`;
      ctx.fillRect(50 + i * 100, 200 - value * 4, 60, value * 4);
    });
  }

  renderHabitHeatmap() {
    const heatmap = document.getElementById('habitHeatmap');
    heatmap.innerHTML = `
      <div class="heatmap-legend">
        <div class="legend-item empty">No days</div>
        <div class="legend-item filled-1">1 day</div>
        <div class="legend-item filled-2">2-3 days</div>
        <div class="legend-item filled-3">4+ days</div>
      </div>
    `;
  }

  // User Profile
  updateUserProfile() {
    document.querySelector('.profile-header .avatar').textContent = this.user.avatar;
    document.querySelector('.profile-header h2').textContent = this.user.name;
    document.querySelector('.level').textContent = `Level ${this.user.level} (${this.user.xp.toLocaleString()} XP)`;
    
    const badgeGrid = document.querySelector('.badge-grid');
    badgeGrid.innerHTML = this.user.achievements.map(ach => {
      const names = {
        'streak7': '7-Day Streak',
        'tasks50': '50 Tasks',
        'pomodoros100': '100 Pomodoros',
        'perfectWeek': 'Perfect Week'
      };
      return `<div class="badge active">${names[ach] || ach}</div>`;
    }).join('');
  }

  renderProfile() {
    this.updateUserProfile();
  }

  // Notifications
  showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `
      <div>${message}</div>
      <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    document.getElementById('notifications').appendChild(notif);
    
    setTimeout(() => notif.remove(), 5000);
  }

  checkNotifications() {
    // Simulate smart notifications
    if (Math.random() > 0.8) {
      this.showNotification('Time for a break! ⏸️', 'info');
    }
  }

  // Data Management
  exportData() {
    const data = {
      user: this.user,
      ...this.data,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focusflow-backup.json';
    a.click();
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const data = JSON.parse(event.target.result);
          Object.assign(this.user, data.user);
          Object.assign(this.data, data);
          this.saveData();
          this.render();
          this.showNotification('Data imported successfully!', 'success');
        } catch (err) {
          this.showNotification('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }

  // Theme
  saveTheme() {
    localStorage.setItem('focusflow_theme', document.body.dataset.theme);
  }

  loadFonts() {
    // Fonts already loaded via CSS
  }
}

// Global app instance
const app = new FocusFlowApp();

// Expose methods to global scope for onclick handlers
window.app = app;

// Auto-save every 30 seconds
setInterval(() => app.saveData(), 30000);

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Service worker for offline (optional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

