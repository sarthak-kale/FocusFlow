// ====== CONSTANTS & STATE ======
const ELEMENTS = {
    authContainer: document.getElementById('auth-container'),
    appContainer: document.getElementById('app-container'),
    loginForm: document.getElementById('login-form-box'),
    signupForm: document.getElementById('signup-form-box'),
    userGreeting: document.getElementById('user-greeting'),
    navLinks: document.querySelectorAll('.nav-link'),
    pages: document.querySelectorAll('.page')
};

let tasks = [];
let habits = [];
let timerInterval = null;
let timerSeconds = 25 * 60;
let isTimerRunning = false;

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        showApp();
    } else {
        showAuth();
    }
}

// ====== AUTH SYSTEM ======
function showAuth() {
    ELEMENTS.appContainer.classList.add('hidden');
    ELEMENTS.authContainer.classList.remove('hidden');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

function showApp() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error("No user found");
        const user = JSON.parse(userStr);
        if (!user || !user.name) throw new Error("Invalid user");

        ELEMENTS.userGreeting.textContent = `Hello, ${user.name}`;
        ELEMENTS.authContainer.classList.add('hidden');
        ELEMENTS.appContainer.classList.remove('hidden');

        loadData();
        setupNavigation();
        navigateTo('dashboard');

    } catch (e) {
        console.error("Auth error", e);
        logout();
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!name || !email || !password) return alert('Fill all fields');

    const userObj = { name, email, password };
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('isLoggedIn', 'true');
    showApp();
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) return alert('Fill all fields');

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('No account found. Please sign up.');
            return;
        }
        const user = JSON.parse(userStr);
        if (user.email === email && user.password === password) {
            localStorage.setItem('isLoggedIn', 'true');
            showApp();
        } else {
            alert('Invalid credentials');
        }
    } catch (e) {
        alert('Data corrupted, clearing storage.');
        localStorage.clear();
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    showAuth();
}

function toggleAuthMode(mode) {
    if (mode === 'signup') {
        ELEMENTS.loginForm.classList.add('hidden');
        ELEMENTS.signupForm.classList.remove('hidden');
    } else {
        ELEMENTS.signupForm.classList.add('hidden');
        ELEMENTS.loginForm.classList.remove('hidden');
    }
}

// ====== NAVIGATION ======
function setupNavigation() {
    ELEMENTS.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (link.id === 'logout-btn') return;
            const target = link.dataset.target;
            navigateTo(target);
        });
    });
}

function navigateTo(pageId) {
    ELEMENTS.navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-target="${pageId}"]`)?.classList.add('active');

    ELEMENTS.pages.forEach(page => page.classList.remove('active'));
    document.getElementById(`page-${pageId}`)?.classList.add('active');

    if (pageId === 'dashboard' || pageId === 'analytics') {
        updateAnalytics();
    }
}

// ====== DATA MANAGEMENT ======
function loadData() {
    try {
        const storedTasks = localStorage.getItem('tasks');
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
        if (!Array.isArray(tasks)) tasks = [];
    } catch (e) { tasks = []; }

    try {
        const storedHabits = localStorage.getItem('habits');
        habits = storedHabits ? JSON.parse(storedHabits) : [];
        if (!Array.isArray(habits)) habits = [];
    } catch (e) { habits = []; }

    renderTasks();
    renderHabits();
    updateAnalytics();
}

function saveData(type) {
    if (type === 'tasks') {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateAnalytics();
    } else if (type === 'habits') {
        localStorage.setItem('habits', JSON.stringify(habits));
    }
}

// ====== TASKS ======
function addTask() {
    const input = document.getElementById('new-task-input');
    const text = input.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        createdAt: Date.now(),
        completedAt: null
    };

    tasks.unshift(newTask);
    saveData('tasks');
    input.value = '';
    renderTasks();
}

document.getElementById('new-task-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

function addDashboardTask() {
    const input = document.getElementById('dashboard-task-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        createdAt: Date.now(),
        completedAt: null
    };

    tasks.unshift(newTask);
    saveData('tasks');
    input.value = '';

    const container = document.getElementById('dashboard-task-input-container');
    const btn = document.getElementById('dashboard-add-btn');
    if (container) container.classList.add('hidden');
    if (btn) btn.classList.remove('hidden');
    renderTasks();
}

document.getElementById('dashboard-task-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addDashboardTask();
});

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? Date.now() : null;
        saveData('tasks');
        renderTasks();
    }
}

function deleteTask(id) {
    const el = document.getElementById(`task-${id}`);
    if (el) {
        el.classList.add('fade-out');
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveData('tasks');
            renderTasks();
        }, 250);
    }
}

function renderTasks() {
    const container = document.getElementById('task-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = `<p style="color:#9CA3AF; text-align:center; padding: 2rem;">No tasks yet. Create one!</p>`;
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.id = `task-${task.id}`;

        item.innerHTML = `
            <div class="task-content" onclick="toggleTask('${task.id}')">
                <div class="task-checkbox"></div>
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
            <button class="task-delete" onclick="deleteTask('${task.id}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        `;
        container.appendChild(item);
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// ====== ANALYTICS ======
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function updateAnalytics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const today = new Date().toDateString();
    let todayCreated = 0;
    let todayCompleted = 0;

    tasks.forEach(task => {
        const createdDate = new Date(task.createdAt).toDateString();
        if (createdDate === today) todayCreated++;

        if (task.completed) {
            const compDate = task.completedAt ? new Date(task.completedAt).toDateString() : createdDate;
            if (compDate === today) todayCompleted++;
        }
    });

    safeSetText('stat-total-tasks', total);
    safeSetText('stat-completed-tasks', completed);

    safeSetText('analytics-total', total);
    safeSetText('analytics-completed', completed);
    safeSetText('analytics-pending', pending);
    safeSetText('analytics-today-created', todayCreated);
    safeSetText('analytics-today-completed', todayCompleted);

    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    safeSetText('analytics-rate', `${rate}%`);
}

// ====== POMODORO ======
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateTimerDisplay() {
    safeSetText('timer-display', formatTime(timerSeconds));
}

function toggleTimer() {
    const btn = document.getElementById('timer-toggle-btn');
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (btn) btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"/></svg>`;
    } else {
        isTimerRunning = true;
        if (btn) btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                updateTimerDisplay();
            } else {
                toggleTimer();
                alert("Pomodoro complete!");
            }
        }, 1000);
    }
}

function resetTimer() {
    if (isTimerRunning) toggleTimer();
    timerSeconds = 25 * 60;
    updateTimerDisplay();
}

// ====== HABITS ======
function addHabit() {
    const input = document.getElementById('new-habit-input');
    const name = input.value.trim();
    if (!name) return;

    const newHabit = {
        id: Date.now().toString(),
        name: name,
        dates: []
    };

    habits.push(newHabit);
    saveData('habits');
    input.value = '';
    renderHabits();
}

document.getElementById('new-habit-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});

function toggleHabitDay(habitId, dateStr) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        if (habit.dates.includes(dateStr)) {
            habit.dates = habit.dates.filter(d => d !== dateStr);
        } else {
            habit.dates.push(dateStr);
        }
        saveData('habits');
        renderHabits();
    }
}

function calculateStreak(dates) {
    if (!dates || dates.length === 0) return 0;
    const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let currDate = new Date();
    currDate.setHours(0, 0, 0, 0);

    let activeDateStr = formatDateStr(currDate);
    if (!sorted.includes(activeDateStr)) {
        let yesterday = new Date(currDate);
        yesterday.setDate(currDate.getDate() - 1);
        activeDateStr = formatDateStr(yesterday);
        if (!sorted.includes(activeDateStr)) return 0;
    }

    let checkDate = new Date(activeDateStr);
    while (true) {
        if (sorted.includes(formatDateStr(checkDate))) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

function formatDateStr(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function renderHabits() {
    const container = document.getElementById('habit-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = `<p style="color:#9CA3AF; text-align:center; padding: 2rem;">No habits tracked yet.</p>`;
        return;
    }

    const todayDate = new Date();
    const last5Days = [];
    for (let i = 4; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() - i);
        last5Days.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, dateStr: formatDateStr(d) });
    }

    habits.forEach(habit => {
        const streak = calculateStreak(habit.dates);
        const item = document.createElement('div');
        item.className = 'card habit-item';

        let daysHtml = last5Days.map(d => {
            const isCompleted = habit.dates.includes(d.dateStr);
            return `<div class="habit-day ${isCompleted ? 'completed' : ''}" onclick="toggleHabitDay('${habit.id}', '${d.dateStr}')" title="${d.label}">${d.label.split('/')[0]}</div>`;
        }).join('');

        item.innerHTML = `
            <div class="habit-header">
                <span class="habit-title">${escapeHTML(habit.name)}</span>
                <span class="habit-streak">🔥 ${streak} Day Streak</span>
            </div>
            <div class="habit-days">
                <div style="margin-right:auto;font-size:0.8rem;color:#9CA3AF;align-self:center;">Last 5 days:</div>
                ${daysHtml}
            </div>
        `;
        container.appendChild(item);
    });
}
