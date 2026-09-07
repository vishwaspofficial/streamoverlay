let studyDuration = 25 * 60;
const exerciseDuration = 5 * 60;
let totalStudySessions = 4;
let completedStudySessions = 0;
let completedExerciseSessions = 0;
let studySeconds = studyDuration;
let exerciseSeconds = exerciseDuration;
let studyRunning = false;
let exerciseRunning = false;
let studyInterval;
let exerciseInterval;

const studyTimer = document.querySelector('#studyTimer');
const studyProgress = document.querySelector('#studyProgress');
const studyStatus = document.querySelector('#studyStatus');
const exerciseTimer = document.querySelector('#exerciseTimer');
const exerciseStatus = document.querySelector('#exerciseStatus');
const exerciseButton = document.querySelector('#exerciseButton');
const clock = document.querySelector('#clock');
const studyPanel = document.querySelector('.timer-panel');
const weekPanel = document.querySelector('.goal-panel');
const dayPanel = document.querySelectorAll('.goal-panel')[1];
const exercisePanel = document.querySelector('#exercisePanel');
const brbOverlay = document.querySelector('#brbOverlay');
const brbButton = document.querySelector('#brbButton');
const brbDismiss = document.querySelector('#brbDismiss');
const controlsPanel = document.querySelector('#controlsPanel');
const controlsButton = document.querySelector('#controlsButton');
const weeklyList = document.querySelector('#weeklyList');
const weeklyGoalInput = document.querySelector('#weeklyGoalInput');
const addWeeklyGoal = document.querySelector('#addWeeklyGoal');
const dailyList = document.querySelector('#dailyList');
const dailyGoalInput = document.querySelector('#dailyGoalInput');
const addDailyGoal = document.querySelector('#addDailyGoal');
const studyMinutes = document.querySelector('#studyMinutes');
const applyStudyMinutes = document.querySelector('#applyStudyMinutes');
const sessionTotal = document.querySelector('#sessionTotal');
const applySessionTotal = document.querySelector('#applySessionTotal');
const exerciseSessions = document.querySelector('#exerciseSessions');

function getSharedState() {
  return {
    studyDuration: Math.round(studyDuration / 60),
    totalSessions: totalStudySessions,
    weeklyGoals: [...weeklyList.querySelectorAll('.goal-item')].map((item) => ({ text: item.querySelector('span:nth-child(2)')?.textContent || '', done: item.classList.contains('complete') })),
    dailyGoals: [...dailyList.querySelectorAll('.goal-item')].map((item) => ({ text: item.querySelector('span:nth-child(2)')?.textContent || '', done: item.classList.contains('complete') }))
  };
}

function applySharedState(state) {
  if (state.studyDuration) {
    studyDuration = Number(state.studyDuration) * 60;
    studySeconds = studyDuration;
    studyMinutes.value = state.studyDuration;
  }
  if (state.totalSessions) {
    totalStudySessions = Number(state.totalSessions);
    sessionTotal.value = totalStudySessions;
  }
  if (Array.isArray(state.weeklyGoals)) replaceGoals(weeklyList, state.weeklyGoals, wireWeeklyGoal);
  if (Array.isArray(state.dailyGoals)) replaceGoals(dailyList, state.dailyGoals, wireDailyGoal);
  updateWeeklyProgress();
  updateDailyProgress();
  renderStudy();
}

function replaceGoals(list, goals, wireGoal) {
  list.innerHTML = '';
  goals.forEach((goal) => {
    const item = document.createElement('div');
    item.className = `goal-item${goal.done ? ' complete' : ''}`;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.innerHTML = `<span class="checkmark">${goal.done ? '&#10003;' : ''}</span><span>${goal.text}</span>`;
    list.appendChild(item);
    wireGoal(item);
  });
}

function saveSharedState() {
  window.overlaySync?.save(getSharedState());
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function renderStudy() {
  studyTimer.textContent = formatTime(studySeconds);
  studyProgress.style.width = `${((studyDuration - studySeconds) / studyDuration) * 100}%`;
  studyStatus.textContent = studyRunning ? 'IN FOCUS' : (studySeconds === studyDuration ? 'READY' : 'PAUSED');
  document.querySelector('#sessionLabel').textContent = `Session ${Math.min(completedStudySessions + 1, totalStudySessions).toString().padStart(2, '0')} / ${totalStudySessions.toString().padStart(2, '0')}`;
  document.querySelector('#studyButton').textContent = studyRunning ? 'Pause session' : (studySeconds === 0 ? 'Start next session' : 'Start session');
}

function renderExercise() {
  exerciseTimer.textContent = formatTime(exerciseSeconds);
  exerciseStatus.textContent = exerciseRunning ? 'MOVING' : (exerciseSeconds === exerciseDuration ? 'READY' : 'PAUSED');
  exerciseButton.textContent = exerciseRunning ? 'Pause break' : (exerciseSeconds === 0 ? 'Reset break' : 'Start break');
  exerciseSessions.textContent = `Sessions completed: ${completedExerciseSessions}`;
}

function completeStudySession() {
  studyRunning = false;
  clearInterval(studyInterval);
  completedStudySessions = Math.min(completedStudySessions + 1, totalStudySessions);
  studySeconds = 0;
  renderStudy();
  studyStatus.textContent = 'COMPLETE';
  document.querySelector('#footerSession').textContent = 'FOCUS BLOCK COMPLETE';
}

function tickStudy() {
  if (studySeconds <= 1) {
    completeStudySession();
    return;
  }
  studySeconds -= 1;
  renderStudy();
}

function tickExercise() {
  if (exerciseSeconds <= 1) {
    exerciseRunning = false;
    clearInterval(exerciseInterval);
    completedExerciseSessions += 1;
    exerciseSeconds = 0;
    renderExercise();
    exerciseStatus.textContent = 'COMPLETE';
    return;
  }
  exerciseSeconds -= 1;
  renderExercise();
}

document.querySelector('#studyButton').addEventListener('click', () => {
  if (studySeconds === 0) studySeconds = studyDuration;
  studyRunning = !studyRunning;
  clearInterval(studyInterval);
  if (studyRunning) studyInterval = setInterval(tickStudy, 1000);
  renderStudy();
});

applyStudyMinutes.addEventListener('click', () => {
  const minutes = Number(studyMinutes.value);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) return;
  studyDuration = Math.round(minutes * 60);
  studySeconds = studyDuration;
  studyRunning = false;
  clearInterval(studyInterval);
  studyStatus.textContent = 'READY';
  renderStudy();
  saveSharedState();
});

applySessionTotal.addEventListener('click', () => {
  const sessions = Number(sessionTotal.value);
  if (!Number.isFinite(sessions) || sessions < 1 || sessions > 24) return;
  totalStudySessions = Math.round(sessions);
  completedStudySessions = Math.min(completedStudySessions, totalStudySessions);
  renderStudy();
  saveSharedState();
});

exerciseButton.addEventListener('click', () => {
  if (exerciseSeconds === 0) exerciseSeconds = exerciseDuration;
  exerciseRunning = !exerciseRunning;
  clearInterval(exerciseInterval);
  if (exerciseRunning) exerciseInterval = setInterval(tickExercise, 1000);
  renderExercise();
});

function updateDailyProgress() {
  const goals = dailyList.querySelectorAll('.goal-item');
  const completed = dailyList.querySelectorAll('.goal-item.complete').length;
  document.querySelector('#dayCount').textContent = `${completed} / ${goals.length}`;
}

function wireDailyGoal(item) {
  const toggleGoal = () => {
    item.classList.toggle('complete');
    item.querySelector('.checkmark').innerHTML = item.classList.contains('complete') ? '&#10003;' : '';
    updateDailyProgress();
      saveSharedState();
  };
  item.addEventListener('click', toggleGoal);
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') toggleGoal();
  });
  addDeleteButton(item, updateDailyProgress);
}

function addDeleteButton(item, updateProgress) {
  const deleteButton = document.createElement('span');
  deleteButton.className = 'delete-goal';
  deleteButton.setAttribute('role', 'button');
  deleteButton.setAttribute('tabindex', '0');
  deleteButton.setAttribute('aria-label', 'Delete goal');
  deleteButton.textContent = 'x';
  const deleteGoal = (event) => {
    event.stopPropagation();
    item.remove();
    updateProgress();
    saveSharedState();
  };
  deleteButton.addEventListener('click', deleteGoal);
  deleteButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') deleteGoal(event);
  });
  item.appendChild(deleteButton);
}

addDailyGoal.addEventListener('click', () => {
  const label = dailyGoalInput.value.trim();
  if (!label) return;
  const item = document.createElement('div');
  item.className = 'goal-item';
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.innerHTML = `<span class="checkmark"></span><span>${label}</span>`;
  dailyList.appendChild(item);
  wireDailyGoal(item);
  dailyGoalInput.value = '';
  updateDailyProgress();
  saveSharedState();
});
dailyGoalInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addDailyGoal.click();
});
dailyList.querySelectorAll('.goal-item').forEach(wireDailyGoal);
updateDailyProgress();

function updateWeeklyProgress() {
  const goals = weeklyList.querySelectorAll('.goal-item');
  const completed = weeklyList.querySelectorAll('.goal-item.complete').length;
  const percent = goals.length ? Math.round((completed / goals.length) * 100) : 0;
  document.querySelector('#weekCount').textContent = `${completed} / ${goals.length}`;
  document.querySelector('#weekPercent').textContent = `${percent}%`;
  document.querySelector('#weekProgress').style.width = `${percent}%`;
  document.querySelector('#weekRing').style.background = `conic-gradient(var(--mint) 0 ${percent}%, rgba(232,236,226,0.09) ${percent}% 100%)`;
}

function wireWeeklyGoal(item) {
  const toggleGoal = () => {
    item.classList.toggle('complete');
    item.querySelector('.checkmark').innerHTML = item.classList.contains('complete') ? '&#10003;' : '';
    updateWeeklyProgress();
    saveSharedState();
  };
  item.addEventListener('click', toggleGoal);
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') toggleGoal();
  });
  addDeleteButton(item, updateWeeklyProgress);
}

weeklyList.querySelectorAll('.goal-item').forEach(wireWeeklyGoal);
addWeeklyGoal.addEventListener('click', () => {
  const label = weeklyGoalInput.value.trim();
  if (!label) return;
  const item = document.createElement('div');
  item.className = 'goal-item';
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.innerHTML = `<span class="checkmark"></span><span>${label}</span>`;
  weeklyList.appendChild(item);
  wireWeeklyGoal(item);
  weeklyGoalInput.value = '';
  updateWeeklyProgress();
  saveSharedState();
});
weeklyGoalInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addWeeklyGoal.click();
});
updateWeeklyProgress();

function wireToggle(id, target) {
  document.querySelector(`#${id}`).addEventListener('click', (event) => {
    const isOn = event.currentTarget.classList.toggle('on');
    event.currentTarget.setAttribute('aria-pressed', isOn.toString());
    target.classList.toggle('is-hidden', !isOn);
    saveSharedState();
  });
}

controlsButton.addEventListener('click', () => {
  const isVisible = controlsPanel.classList.toggle('is-hidden') === false;
  controlsButton.textContent = isVisible ? 'Hide controls' : 'Show controls';
  controlsButton.setAttribute('aria-expanded', isVisible.toString());
});

wireToggle('studyToggle', studyPanel);
wireToggle('weekToggle', weekPanel);
wireToggle('dayToggle', dayPanel);
wireToggle('exerciseToggle', exercisePanel);

function setBrbMode(isVisible) {
  brbOverlay.classList.toggle('is-hidden', !isVisible);
  brbOverlay.setAttribute('aria-hidden', (!isVisible).toString());
  brbButton.textContent = isVisible ? 'Hide Be Right Back' : 'Show Be Right Back';
}

brbButton.addEventListener('click', () => setBrbMode(brbOverlay.classList.contains('is-hidden')));
brbDismiss.addEventListener('click', () => setBrbMode(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !brbOverlay.classList.contains('is-hidden')) setBrbMode(false);
});

const overlayShell = document.querySelector('.overlay-shell');
const widgets = document.querySelectorAll('.widget[data-widget]');
const savedPositions = JSON.parse(localStorage.getItem('focusRoomWidgetPositions') || '{}');

function scaleOverlay() {
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  overlayShell.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scaleOverlay);
scaleOverlay();

widgets.forEach((widget) => {
  const savedPosition = savedPositions[widget.dataset.widget];
  if (savedPosition) {
    widget.style.left = `${savedPosition.left}px`;
    widget.style.top = `${savedPosition.top}px`;
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
  }

  widget.title = 'Drag to move';
  widget.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;

    const shellBounds = overlayShell.getBoundingClientRect();
    const widgetBounds = widget.getBoundingClientRect();
    const scale = shellBounds.width / overlayShell.offsetWidth;
    const offsetX = (event.clientX - widgetBounds.left) / scale;
    const offsetY = (event.clientY - widgetBounds.top) / scale;
    widget.classList.add('dragging');
    widget.setPointerCapture(event.pointerId);

    const moveWidget = (moveEvent) => {
      const left = Math.max(0, Math.min(overlayShell.offsetWidth - widget.offsetWidth, (moveEvent.clientX - shellBounds.left) / scale - offsetX));
      const top = Math.max(0, Math.min(overlayShell.offsetHeight - widget.offsetHeight, (moveEvent.clientY - shellBounds.top) / scale - offsetY));
      widget.style.left = `${left}px`;
      widget.style.top = `${top}px`;
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
    };

    const stopMoving = () => {
      widget.classList.remove('dragging');
      const position = { left: parseInt(widget.style.left, 10), top: parseInt(widget.style.top, 10) };
      savedPositions[widget.dataset.widget] = position;
      localStorage.setItem('focusRoomWidgetPositions', JSON.stringify(savedPositions));
      widget.removeEventListener('pointermove', moveWidget);
      widget.removeEventListener('pointerup', stopMoving);
      widget.removeEventListener('pointercancel', stopMoving);
    };

    widget.addEventListener('pointermove', moveWidget);
    widget.addEventListener('pointerup', stopMoving);
    widget.addEventListener('pointercancel', stopMoving);
  });
});

setInterval(updateClock, 1000);
updateClock();
renderStudy();
renderExercise();
window.overlaySync?.start(applySharedState);
