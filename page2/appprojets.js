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
      currentColumnId: null,
      archive: []
  };
  let draggedTask = null;
  let draggedMember = null;
  let editingTaskId = null;
  // Charger les données depuis localStorage
  function loadFromStorage() {
      const saved = localStorage.getItem('projectData');
      if (saved) {
          const data = JSON.parse(saved);
          state.columns = data.columns || state.columns;
          state.archive = data.archive || [];
      }
  }
  // Sauvegarder les données dans localStorage
  function saveToStorage() {
      localStorage.setItem('projectData', JSON.stringify({
          columns: state.columns,
          archive: state.archive
      }));
  }
  // Initialiser l'application
  function init() {
      loadFromStorage();
      renderParticipants();
      renderMembersInModal();
      renderBoard();
      renderArchive();
      setupModal();
      setupDragDrop();
      // Ajouter quelques tâches d'exemple si vide
      if (state.columns[0].tasks.length === 0) {
          state.columns[0].tasks.push(
              { id: 'task-1', text: 'Concevoir la maquette du projet', description: 'Créer les wireframes et mockups', priority: 3, assignees: ['member-1'], completed: false },
              { id: 'task-2', text: 'Réunion d\'équipe à 10h', description: 'Discuter du planning et des objectifs', priority: 2, assignees: ['member-1', 'member-2'], completed: false }
          );
          state.columns[1].tasks.push(
              { id: 'task-3', text: 'Développer les fonctionnalités principales', description: 'API REST, authentification, CRUD', priority: 5, assignees: ['member-2', 'member-4'], completed: false },
              { id: 'task-4', text: 'Tests des API', description: 'Tester tous les endpoints', priority: 4, assignees: ['member-3'], completed: false }
          );
          saveToStorage();
      }
      renderBoard();
  }
  // Afficher les participants
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
  // Ouvrir le modal
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
  // Fermer le modal
  function closeModal() {
      const modal = document.getElementById('taskModal');
      modal.classList.add('hidden');
      state.currentColumnId = null;
      editingTaskId = null;
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
  // Créer une tâche
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
  // Marquer une tâche comme terminée/non terminée
  function toggleTaskCompletion(taskId) {
      let task = null;
      state.columns.forEach(col => {
          const found = col.tasks.find(t => t.id === taskId);
          if (found) task = found;
      });
      if (task) {
          task.completed = !task.completed;
          saveToStorage();
          renderBoard();
      }
  }
  // Archiver une tâche terminée
  function archiveTask(taskId) {
      let task = null;
      let columnId = null;
      state.columns.forEach(col => {
          const index = col.tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
              task = col.tasks[index];
              columnId = col.id;
          }
      });
      if (task) {
          const column = state.columns.find(c => c.id === columnId);
          column.tasks = column.tasks.filter(t => t.id !== taskId);
          
          task.archivedDate = new Date().toLocaleDateString('fr-FR');
          state.archive.push(task);
          
          saveToStorage();
          renderBoard();
          renderArchive();
      }
  }
  // Restaurer une tâche de l'archive
  function restoreArchivedTask(taskId) {
      const index = state.archive.findIndex(t => t.id === taskId);
      if (index !== -1) {
          const task = state.archive[index];
          state.archive.splice(index, 1);
          
          const targetColumn = state.columns[0];
          task.completed = false;
          targetColumn.tasks.push(task);
          
          saveToStorage();
          renderBoard();
          renderArchive();
      }
  }
  // Supprimer définitivement une tâche archivée
  function deleteArchivedTask(taskId) {
      state.archive = state.archive.filter(t => t.id !== taskId);
      saveToStorage();
      renderArchive();
  }
  // Afficher l'archive
  function renderArchive() {
      const archiveList = document.getElementById('archiveList');
      const archiveContent = document.getElementById('archiveContent');
      if (state.archive.length === 0) {
          archiveList.innerHTML = '<div class="archive-empty">Aucune tâche archivée pour le moment</div>';
          return;
      }
      archiveList.innerHTML = '';
      state.archive.forEach(task => {
          const card = document.createElement('div');
          card.className = 'archive-card';
          const title = document.createElement('div');
          title.className = 'archive-card-title';
          title.textContent = task.text;
          const desc = document.createElement('div');
          desc.className = 'archive-card-desc';
          desc.textContent = task.description || '(pas de description)';
          const info = document.createElement('div');
          info.className = 'archive-card-info';
          info.textContent = `Archivée le: ${task.archivedDate}`;
          const actions = document.createElement('div');
          actions.className = 'task-actions';
          const restoreBtn = document.createElement('button');
          restoreBtn.className = 'btn-restore';
          restoreBtn.textContent = '↩️ Restaurer';
          restoreBtn.addEventListener('click', () => {
              restoreArchivedTask(task.id);
          });
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn-delete-archived';
          deleteBtn.textContent = '🗑️ Supprimer';
          deleteBtn.addEventListener('click', () => {
              if (confirm('Êtes-vous sûr de vouloir supprimer définitivement cette tâche?')) {
                  deleteArchivedTask(task.id);
              }
          });
          actions.appendChild(restoreBtn);
          actions.appendChild(deleteBtn);
          card.appendChild(title);
          card.appendChild(desc);
          card.appendChild(info);
          card.appendChild(actions);
          archiveList.appendChild(card);
      });
  }
  // Basculer la visibilité de l'archive
  function toggleArchive() {
      const archiveContent = document.getElementById('archiveContent');
      const btn = document.querySelector('.btn-toggle-archive');
      
      archiveContent.classList.toggle('visible');
      btn.textContent = archiveContent.classList.contains('visible') ? 'Masquer les archives' : 'Afficher les archives';
  }
  // Assigner un participant à une tâche
  function assignMemberToTask(memberId, taskId) {
      let task = null;
      state.columns.forEach(col => {
          const found = col.tasks.find(t => t.id === taskId);
          if (found) task = found;
      });
      if (task && !task.assignees.includes(memberId)) {
          task.assignees.push(memberId);
          saveToStorage();
          renderBoard();
      }
  }
  // Retirer un participant d'une tâche
  function removeMemberFromTask(memberId, taskId) {
      let task = null;
      state.columns.forEach(col => {
          const found = col.tasks.find(t => t.id === taskId);
          if (found) task = found;
      });
      if (task) {
          task.assignees = task.assignees.filter(id => id !== memberId);
          saveToStorage();
          renderBoard();
      }
  }
  // Ajouter une tâche
  function addTask(columnId, text, description, priority, assignees, completed = false) {
      const column = state.columns.find(c => c.id === columnId);
      if (column) {
          const task = {
              id: 'task-' + Date.now(),
              text,
              description,
              priority: priority || 3,
              assignees,
              completed
          };
          column.tasks.push(task);
          saveToStorage();
          renderBoard();
      }
  }
  // Modifier une tâche
  function updateTask(taskId, text, description, priority, assignees, completed) {
      let task = null;
      state.columns.forEach(col => {
          const found = col.tasks.find(t => t.id === taskId);
          if (found) task = found;
      });
      if (task) {
          task.text = text;
          task.description = description;
          task.priority = priority;
          task.assignees = assignees;
          task.completed = completed;
          saveToStorage();
          renderBoard();
      }
  }
  // Déplacer une tâche
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
              saveToStorage();
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
      saveToStorage();
      renderBoard();
  }
  // Supprimer une colonne
  function deleteColumn(columnId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette colonne?')) {
          state.columns = state.columns.filter(c => c.id !== columnId);
          saveToStorage();
          renderBoard();
      }
  }
  // Supprimer une tâche
  function deleteTask(taskId) {
      for (let i = 0; i < state.columns.length; i++) {
          const col = state.columns[i];
          const index = col.tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
              col.tasks.splice(index, 1);
              saveToStorage();
              renderBoard();
              break;
          }
      }
  }
  // Supprimer la tâche en cours d'édition
  function deleteCurrentTask() {
      if (editingTaskId && confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
          deleteTask(editingTaskId);
          closeModal();
      }
  }
  // Configuration du drag-drop
  function setupDragDrop() {
      document.addEventListener('dragover', (e) => {
          e.preventDefault();
      });
  }
  // Initialiser l'application
  init();
