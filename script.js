const studyDuration = 25 * 60;
let studySeconds = studyDuration;
let studyRunning = false;
let studyInterval;
let state = null;

const studyTimer = document.querySelector('#studyTimer');
const studyProgress = document.querySelector('#studyProgress');
const studyStatus = document.querySelector('#studyStatus');
const exerciseTimer = document.querySelector('#exerciseTimer');
const exerciseStatus = document.querySelector('#exerciseStatus');
const exerciseSessions = document.querySelector('#exerciseSessions');
const exerciseButton = document.querySelector('#exerciseButton');
const clock = document.querySelector('#clock');
const studyPanel = document.querySelector('.timer-panel');
const weekPanel = document.querySelectorAll('.goal-panel')[0];
const dayPanel = document.querySelectorAll('.goal-panel')[1];
const exercisePanel = document.querySelector('#exercisePanel');
const brbOverlay = document.querySelector('#brbOverlay');

function formatTime(totalSeconds) {
  return `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
}

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function renderStudy() {
  const duration = Math.max(1, Number(state?.studyMinutes || 25) * 60);
  studyTimer.textContent = formatTime(studySeconds);
  studyProgress.style.width = `${Math.max(0, Math.min(100, ((duration - studySeconds) / duration) * 100))}%`;
  studyStatus.textContent = studyRunning ? 'IN FOCUS' : (studySeconds === duration ? 'READY' : 'PAUSED');
}

function renderExercise() {
  exerciseTimer.textContent = '05:00';
  exerciseStatus.textContent = 'READY';
  exerciseSessions.textContent = `Sessions completed: ${state?.exerciseSessions || 0}`;
  exerciseButton.textContent = 'Start break';
}

function renderGoals(list, goals) {
  list.innerHTML = '';
  goals.forEach((goal) => {
    const item = document.createElement('div');
    item.className = `goal-item${goal.done ? ' complete' : ''}`;
    item.innerHTML = `<span class="checkmark">${goal.done ? '&#10003;' : ''}</span><span>${goal.text}</span>`;
    list.appendChild(item);
  });
}

function renderState(nextState) {
  state = nextState;
  const duration = Math.max(1, Number(state.studyMinutes || 25) * 60);
  if (!studyRunning) studySeconds = duration;
  document.querySelector('#sessionLabel').textContent = `Session 01 / ${String(state.totalSessions || 4).padStart(2, '0')}`;
  renderStudy();
  renderExercise();
  renderGoals(document.querySelector('#weeklyList'), state.weeklyGoals || []);
  renderGoals(document.querySelector('#dailyList'), state.dailyGoals || []);
  const visibility = state.visibility || {};
  studyPanel.classList.toggle('is-hidden', visibility.study === false);
  weekPanel.classList.toggle('is-hidden', visibility.weekly === false);
  dayPanel.classList.toggle('is-hidden', visibility.daily === false);
  exercisePanel.classList.toggle('is-hidden', visibility.exercise === false);
  brbOverlay.classList.toggle('is-hidden', state.brb !== true);
  const weeklyDone = (state.weeklyGoals || []).filter((goal) => goal.done).length;
  const dailyDone = (state.dailyGoals || []).filter((goal) => goal.done).length;
  const weeklyTotal = (state.weeklyGoals || []).length;
  document.querySelector('#weekCount').textContent = `${weeklyDone} / ${weeklyTotal}`;
  document.querySelector('#weekPercent').textContent = `${weeklyTotal ? Math.round(weeklyDone / weeklyTotal * 100) : 0}%`;
  document.querySelector('#weekProgress').style.width = `${weeklyTotal ? weeklyDone / weeklyTotal * 100 : 0}%`;
  document.querySelector('#dayCount').textContent = `${dailyDone} / ${(state.dailyGoals || []).length}`;
}

async function loadState() {
  const response = await fetch('/api/state/', { cache: 'no-store' });
  if (response.ok) renderState(await response.json());
}

document.querySelector('#studyButton').addEventListener('click', () => {
  studyRunning = !studyRunning;
  clearInterval(studyInterval);
  if (studyRunning) studyInterval = setInterval(() => {
    studySeconds = Math.max(0, studySeconds - 1);
    renderStudy();
    if (studySeconds === 0) { studyRunning = false; clearInterval(studyInterval); studyStatus.textContent = 'COMPLETE'; }
  }, 1000);
  renderStudy();
});

exerciseButton.addEventListener('click', () => {
  if (!state) return;
  state.exerciseSessions = Number(state.exerciseSessions || 0) + 1;
  renderExercise();
});

setInterval(updateClock, 1000);
setInterval(loadState, 2000);
updateClock();
loadState();
