// Относительный путь URL. 
// В Docker через NGINX reverse proxy запросы на /tasks пойдут прямо на backend.
const API_URL = '/tasks';

const tasksList = document.getElementById('tasks-list');
const addTaskForm = document.getElementById('add-task-form');
const taskNameInput = document.getElementById('task-name-input');
const emptyState = document.getElementById('empty-state');

// 1. Загрузка всех задач (GET /tasks)
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка загрузки задач');
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('API Error:', error);
    }
}

// Рендер списка в DOM
function renderTasks(tasks) {
    tasksList.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.isFinished || task.isCompleted ? 'completed' : ''}`;

        li.innerHTML = `
            <span class="task-title">${escapeHtml(task.taskName || task.name)}</span>
            <div class="task-actions">
                ${!(task.isFinished || task.isCompleted) ? `
                    <button class="btn-action btn-finish" onclick="finishTask(${task.id})">Done</button>
                ` : ''}
                <button class="btn-action btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        tasksList.appendChild(li);
    });
}

// 2. Добавление задачи (POST /tasks)
addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskName = taskNameInput.value.trim();
    if (!taskName) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskName: taskName })
        });

        if (response.ok) {
            taskNameInput.value = '';
            fetchTasks();
        }
    } catch (error) {
        console.error('Ошибка при создании задачи:', error);
    }
});

// 3. Завершение задачи (PUT /tasks/{id}/finish)
async function finishTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/finish`, {
            method: 'PUT'
        });

        if (response.ok) {
            fetchTasks();
        }
    } catch (error) {
        console.error('Ошибка при завершении задачи:', error);
    }
}

// 4. Удаление задачи (DELETE /tasks/{id})
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchTasks();
        }
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
    }
}

// Хелпер от XSS
function escapeHtml(text) {
    return text
        ? text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]))
        : '';
}

// Старт
fetchTasks();