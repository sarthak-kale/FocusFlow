// FocusFlow - Modern Productivity App
// Clean, simple, localStorage-powered SaaS experience

class FocusFlowApp {
  constructor() {
    this.user = null;
    this.isLoggedIn = localStorage.getItem('focusflow_loggedIn') === 'true';
    this.data = this.loadData();
    this.currentUser = null;
    this.currentPage = 'dashboard';
    this.init();
  }

  init() {
    this.bindEvents();
    if (this.isLoggedIn) {
      this.showApp();
      this.loadUserData();
      this.navigate('dashboard');
    } else {
      this.showLogin();
    }
  }

  loadData() {
    return {
      tasks: JSON.parse(localStorage.getItem('focusflow_tasks')) || [],
      habits: JSON.parse(localStorage.getItem('focusflow_habits')) || [],
      pomodoro: JSON.parse(localStorage.getItem('focusflow_pomodoro')) || { total: 0, today: 0 },
      users: JSON.parse(localStorage.getItem('focusflow_users')) || []
    };
  }

  saveData() {
    localStorage.setItem('focusflow_tasks', JSON.stringify(this.data.tasks));
    localStorage.setItem('focusflow_habits', JSON.stringify(this.data.habits));
    localStorage.setItem('focusflow_pomodoro', JSON.stringify(this.data.pomodoro));
    localStorage.setItem('focusflow_users', JSON.stringify(this.data.users));
  }

  bindEvents() {
    // Auth
    document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
    document.getElementById('signupToggle').addEventListener('click', () => this.switchAuthMode('signup'));
    document.getElementById('loginToggle').addEventListener('click', () => this.switchAuthMode('login'));
    
    // App navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => this.navigate(item.dataset.page));
    });
    
    // Sidebar
    document.getElementById('sidebarToggle').addEventListener('click', this.toggleSidebar);
    
    // Theme
    document.getElementById('themeToggle').addEventListener('click', this.toggleTheme);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    
    // Tasks
    document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
    document.getElementById('quickTaskInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.quickAddTask();
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => this.filterTasks(btn.dataset.filter));
    });
    
    // Pomodoro
    document.getElementById('timerStart').addEventListener('click', () => this.startPomodoro());
    document.getElementById('timerPause').addEventListener('click', () => this.pausePomodoro());
    document.getElementById('timerReset').addEventListener('click', () => this.resetPomodoro());
    
    // Habits
    document.getElementById('addHabitBtn').addEventListener('click', () => this.addHabit());
    document.getElementById('quickHabitInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.quickAddHabit();
    });
    
    // Global search
    document.getElementById('globalSearch').addEventListener('input', (e) => this.globalSearch(e.target.value));
  }

  showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
  }

  showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
  }

  switchAuthMode(mode) {
    document.getElementById('signupToggle').classList.toggle('active', mode === 'signup');
    document.getElementById('loginToggle').classList.toggle('active', mode === 'login');
    
    const title = document.querySelector('.login-card h1');
    title.textContent = mode === 'signup' ? 'Create Account' : 'Welcome Back';
    document.querySelector('.login-card p').textContent = 
      mode === 'signup' ? 'Join FocusFlow today' : 'Sign in to your productivity dashboard';
  }

  async handleAuth(e) {
    e.preventDefault();
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim().toLowerCase();
    const password = document.getElementById('userPassword').value;
    
    const isSignup = document.getElementById('signupToggle').classList.contains('active');
    
    let user = this.data.users.find(u => u.email === email);
    
    if (isSignup) {
      if (user) {
        this.showMessage('User already exists', 'error');
        return;
      }
      user = { name, email, password, created: new Date().toISOString() };
      this.data.users.push(user);
    } else {
      if (!user || user.password !== password) {
        this.showMessage('Invalid credentials', 'error');
        return;
      }
    }
    
    this.currentUser = user;
    localStorage.setItem('focusflow_loggedIn', 'true');
    localStorage.setItem('focusflow_currentUser', email);
    this.isLoggedIn = true;
    
    this.showMessage('Welcome back!', 'success');
    this.showApp();
    this.loadUserData();
    document.getElementById('userGreeting').textContent = name;
    document.getElementById('welcomeMsg').textContent = `Welcome back, ${name}!`;
    
    setTimeout(() => this.navigate('dashboard'), 1000);
  }

  loadUserData() {
    const email = localStorage.getItem('focusflow_currentUser');
    this.currentUser = this.data.users.find(u => u.email === email);
  }

  logout() {
    localStorage.removeItem('focusflow_loggedIn');
    localStorage.removeItem('focusflow_currentUser');
    this.isLoggedIn = false;
    this.showLogin();
  }

  toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
  }

  toggleTheme() {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.getElementById('themeToggle').textContent = document.body.dataset.theme === 'dark' ? '☀️' : '🌙';
  }

  showMessage(msg, type) {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = msg;
    messageEl.className = `auth-message ${type}`;
  }

  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(page).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    this.currentPage = page;
    this.renderCurrentPage();
  }

  renderCurrentPage() {
    switch(this.currentPage) {
      case 'dashboard': this.renderDashboard(); break;
      case 'tasks': this.renderTasks(); break;
      case 'pomodoro': this.renderPomodoro(); break;
      case 'habits': this.renderHabits(); break;
      case 'analytics': this.renderAnalytics(); break;
    }
  }

  // Dashboard
  renderDashboard() {
    document.getElementById('totalTasks').textContent = this.data.tasks.filter(t => t.completed).length;
    document.getElementById('pomodoroSessions').textContent = this.data.pomodoro.total;
    document.getElementById('habitStreak').textContent = Math.max(...this.data.habits.map(h => h.streak || 0));
    
    const score = Math.min(100, 
      (this.data.tasks.filter(t => t.completed).length * 2) +
      (this.data.pomodoro.total * 3) +
      (Math.max(...this.data.habits.map(h => h.streak || 0)) * 5)
    );
    document.getElementById('dailyScore').style.background = 
      `conic-gradient(var(--success) 0% ${score}%, var(--warning) ${score}% 100%)`;
    document.getElementById('dailyScore').textContent = score;
  }

  // Tasks
  renderTasks(filter = 'all') {
    const tasks = this.data.tasks.filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });
    
    document.getElementById('taskList').innerHTML = tasks.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-title">${task.text}</div>
        <span class="task-priority priority-${task.priority}">${task.priority}</span>
        ${task.due ? `<span class="task-due">${task.due}</span>` : ''}
        <button class="delete-task" data-id="${task.id}">🗑️</button>
      </div>
    `).join('');

    // Event listeners
    document.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => this.toggleTask(e.target.closest('.task-item').dataset.id));
    });
    document.querySelectorAll('.delete-task').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteTask(e.target.dataset.id));
    });
  }

  addTask() {
    const text = document.getElementById('quickTaskInput').value.trim();
    if (!text) return;
    
    this.data.tasks.unshift({
      id: Date.now(),
      text,
      priority: 'medium',
      due: null,
      completed: false
    });
    
    this.saveData();
    document.getElementById('quickTaskInput').value = '';
    this.renderTasks();
  }

  quickAddTask() {
    this.addTask();
  }

  toggleTask(id) {
    const task = this.data.tasks.find(t => t.id == id);
    if (task) task.completed = !task.completed;
    this.saveData();
    this.renderTasks();
    this.renderDashboard();
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id != id);
    this.saveData();
    this.renderTasks();
    this.renderDashboard();
  }

  filterTasks(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    this.renderTasks(filter);
  }

  // Pomodoro
  pomodoro = {
    timeLeft: 25 * 60,
    isRunning: false,
    interval: null
  };

  renderPomodoro() {
    this.updateTimerDisplay();
  }

  startPomodoro() {
    if (this.pomodoro.isRunning) return;
    this.pomodoro.isRunning = true;
    document.getElementById('timerStart').style.display = 'none';
    document.getElementById('timerPause').style.display = 'inline-flex';
    
    this.pomodoro.interval = setInterval(() => {
      this.pomodoro.timeLeft--;
      this.updateTimerDisplay();
      
      if (this.pomodoro.timeLeft <= 0) {
        this.completeSession();
      }
    }, 1000);
  }

  pausePomodoro() {
    this.pomodoro.isRunning = false;
    clearInterval(this.pomodoro.interval);
    document.getElementById('timerStart').style.display = 'inline-flex';
    document.getElementById('timerPause').style.display = 'none';
  }

  resetPomodoro() {
    this.pausePomodoro();
    this.pomodoro.timeLeft = 25 * 60;
    document.getElementById('timerMode').textContent = 'Focus Time';
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.pomodoro.timeLeft / 60);
    const secs = this.pomodoro.timeLeft % 60;
    document.getElementById('timerTime').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const progress = 1 - (this.pomodoro.timeLeft / (25 * 60));
    document.querySelector('.timer-progress').style.strokeDashoffset = 830 * progress;
  }

  completeSession() {
    this.playSound();
    this.data.pomodoro.total++;
    this.data.pomodoro.today++;
    this.saveData();
    this.resetPomodoro();
    this.renderDashboard();
  }

  playSound() {
    // Simple beep
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoQGgAmgK8ABAA');
    audio.play().catch(() => {});
  }

  // Habits
  renderHabits() {
    document.getElementById('habitList').innerHTML = this.data.habits.map(habit => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        week.unshift(date);
      }
      
      const streak = this.calculateStreak(habit.dates);
      
      return `
        <div class="habit-item">
          <div class="habit-header">
            <span class="habit-name">${habit.name}</span>
            <span class="habit-streak">${streak}🔥</span>
          </div>
          <div class="week-grid">
            ${week.map(day => {
              const completed = habit.dates.includes(day);
              return `<div class="week-day ${completed ? 'completed' : ''} ${day === today ? 'today' : ''}" data-habit="${habit.id}" data-day="${day}"></div>`;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Bind habit clicks
    document.querySelectorAll('.week-day').forEach(day => {
      day.addEventListener('click', (e) => {
        const habitId = e.target.dataset.habit;
        const dayDate = e.target.dataset.day;
        this.toggleHabit(habitId, dayDate);
      });
    });
  }

  addHabit() {
    const name = document.getElementById('quickHabitInput').value.trim();
    if (!name) return;
    
    this.data.habits.push({
      id: Date.now(),
      name,
      dates: []
    });
    
    document.getElementById('quickHabitInput').value = '';
    this.saveData();
    this.renderHabits();
    this.renderDashboard();
  }

  quickAddHabit() {
    this.addHabit();
  }

  toggleHabit(habitId, day) {
    const habit = this.data.habits.find(h => h.id == habitId);
    if (!habit) return;
    
    const index = habit.dates.indexOf(day);
    if (index > -1) {
      habit.dates.splice(index, 1);
    } else {
      habit.dates.push(day);
    }
    
    this.saveData();
    this.renderHabits();
    this.renderDashboard();
  }

  calculateStreak(dates) {
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let current = today;
    
    while (dates.includes(current)) {
      streak++;
      current = new Date(new Date(current).getTime() - 86400000).toISOString().split('T')[0];
    }
    
    return streak;
  }

  // Analytics
  renderAnalytics() {
    // Simple canvas charts
    this.renderTaskChart();
  }

  renderTaskChart() {
    const canvas = document.getElementById('taskChart');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Sample data
    const data = [12, 18, 15, 22, 28, 25, 32];
    const max = Math.max(...data);
    
    ctx.fillStyle = var(--primary);
    data.forEach((value, i) => {
      const barWidth = canvas.width / data.length - 10;
      const barHeight = (value / max) * 150;
      const x = i * (canvas.width / data.length) + 5;
      
      ctx.fillRect(x, canvas.height - barHeight - 20, barWidth, barHeight);
    });
  }

  // Global Search
  globalSearch(query) {
    if (!query.trim()) return;
    
    const tasks = this.data.tasks.filter(t => t.text.toLowerCase().includes(query.toLowerCase()));
    const habits = this.data.habits.filter(h => h.name.toLowerCase().includes(query.toLowerCase()));
    
    // Show search results overlay
    console.log('Search results:', tasks.length, 'tasks +', habits.length, 'habits');
  }
}

// Initialize app
const app = new FocusFlowApp();

// Service Worker for offline (optional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

