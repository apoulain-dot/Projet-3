// État de l'application
const state = {
    members: [
        { id: 'member-1', name: 'Alice Dupont' },
        { id: 'member-2', name: 'Bob Martin' },
        { id: 'member-3', name: 'Clara Lopez' },
        { id: 'member-4', name: 'David Chen' }
    ],
    columns: [
        { id: 'col-1', title: '📋 À faire', tasks: [] },
        { id: 'col-2', title: '⚙️ En cours', tasks: [] },
        { id: 'col-3', title: '✅ Terminé', tasks: [] }
    ],
    currentColumnId: null
};
let draggedTask = null;
let draggedMember = null;
// Initialiser l'application
function init() {
    renderParticipants();
    renderMembersInModal();
    renderBoard();
    setupModal();
    setupDragDrop();
    // Ajouter quelques tâches d'exemple
    if (state.columns[0].tasks.length === 0) {
        state.columns[0].tasks.push(
            { id: 'task-1', text: 'Concevoir la maquette du projet', description: 'Créer les wireframes et mockups', assignees: ['member-1'] },
            { id: 'task-2', text: 'Réunion d\'équipe à 10h', description: 'Discuter du planning et des objectifs', assignees: ['member-1', 'member-2'] }
        );
        state.columns[1].tasks.push(
            { id: 'task-3', text: 'Développer les fonctionnalités principales', description: 'API REST, authentification, CRUD', assignees: ['member-2', 'member-4'] },
            { id: 'task-4', text: 'Tests des API', description: 'Tester tous les endpoints', assignees: ['member-3'] }
        );
        renderBoard();
    }
}
// Afficher les participants dans la barre latérale
function renderParticipants() {
    const participantsList = document.getElementById('participantsList');
    participantsList.innerHTML = '';
    state.members.forEach(member => {
        const div = document.createElement('div');
        div.className = 'participant-item';
        div.draggable = true;
        div.textContent = member.name;
        div.dataset.memberId = member.id;
        div.addEventListener('dragstart', (e) => {
            draggedMember = member.id;
            e.dataTransfer.effectAllowed = 'copy';
            div.classList.add('dragging');
        });
        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
            draggedMember = null;
        });
        participantsList.appendChild(div);
    });
}
// Afficher les membres dans le modal
function renderMembersInModal() {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '';
    state.members.forEach(member => {
        const label = document.createElement('label');
        label.className = 'member-checkbox-label';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'member-checkbox';
        checkbox.value = member.id;
        const span = document.createElement('span');
        span.textContent = member.name;
        label.appendChild(checkbox);
        label.appendChild(span);
        membersList.appendChild(label);
    });
}
// Configuration du modal
function setupModal() {
    const modal = document.getElementById('taskModal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.btn-cancel');
    const form = document.getElementById('taskForm');
    closeBtn.addEventListener('click', () => closeModal());
    cancelBtn.addEventListener('click', () => closeModal());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = document.getElementById('taskInput').value.trim();
        const taskDesc = document.getElementById('taskDescription').value.trim();
        const checkboxes = document.querySelectorAll('.member-checkbox:checked');
        const assignees = Array.from(checkboxes).map(cb => cb.value);
        if (taskText && state.currentColumnId) {
            addTask(state.currentColumnId, taskText, taskDesc, assignees);
            closeModal();
        } else {
            alert('Veuillez entrer un titre pour la tâche!');
        }
    });
}
// Ouvrir le modal
function openModal(columnId) {
    state.currentColumnId = columnId;
    const modal = document.getElementById('taskModal');
    const input = document.getElementById('taskInput');
    const desc = document.getElementById('taskDescription');
    modal.classList.remove('hidden');
    input.value = '';
    desc.value = '';
    document.querySelectorAll('.member-checkbox').forEach(cb => cb.checked = false);
    input.focus();
}
// Fermer le modal
function closeModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.add('hidden');
    state.currentColumnId = null;
    document.getElementById('taskForm').reset();
}
// Afficher le tableau
function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    state.columns.forEach(column => {
        board.appendChild(createColumnElement(column));
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-column';
    addBtn.textContent = '+ Ajouter une colonne';
    addBtn.onclick = () => {
        const title = prompt('Titre de la nouvelle colonne:');
        if (title) addColumn(title);
    };
    board.appendChild(addBtn);
}
// Créer un élément de colonne
function createColumnElement(column) {
    const div = document.createElement('div');
    div.className = 'column';
    div.dataset.columnId = column.id;
    const header = document.createElement('div');
    header.className = 'column-header';
    const title = document.createElement('h3');
    title.className = 'column-title';
    title.textContent = column.title;
    const actions = document.createElement('div');
    actions.className = 'column-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete-column';
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = () => deleteColumn(column.id);
    actions.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(actions);
    div.appendChild(header);
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    tasksContainer.dataset.columnId = column.id;
    column.tasks.forEach(task => {
        tasksContainer.appendChild(createTaskElement(task, column.id));
    });
    div.appendChild(tasksContainer);
    const addTaskBtn = document.createElement('button');
    addTaskBtn.className = 'btn-add-task';
    addTaskBtn.textContent = '+ Ajouter une tâche';
    addTaskBtn.onclick = () => openModal(column.id);
    div.appendChild(addTaskBtn);
    
    // Support du drag-drop pour les tâches ET les participants
    tasksContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = draggedMember ? 'copy' : 'move';
        tasksContainer.classList.add('drag-over');
    });
    tasksContainer.addEventListener('dragleave', () => {
        tasksContainer.classList.remove('drag-over');
    });
    tasksContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        tasksContainer.classList.remove('drag-over');
        if (draggedMember) {
            // Trouver la tâche sur laquelle on lâche
            const taskElement = e.target.closest('.task');
            if (taskElement) {
                const taskId = taskElement.dataset.taskId;
                assignMemberToTask(draggedMember, taskId);
            }
            draggedMember = null;
        } else if (draggedTask) {
            // Logique de déplacement de tâche existante
            moveTask(draggedTask, column.id);
            draggedTask = null;
        }
    });
    return div;
}
// Créer un élément de tâche
function createTaskElement(task, columnId) {
    const div = document.createElement('div');
    div.className = 'task';
    div.draggable = true;
    div.dataset.taskId = task.id;
    const textDiv = document.createElement('div');
    textDiv.className = 'task-text';
    textDiv.textContent = task.text;
    const descDiv = document.createElement('div');
    descDiv.className = 'task-description';
    descDiv.textContent = task.description || '(pas de description)';
    const assigneesDiv = document.createElement('div');
    assigneesDiv.className = 'task-assignees';
    task.assignees.forEach(memberId => {
        const member = state.members.find(m => m.id === memberId);
        if (member) {
            const avatar = document.createElement('div');
            avatar.className = 'task-avatar';
            avatar.title = member.name;
            avatar.textContent = member.name.charAt(0);
            avatar.dataset.memberId = memberId;
            avatar.onclick = () => removeMemberFromTask(memberId, task.id);
            assigneesDiv.appendChild(avatar);
        }
    });
    div.appendChild(textDiv);
    div.appendChild(descDiv);
    div.appendChild(assigneesDiv);
    // Bouton de suppression de la tâche
    const deleteTaskBtn = document.createElement('button');
    deleteTaskBtn.className = 'btn-delete-task';
    deleteTaskBtn.title = 'Supprimer la tâche';
    deleteTaskBtn.textContent = '🗑️';
    deleteTaskBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    div.appendChild(deleteTaskBtn);
    // Drag-drop pour les tâches
    div.addEventListener('dragstart', (e) => {
        draggedTask = task.id;
        e.dataTransfer.effectAllowed = 'move';
        div.classList.add('dragging');
    });
    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
        draggedTask = null;
    });
    return div;
}
// Assigner un participant à une tâche (drag-drop depuis la barre)
function assignMemberToTask(memberId, taskId) {
    let task = null;
    state.columns.forEach(col => {
        const found = col.tasks.find(t => t.id === taskId);
        if (found) task = found;
    });
    if (task && !task.assignees.includes(memberId)) {
        task.assignees.push(memberId);
        renderBoard();
    }
}
// Retirer un participant d'une tâche (clic sur l'avatar)
function removeMemberFromTask(memberId, taskId) {
    let task = null;
    state.columns.forEach(col => {
        const found = col.tasks.find(t => t.id === taskId);
        if (found) task = found;
    });
    if (task) {
        task.assignees = task.assignees.filter(id => id !== memberId);
        renderBoard();
    }
}
// Ajouter une tâche
function addTask(columnId, text, description, assignees) {
    const column = state.columns.find(c => c.id === columnId);
    if (column) {
        const task = {
            id: 'task-' + Date.now(),
            text,
            description,
            assignees
        };
        column.tasks.push(task);
        renderBoard();
    }
}
// Déplacer une tâche entre colonnes
function moveTask(taskId, targetColumnId) {
    let task = null;
    let sourceColumnId = null;
    state.columns.forEach(col => {
        const index = col.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            task = col.tasks[index];
            sourceColumnId = col.id;
        }
    });
    if (task && sourceColumnId !== targetColumnId) {
        const sourceColumn = state.columns.find(c => c.id === sourceColumnId);
        const targetColumn = state.columns.find(c => c.id === targetColumnId);
        if (sourceColumn && targetColumn) {
            sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== taskId);
            targetColumn.tasks.push(task);
            renderBoard();
        }
    }
}
// Ajouter une colonne
function addColumn(title) {
    const column = {
        id: 'col-' + Date.now(),
        title,
        tasks: []
    };
    state.columns.push(column);
    renderBoard();
}
// Supprimer une colonne
function deleteColumn(columnId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette colonne?')) {
        state.columns = state.columns.filter(c => c.id !== columnId);
        renderBoard();
    }
}
// Supprimer une tâche
function deleteTask(taskId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    for (let i = 0; i < state.columns.length; i++) {
        const col = state.columns[i];
        const index = col.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            col.tasks.splice(index, 1);
            renderBoard();
            return;
        }
    }
}
// Configuration du drag-drop
function setupDragDrop() {
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
}

init();