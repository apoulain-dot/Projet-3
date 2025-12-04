// ===============================
// ÉTAT GLOBAL
// ===============================
const state = {
  members: [
    { id: 'member-1', name: 'Alice Dupont' },
    { id: 'member-2', name: 'Bob Martin' },
    { id: 'member-3', name: 'Clara Lopez' },
    { id: 'member-4', name: 'David Chen' }
  ],
  columns: [],           // plus de col-1/2/3 en dur
  currentColumnId: null,
  archive: []
};

let draggedTask = null;
let draggedMember = null;
let editingTaskId = null;

let currentProjectId = null;
let currentUserId = null;

function renderArchive() {
  const archiveList = document.getElementById('archiveList');
  if (!archiveList) return;

  if (!Array.isArray(state.archive) || state.archive.length === 0) {
    archiveList.innerHTML = '<div class="archive-empty">Aucune tâche archivée pour le moment</div>';
    return;
  }

  archiveList.innerHTML = '';
  state.archive.forEach(task => {
    const card = document.createElement('div');
    card.className = 'archive-card';
    card.textContent = task.text || '(tâche archivée)';
    archiveList.appendChild(card);
  });
}

// ===============================
// INIT
// ===============================
function init() {
  const boardEl = document.getElementById('board');
  currentProjectId = parseInt(boardEl?.dataset.projectId || '0', 10);
  console.log('currentProjectId =', currentProjectId);

  if (window.currentUserId) {
    currentUserId = window.currentUserId;
  }

  if (currentProjectId > 0) {
    loadBoardFromDB(currentProjectId);
  } else {
    renderBoard();
  }

  renderParticipants();
  renderMembersInModal();
  renderArchive();
  setupModal();
  setupDragDrop();
}

document.addEventListener('DOMContentLoaded', init);

// ===============================
// PARTICIPANTS
// ===============================
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

// ===============================
// MODAL TÂCHE
// ===============================
function setupModal() {
  const form = document.getElementById('taskForm');
  const prioritySlider = document.getElementById('taskPriority');
  const priorityValue = document.getElementById('priorityValue');

  prioritySlider.addEventListener('input', (e) => {
    priorityValue.textContent = e.target.value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = document.getElementById('taskInput').value.trim();
    const taskDesc = document.getElementById('taskDescription').value.trim();
    const priority = parseInt(document.getElementById('taskPriority').value);
    const checkboxes = document.querySelectorAll('.member-checkbox:checked');
    const assignees = Array.from(checkboxes).map(cb => cb.value);
    const completed = document.getElementById('taskCompleted').checked;

    if (taskText && state.currentColumnId) {
      if (editingTaskId) {
        updateTask(editingTaskId, taskText, taskDesc, priority, assignees, completed);
      } else {
        addTask(state.currentColumnId, taskText, taskDesc, priority, assignees, completed);
      }
      closeModal();
    }
  });
}

function openModal(columnId, taskId = null) {
  state.currentColumnId = columnId;

  const modal = document.getElementById('taskModal');
  const input = document.getElementById('taskInput');
  const desc = document.getElementById('taskDescription');
  const prioritySlider = document.getElementById('taskPriority');
  const priorityValue = document.getElementById('priorityValue');
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const deleteTaskBtn = document.getElementById('deleteTaskBtn');
  const completedCheckbox = document.getElementById('taskCompleted');

  modal.classList.remove('hidden');

  if (taskId) {
    editingTaskId = taskId;
    let task = null;
    state.columns.forEach(col => {
      const found = col.tasks.find(t => t.id === taskId);
      if (found) task = found;
    });
    if (task) {
      modalTitle.textContent = 'Modifier la tâche';
      submitBtn.textContent = 'Modifier';
      deleteTaskBtn.classList.remove('hidden');
      input.value = task.text;
      desc.value = task.description || '';
      prioritySlider.value = task.priority || 3;
      priorityValue.textContent = task.priority || 3;
      completedCheckbox.checked = task.completed || false;
      document.querySelectorAll('.member-checkbox').forEach(cb => {
        cb.checked = task.assignees.includes(cb.value);
      });
    }
  } else {
    editingTaskId = null;
    modalTitle.textContent = 'Créer une nouvelle tâche';
    submitBtn.textContent = 'Créer la tâche';
    deleteTaskBtn.classList.add('hidden');
    input.value = '';
    desc.value = '';
    prioritySlider.value = '3';
    priorityValue.textContent = '3';
    completedCheckbox.checked = false;
    document.querySelectorAll('.member-checkbox').forEach(cb => cb.checked = false);
  }

  input.focus();
}

function closeModal() {
  const modal = document.getElementById('taskModal');
  modal.classList.add('hidden');
  state.currentColumnId = null;
  editingTaskId = null;
  document.getElementById('taskForm').reset();
}

// ===============================
// BOARD
// ===============================
function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  if (!Array.isArray(state.columns)) {
    state.columns = [];
  }

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

  const sortedTasks = [...column.tasks].sort((a, b) => (b.priority || 3) - (a.priority || 3));
  sortedTasks.forEach(task => {
    tasksContainer.appendChild(createTaskElement(task, column.id));
  });
  div.appendChild(tasksContainer);

  const addTaskBtn = document.createElement('button');
  addTaskBtn.className = 'btn-add-task';
  addTaskBtn.textContent = '+ Ajouter une tâche';
  addTaskBtn.onclick = () => openModal(column.id);
  div.appendChild(addTaskBtn);

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
      const taskElement = e.target.closest('.task');
      if (taskElement) {
        const taskId = taskElement.dataset.taskId;
        assignMemberToTask(draggedMember, taskId);
      }
      draggedMember = null;
    } else if (draggedTask) {
      moveTask(draggedTask, column.id);
      draggedTask = null;
    }
  });

  return div;
}

// ===============================
// TÂCHES
// ===============================
function createTaskElement(task, columnId) {
  const div = document.createElement('div');
  div.className = 'task';
  if (task.completed) {
    div.classList.add('completed');
  }
  div.draggable = true;
  div.dataset.taskId = task.id;

  const textDiv = document.createElement('div');
  textDiv.className = 'task-text';
  textDiv.textContent = task.text;

  const descDiv = document.createElement('div');
  descDiv.className = 'task-description';
  descDiv.textContent = task.description || '(pas de description)';

  const priorityDiv = document.createElement('div');
  priorityDiv.className = `task-priority priority-${task.priority || 3}`;
  priorityDiv.textContent = `Priorité: ${task.priority || 3}`;

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
      avatar.onclick = (e) => {
        e.stopPropagation();
        removeMemberFromTask(memberId, task.id);
      };
      assigneesDiv.appendChild(avatar);
    }
  });

  div.appendChild(textDiv);
  div.appendChild(descDiv);
  div.appendChild(priorityDiv);
  div.appendChild(assigneesDiv);

  const actionDiv = document.createElement('div');
  actionDiv.className = 'task-actions';

  const completeBtn = document.createElement('button');
  completeBtn.className = 'btn-archive-task';
  completeBtn.title = task.completed ? 'Marquer comme non-terminée' : 'Marquer comme terminée';
  completeBtn.textContent = task.completed ? '↩️' : '✔️';
  completeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTaskCompletion(task.id);
  });

  const archiveBtn = document.createElement('button');
  archiveBtn.className = 'btn-archive-task';
  archiveBtn.title = 'Archiver la tâche';
  archiveBtn.textContent = '📦';
  archiveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (task.completed) {
      archiveTask(task.id);
    } else {
      alert('Veuillez d\'abord marquer la tâche comme terminée');
    }
  });

  const deleteTaskBtn = document.createElement('button');
  deleteTaskBtn.className = 'btn-delete-task';
  deleteTaskBtn.title = 'Supprimer la tâche';
  deleteTaskBtn.textContent = '🗑️';
  deleteTaskBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });

  actionDiv.appendChild(completeBtn);
  actionDiv.appendChild(archiveBtn);
  actionDiv.appendChild(deleteTaskBtn);
  div.appendChild(actionDiv);

  div.addEventListener('click', (e) => {
    if (!e.target.closest('.task-avatar') && !e.target.closest('.task-actions')) {
      openModal(columnId, task.id);
    }
  });

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

// ===============================
// ADD / MOVE TASKS (DB)
// ===============================
async function addTask(columnId, text, desc, priority, assignees, completed) {
    console.log('addTask columnId =', columnId);
  if (!currentProjectId) {
    alert('Projet inconnu, impossible de créer la tâche.');
    return;
  }

  try {
    const res = await fetch('../add_card.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:       text,
        description: desc,
        list_id:     columnId,          // ENTIER = lists.id
        status:      completed ? 'done' : 'todo',
        due_date:    null,
        assigned_to: null,
        contact_id:  null,
        project_id:  currentProjectId
      })
    });

    const data = await res.json();

    if (data.status !== 'success') {
      alert(data.message || 'Erreur lors de la création de la carte');
      return;
    }

    const newId = data.id;

    const column = state.columns.find(c => c.id === columnId);
    if (!column) return;

    column.tasks.push({
      id:         newId,
      text:       text,
      description: desc,
      priority:   priority || 3,
      assignees:  assignees || [],
      completed:  !!completed
    });

    renderBoard();
  } catch (e) {
    console.error('Erreur addTask / add_card.php:', e);
    alert('Erreur de connexion au serveur');
  }
}

async function moveTask(taskId, targetColumnId) {
  let task = null;

  state.columns.forEach(col => {
    const index = col.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      task = col.tasks[index];
      col.tasks.splice(index, 1);
    }
  });

  if (!task) return;

  const targetColumn = state.columns.find(c => c.id === targetColumnId);
  if (!targetColumn) return;

  targetColumn.tasks.push(task);
  renderBoard();

  try {
    const res = await fetch('../move_card.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: taskId,
        list_id: targetColumnId
      })
    });
    const data = await res.json();
    if (data.status !== 'success') {
      console.error('Erreur move_card:', data.message);
    }
  } catch (e) {
    console.error('Erreur moveTask:', e);
  }
}

// ===============================
// COLONNES (LISTS EN BDD)
// ===============================
async function addColumn(title) {
  const boardId = 4; // mets ici un boards.id qui existe vraiment

  try {
    const res = await fetch('../add_list.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        board_id: boardId,
        position: state.columns.length + 1
      })
    });
    const data = await res.json();
    if (data.status !== 'success') {
      alert(data.message || 'Erreur lors de la création de la colonne');
      return;
    }

    const newListId = data.id;

    state.columns.push({
      id: newListId,
      title: title,
      tasks: []
    });

    renderBoard();
  } catch (e) {
    console.error('Erreur addColumn:', e);
    alert('Erreur de connexion au serveur');
  }
}

// ===============================
// LOAD BOARD FROM DB
// ===============================
async function loadBoardFromDB(projectId) {
  try {
    const resLists = await fetch('../get_lists.php?project_id=' + projectId);
    const dataLists = await resLists.json();

    if (dataLists.status !== 'success') {
      console.error('Erreur get_lists:', dataLists.message);
      return;
    }

    state.columns = dataLists.lists.map(list => ({
      id: list.id,
      title: list.title,
      tasks: []
    }));

    const resCards = await fetch('../get_cards.php?project_id=' + projectId);
    const dataCards = await resCards.json();

    if (dataCards.status !== 'success') {
      console.error('Erreur get_cards:', dataCards.message);
      renderBoard();
      return;
    }

    dataCards.cards.forEach(card => {
      const col = state.columns.find(c => c.id === card.list_id);
      if (!col) return;
      col.tasks.push({
        id: card.id,
        text: card.title,
        description: card.description || '',
        priority: 3,
        assignees: [],
        completed: card.status === 'done'
      });
    });

    renderBoard();
  } catch (e) {
    console.error('Erreur loadBoardFromDB:', e);
  }
}

// ===============================
// DRAG & DROP GLOBAL
// ===============================
function setupDragDrop() {
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
}
