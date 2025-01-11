document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task-btn');
    const taskList = document.getElementById('todo-list');
    const deleteDoneTasksButton = document.getElementById('delete-done-tasks');
    const deleteAllTasksButton = document.getElementById('delete-all-tasks');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const errorMessage = document.getElementById('error-message');

    // Popups
    const renamePopup = document.getElementById('rename-popup');
    const deletePopup = document.getElementById('delete-popup');
    const deleteDonePopup = document.getElementById('delete-done-popup');
    const renameInput = document.getElementById('rename-input');

    let tasks = [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasks = () => {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    };

    const updateDeleteButtonsState = () => {
        if (tasks.length === 0) {
            deleteAllTasksButton.disabled = true;
            deleteAllTasksButton.style.opacity = '0.6';
            deleteDoneTasksButton.disabled = true;
            deleteDoneTasksButton.style.opacity = '0.6';
        } else {
            deleteAllTasksButton.disabled = false;
            deleteAllTasksButton.style.opacity = '1';
            deleteDoneTasksButton.disabled = tasks.some(task => task.done) ? false : true;
            deleteDoneTasksButton.style.opacity = tasks.some(task => task.done) ? '1' : '0.6';
        }
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    };

    const hideError = () => {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    };

    const validateInput = (input) => {
        if (!input.trim()) {
            showError('Task cannot be empty!');
            return false;
        }
        if (input.length < 5) {
            showError('Task must be at least 5 characters long!');
            return false;
        }
        if (/^\d/.test(input)) {
            showError('Task cannot start with a number!');
            return false;
        }
        hideError();
        return true;
    };

    const renderTasks = (filter = 'all') => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            if (filter === 'done' && !task.done) return;
            if (filter === 'todo' && task.done) return;

            const li = document.createElement('li');
            li.className = task.done ? 'done' : '';

            const taskText = document.createElement('span');
            taskText.textContent = task.text;
            li.appendChild(taskText);

            const buttonGroup = document.createElement('div');
            buttonGroup.classList.add('button-group');

            const doneButton = document.createElement('button');
            doneButton.textContent = '✔';
            doneButton.classList.add('done-btn');
            doneButton.addEventListener('click', () => toggleTask(index));
            buttonGroup.appendChild(doneButton);

            const editButton = document.createElement('button');
            editButton.textContent = '✏️';
            editButton.classList.add('edit-btn');
            editButton.addEventListener('click', () => handleRenameTask(index));
            buttonGroup.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => handleDeleteTask(index));
            buttonGroup.appendChild(deleteButton);

            li.appendChild(buttonGroup);
            taskList.appendChild(li);
        });

        updateDeleteButtonsState();
    };

    const toggleTask = (index) => {
        tasks[index].done = !tasks[index].done;
        saveTasks();
        renderTasks();
    };

    const handleRenameTask = (index) => {
        renameInput.value = tasks[index].text;
        openPopup(renamePopup);

        document.getElementById('save-rename-btn').onclick = () => {
            const newText = renameInput.value.trim();
            if (validateInput(newText)) {
                tasks[index].text = newText;
                saveTasks();
                renderTasks();
                closePopup(renamePopup);
            }
        };

        document.getElementById('cancel-rename-btn').onclick = () => closePopup(renamePopup);
    };

    const handleDeleteTask = (index) => {
        openPopup(deletePopup);

        document.getElementById('confirm-delete-btn').onclick = () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
            closePopup(deletePopup);
        };

        document.getElementById('cancel-delete-btn').onclick = () => closePopup(deletePopup);
    };

    const handleDeleteDoneTasks = () => {
        openPopup(deleteDonePopup);

        document.getElementById('confirm-delete-done-btn').onclick = () => {
            tasks = tasks.filter(task => !task.done);
            saveTasks();
            renderTasks();
            closePopup(deleteDonePopup);
        };

        document.getElementById('cancel-delete-done-btn').onclick = () => closePopup(deleteDonePopup);
    };

    const deleteAllTasks = () => {
        if (tasks.length === 0) {
            alert('No tasks to delete!');
            return;
        }
        tasks = [];
        saveTasks();
        renderTasks();
    };

    const openPopup = (popup) => popup.classList.remove('hidden');
    const closePopup = (popup) => popup.classList.add('hidden');

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (validateInput(taskText)) {
            tasks.push({ text: taskText, done: false });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    });

    deleteDoneTasksButton.addEventListener('click', handleDeleteDoneTasks);
    deleteAllTasksButton.addEventListener('click', deleteAllTasks);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.id.replace('filter-', '');
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(filter);
        });
    });

    loadTasks();
    renderTasks();
});
