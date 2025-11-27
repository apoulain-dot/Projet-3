// État de l'application
const state = {
    columns: [
        { id: 'col-1', title: '📋 À faire', tasks: [] },
        { id: 'col-2', title: '⚙️ En cours', tasks: [] },
        { id: 'col-3', title: '✅ Terminé', tasks: [] }
    ],
    currentColumnId: null // Pour savoir dans quelle colonne ajouter la tâche
};

let draggedTask = null;

// Initialiser l'application
function init() {
    renderBoard();
    setupModal();
    
    // Ajouter quelques tâches d'exemple
    if (state.columns[0].tasks.length === 0) {
        state.columns[0].tasks.push(
            { id: 'task-1', text: 'Concevoir la maquette du projet' },
            { id: 'task-2', text: 'Réunion d\'équipe à 10h' }
        );
        state.columns[1].tasks.push(
            { id: 'task-3', text: 'Développer les fonctionnalités principales' },
            { id: 'task-4', text: 'Tests des API' }
        );
        renderBoard();
    }
}

// Configuration du modal
function setupModal() {
    const modal = document.getElementById('taskModal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.btn-cancel');
    const form = document.getElementById('taskForm');
    
    // Fermer avec le bouton X
    closeBtn.onclick = () => closeModal();
    
    // Fermer avec le bouton Annuler
    cancelBtn.onclick = () => closeModal();
    
    // Fermer en cliquant sur l'overlay
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    // Fermer avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Soumettre le formulaire
    form.onsubmit = (e) => {
        e.preventDefault();
        const taskText = document.getElementById('taskInput').value.trim();
        if (taskText && state.currentColumnId) {
            addTask(state.currentColumnId, taskText);
            closeModal();
        }
    };
}

// Ouvrir le modal
function openModal(columnId) {
    state.currentColumnId = columnId;
    const modal = document.getElementById('taskModal');
    const input = document.getElementById('taskInput');
    
    modal.classList.remove('hidden');
    input.value = '';
    input.focus(); // Focus automatique pour l'accessibilité
}

// Fermer le modal
function closeModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.add('hidden');
    state.currentColumnId = null;
}

// Afficher le tableau
function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    state.columns.forEach(column => {
        board.appendChild(createColumnElement(column));
    });

    // Ajouter le bouton d'ajout de colonne
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-column';
    addBtn.textContent = '+ Ajouter une colonne';
    addBtn.onclick = () => addColumn();
    board.appendChild(addBtn);
}

// Créer un élément colonne
function createColumnElement(column) {
    const columnEl = document.createElement('div');
    columnEl.className = 'column';
    columnEl.dataset.columnId = column.id;

    const header = document.createElement('div');
    header.className = 'column-header';

    const title = document.createElement('div');
    title.className = 'column-title';
    title.innerHTML = `${column.title} <span class="task-count">${column.tasks.length}</span>`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete-column';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = () => deleteColumn(column.id);

    header.appendChild(title);
    header.appendChild(deleteBtn);
    columnEl.appendChild(header);

    // Conteneur des tâches
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    tasksContainer.dataset.columnId = column.id;
    tasksContainer.ondragover = (e) => allowDrop(e);
    tasksContainer.ondrop = (e) => drop(e, column.id);
    tasksContainer.ondragleave = (e) => dragLeave(e);

    column.tasks.forEach(task => {
        tasksContainer.appendChild(createTaskElement(task));
    });

    columnEl.appendChild(tasksContainer);

    // MODIFIÉ : Bouton qui ouvre le modal au lieu du formulaire inline
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-add-task';
    addBtn.textContent = '+ Ajouter une tâche';
    addBtn.onclick = () => openModal(column.id);
    columnEl.appendChild(addBtn);

    return columnEl;
}

// Créer un élément tâche
function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = 'task';
    taskEl.draggable = true;
    taskEl.dataset.taskId = task.id;

    const content = document.createElement('div');
    content.className = 'task-content';

    const text = document.createElement('div');
    text.className = 'task-text';
    text.textContent = task.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    };

    content.appendChild(text);
    content.appendChild(deleteBtn);
    taskEl.appendChild(content);

    // Événements drag-drop
    taskEl.ondragstart = () => {
        draggedTask = task.id;
        taskEl.classList.add('dragging');
    };
    taskEl.ondragend = () => {
        taskEl.classList.remove('dragging');
    };

    return taskEl;
}

// Ajouter une tâche
function addTask(columnId, text) {
    const column = state.columns.find(c => c.id === columnId);
    if (column) {
        const task = {
            id: 'task-' + Date.now(),
            text: text
        };
        column.tasks.push(task);
        renderBoard();
    }
}

// Supprimer une tâche
function deleteTask(taskId) {
    state.columns.forEach(column => {
        column.tasks = column.tasks.filter(t => t.id !== taskId);
    });
    renderBoard();
}

// Ajouter une colonne
function addColumn() {
    const title = prompt('Nom de la nouvelle colonne:');
    if (title) {
        const column = {
            id: 'col-' + Date.now(),
            title: title,
            tasks: []
        };
        state.columns.push(column);
        renderBoard();
    }
}

// Supprimer une colonne
function deleteColumn(columnId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette colonne ?')) {
        state.columns = state.columns.filter(c => c.id !== columnId);
        renderBoard();
    }
}

// Permettre le drop
function allowDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

// Drag leave
function dragLeave(e) {
    if (e.currentTarget === e.target) {
        e.currentTarget.classList.remove('dragover');
    }
}

// Drop la tâche
function drop(e, columnId) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');

    if (draggedTask) {
        // Trouver la tâche
        let task = null;
        for (let col of state.columns) {
            task = col.tasks.find(t => t.id === draggedTask);
            if (task) {
                col.tasks = col.tasks.filter(t => t.id !== draggedTask);
                break;
            }
        }

        // Ajouter la tâche à la nouvelle colonne
        if (task) {
            const column = state.columns.find(c => c.id === columnId);
            if (column) {
                column.tasks.push(task);
                renderBoard();
            }
        }

        draggedTask = null;
    }
}

init();

// Supprimer une colonne
function deleteColumn(columnId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette colonne ?')) {
        state.columns = state.columns.filter(c => c.id !== columnId);
        renderBoard();
    }
}
// Permettre le drop
function allowDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}
// Drag leave
function dragLeave(e) {
    if (e.currentTarget === e.target) {
        e.currentTarget.classList.remove('dragover');
    }
}
// Drop la tâche
function drop(e, columnId) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (draggedTask) {
// Trouver la tâche
        let task = null;
        for (let col of state.columns) {
            task = col.tasks.find(t => t.id === draggedTask);
            if (task) {
                col.tasks = col.tasks.filter(t => t.id !== draggedTask);
                break;
            }
        }
// Ajouter la tâche à la nouvelle colonne
        if (task) {
            const column = state.columns.find(c => c.id === columnId);
            if (column) {
                column.tasks.push(task);
                renderBoard();
            }
        }
        draggedTask = null;
    }
}

init();