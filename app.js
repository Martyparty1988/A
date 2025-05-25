document.addEventListener('DOMContentLoaded', () => {
    const taskTextInput = document.getElementById('task-text');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskCategoryInput = document.getElementById('task-category');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListUL = document.getElementById('task-list');
    const filterTasksSelect = document.getElementById('filter-tasks');
    const sortTasksSelect = document.getElementById('sort-tasks');

    let tasks = [];

    // Načtení úkolů z LocalStorage
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        renderTasks();
    }

    // Uložení úkolů do LocalStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Přidání nového úkolu
    function addTask() {
        const text = taskTextInput.value.trim();
        const priority = taskPriorityInput.value;
        const dueDate = taskDueDateInput.value;
        const category = taskCategoryInput.value.trim();

        if (text === '') {
            alert('Text úkolu nesmí být prázdný.');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            priority: priority,
            dueDate: dueDate,
            category: category,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();

        // Vyčištění vstupních polí
        taskTextInput.value = '';
        taskPriorityInput.value = 'medium';
        taskDueDateInput.value = '';
        taskCategoryInput.value = '';
    }

    // Smazání úkolu
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }

    // Přepnutí stavu dokončení úkolu
    function toggleComplete(taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    // Vykreslení úkolů (včetně filtrování a řazení)
    function renderTasks() {
        taskListUL.innerHTML = ''; // Vyčistit seznam před novým vykreslením

        let tasksToRender = [...tasks];

        // Filtrování
        const filterValue = filterTasksSelect.value;
        if (filterValue === 'active') {
            tasksToRender = tasksToRender.filter(task => !task.completed);
        } else if (filterValue === 'completed') {
            tasksToRender = tasksToRender.filter(task => task.completed);
        }

        // Řazení
        const sortValue = sortTasksSelect.value;
        const priorityOrder = { high: 1, medium: 2, low: 3 }; // Pro řazení priorit

        if (sortValue === 'dueDate') {
            tasksToRender.sort((a, b) => {
                if (!a.dueDate) return 1; // Úkoly bez data na konec
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        } else if (sortValue === 'priority') {
            tasksToRender.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        // 'default' řazení je podle přidání, což je přirozené pořadí v poli tasks


        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            li.classList.add(`priority-${task.priority}`);
            if (task.completed) {
                li.classList.add('completed');
            }

            // Normální zobrazení úkolu
            const taskContentDiv = document.createElement('div');
            taskContentDiv.classList.add('task-content');
            
            const taskTextSpan = document.createElement('span');
            taskTextSpan.classList.add('task-text');
            taskTextSpan.textContent = task.text;
            taskTextSpan.addEventListener('click', () => toggleComplete(task.id)); // Kliknutím na text označit jako (ne)dokončený
            
            const taskActionsDiv = document.createElement('div');
            taskActionsDiv.classList.add('task-actions');

            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.textContent = 'Upravit';
            editBtn.addEventListener('click', () => showEditForm(li, task));

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Smazat';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            taskActionsDiv.appendChild(editBtn);
            taskActionsDiv.appendChild(deleteBtn);
            taskContentDiv.appendChild(taskTextSpan);
            taskContentDiv.appendChild(taskActionsDiv);

            const taskDetailsDiv = document.createElement('div');
            taskDetailsDiv.classList.add('task-details');
            if (task.dueDate) {
                const dueDateSpan = document.createElement('span');
                dueDateSpan.textContent = `Termín: ${new Date(task.dueDate).toLocaleDateString('cs-CZ')}`;
                taskDetailsDiv.appendChild(dueDateSpan);
            }
            if (task.category) {
                const categorySpan = document.createElement('span');
                categorySpan.textContent = `Kategorie: ${task.category}`;
                taskDetailsDiv.appendChild(categorySpan);
            }
            const prioritySpan = document.createElement('span');
            prioritySpan.textContent = `Priorita: ${taskPriorityInput.querySelector('option[value="' + task.priority + '"]').textContent}`;
            taskDetailsDiv.appendChild(prioritySpan);


            // Editační formulář (skrytý defaultně)
            const editFormDiv = document.createElement('div');
            editFormDiv.classList.add('edit-form');
            editFormDiv.innerHTML = `
                <input type="text" class="edit-text" value="${task.text}">
                <select class="edit-priority">
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Nízká</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Střední</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Vysoká</option>
                </select>
                <input type="date" class="edit-due-date" value="${task.dueDate || ''}">
                <input type="text" class="edit-category" value="${task.category || ''}" placeholder="Kategorie">
                <div class="edit-actions">
                    <button class="save-btn">Uložit</button>
                    <button class="cancel-btn">Zrušit</button>
                </div>
            `;

            li.appendChild(taskContentDiv);
            li.appendChild(taskDetailsDiv);
            li.appendChild(editFormDiv); // Přidáme editační formulář, ale je skrytý CSSkem
            taskListUL.appendChild(li);
        });
    }
    
    // Zobrazení editačního formuláře
    function showEditForm(liElement, task) {
        liElement.classList.add('editing'); // Přidá třídu pro zobrazení formuláře a skrytí obsahu
        
        const editForm = liElement.querySelector('.edit-form');
        const saveBtn = editForm.querySelector('.save-btn');
        const cancelBtn = editForm.querySelector('.cancel-btn');

        saveBtn.onclick = () => { // Použijeme .onclick pro snadné přepsání, pokud by bylo potřeba
            const newText = editForm.querySelector('.edit-text').value.trim();
            const newPriority = editForm.querySelector('.edit-priority').value;
            const newDueDate = editForm.querySelector('.edit-due-date').value;
            const newCategory = editForm.querySelector('.edit-category').value.trim();

            if (newText === '') {
                alert('Text úkolu nesmí být prázdný.');
                return;
            }

            updateTask(task.id, newText, newPriority, newDueDate, newCategory);
            liElement.classList.remove('editing'); // Skryje formulář
            renderTasks(); // Znovu vykreslí seznam s úpravami
        };

        cancelBtn.onclick = () => {
            liElement.classList.remove('editing'); // Jen skryje formulář bez uložení
            // Není potřeba renderTasks(), pokud se nic nezměnilo
        };
    }

    // Aktualizace úkolu po editaci
    function updateTask(taskId, newText, newPriority, newDueDate, newCategory) {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
            taskToUpdate.text = newText;
            taskToUpdate.priority = newPriority;
            taskToUpdate.dueDate = newDueDate;
            taskToUpdate.category = newCategory;
            saveTasks();
        }
    }

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskTextInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    filterTasksSelect.addEventListener('change', renderTasks);
    sortTasksSelect.addEventListener('change', renderTasks);

    // První načtení a vykreslení
    loadTasks();
});
