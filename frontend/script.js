const API_URL = 'http://localhost:5000/tasks';

const form = document.querySelector('#task-form');
const taskIdInput = document.querySelector('#task-id');
const titleInput = document.querySelector('#title');
const descriptionInput = document.querySelector('#description');
const statusInput = document.querySelector('#status');
const submitButton = document.querySelector('#submit-button');
const cancelButton = document.querySelector('#cancel-button');
const tasksList = document.querySelector('#tasks-list');
const taskCount = document.querySelector('#task-count');
const message = document.querySelector('#message');

document.querySelector('#today').textContent = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}).format(new Date());

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = '';
}

function formatStatus(status) {
  return String(status || 'pending')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status) {
  const normalized = String(status || 'pending').toLowerCase().replace(/\s+/g, '-');
  return ['pending', 'in-progress', 'completed'].includes(normalized)
    ? `status-${normalized}`
    : 'status-default';
}

function createTaskCard(task, index) {
  const card = document.createElement('article');
  card.className = 'task-card';
  card.style.animationDelay = `${index * 45}ms`;

  const content = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'task-title';
  title.textContent = task.title;
  content.append(title);

  if (task.description) {
    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description;
    content.append(description);
  }

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  const status = document.createElement('span');
  status.className = `status ${statusClass(task.status)}`;
  status.textContent = formatStatus(task.status);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  const editButton = document.createElement('button');
  editButton.className = 'icon-button';
  editButton.type = 'button';
  editButton.title = 'Edit task';
  editButton.setAttribute('aria-label', `Edit ${task.title}`);
  editButton.textContent = '✎';
  editButton.addEventListener('click', () => beginEdit(task));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'icon-button delete-button';
  deleteButton.type = 'button';
  deleteButton.title = 'Delete task';
  deleteButton.setAttribute('aria-label', `Delete ${task.title}`);
  deleteButton.textContent = '×';
  deleteButton.addEventListener('click', () => deleteTask(task.id));
  actions.append(editButton, deleteButton);
  meta.append(status, actions);
  card.append(content, meta);
  return card;
}

function renderTasks(tasks) {
  tasksList.replaceChildren();
  taskCount.textContent = tasks.length;
  if (tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks yet. Add your first task to get moving.';
    tasksList.append(empty);
    return;
  }
  tasks.forEach((task, index) => tasksList.append(createTaskCard(task, index)));
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

async function loadTasks() {
  tasksList.innerHTML = '<div class="loading-state">Loading your tasks...</div>';
  try {
    const tasks = await request(API_URL);
    renderTasks(Array.isArray(tasks) ? tasks : []);
    showMessage('Tasks refreshed successfully.', 'success');
  } catch (error) {
    tasksList.innerHTML = '<div class="empty-state">Tasks could not be loaded.</div>';
    showMessage(`Could not load tasks: ${error.message}`, 'error');
  }
}

function resetForm() {
  form.reset();
  taskIdInput.value = '';
  submitButton.textContent = 'Add task';
  cancelButton.hidden = true;
}

function beginEdit(task) {
  taskIdInput.value = task.id;
  titleInput.value = task.title || '';
  descriptionInput.value = task.description || '';
  statusInput.value = task.status || 'pending';
  submitButton.textContent = 'Save changes';
  cancelButton.hidden = false;
  titleInput.focus({ preventScroll: true });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();
  const id = taskIdInput.value;
  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    status: statusInput.value
  };
  if (!payload.title) return showMessage('Please enter a task title.', 'error');

  submitButton.disabled = true;
  try {
    await request(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    resetForm();
    showMessage(id ? 'Task updated successfully.' : 'Task added successfully.', 'success');
    await loadTasks();
  } catch (error) {
    showMessage(`Could not save task: ${error.message}`, 'error');
  } finally {
    submitButton.disabled = false;
  }
});

async function deleteTask(id) {
  if (!window.confirm('Delete this task?')) return;
  clearMessage();
  try {
    await request(`${API_URL}/${id}`, { method: 'DELETE' });
    if (taskIdInput.value === String(id)) resetForm();
    showMessage('Task deleted successfully.', 'success');
    await loadTasks();
  } catch (error) {
    showMessage(`Could not delete task: ${error.message}`, 'error');
  }
}

cancelButton.addEventListener('click', resetForm);
document.querySelector('#refresh-button').addEventListener('click', loadTasks);
loadTasks();