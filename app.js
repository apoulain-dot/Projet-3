// State management
let currentUser = null;
let projects = [
  {
    id: 1,
    name: 'Gestionnaire de projet',
    description: 'Création d\'un site web pour gérer des projets, des tâches et des contacts.',
    collaborators: 'alice',
    status: 'inprogress',
    deadline: '2025-12-05'
  },
];

let contacts = [
  {
    id: 1,
    name: 'Romain Serrano-Cottat',
    email: 'rserranocottat@guardiaschool.fr',
    phone: '+33 6 12 34 56 78',
    role: 'Frontend Leader'
  },
];

// DOM elements
const loginModal = document.getElementById('loginModal');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userWelcome = document.getElementById('userWelcome');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Authentication
function checkAuth() {
  const storedUser = getStoredUser();
  if (storedUser) {
    currentUser = storedUser;
    showMainApp();
  } else {
    showLogin();
  }
}

function getStoredUser() {
  // Since localStorage is not available, we use a variable
  return currentUser;
}

function showLogin() {
  loginModal.classList.remove('hidden');
  mainApp.classList.add('hidden');
}

function showMainApp() {
  loginModal.classList.add('hidden');
  mainApp.classList.remove('hidden');
  userWelcome.textContent = `Bienvenue, ${currentUser}`;
  renderProjects();
  renderContacts();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (username === 'admin' && password === 'admin123') {
    currentUser = username;
    showMainApp();
    loginForm.reset();
  } else {
    alert('Identifiants incorrects. Utilisez: admin / admin123');
  }
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  showLogin();
});

// Navigation
function setupEventListeners() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (!view) return; // SÃ©curitÃ© supplÃ©mentaire
      
      switchView(view);
      
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Add project
  document.getElementById('addProjectBtn').addEventListener('click', () => {
    document.getElementById('addProjectModal').classList.remove('hidden');
  });
  
  document.getElementById('addProjectForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addProject();
  });
  
  // Add contact
  document.getElementById('addContactBtn').addEventListener('click', () => {
    document.getElementById('addContactModal').classList.remove('hidden');
  });
  
  document.getElementById('addContactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addContact();
  });
  
  // Modal close buttons
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      document.getElementById(modalId).classList.add('hidden');
    });
  });
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`${viewName}View`);
  targetView.classList.remove('hidden');
  targetView.classList.add('active');
}

// Projects
function renderProjects() {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = '';
  
  if (projects.length === 0) {
    projectsList.innerHTML = '<p style="color: var(--color-text-secondary);">Aucun projet pour le moment. Créez votre premier projet !</p>';
    return;
  }
  
  projects.forEach(project => {
    const card = createProjectCard(project);
    projectsList.appendChild(card);
  });
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  
  const collaborators = {
    alice: 'Alice Dupont',
    bob: 'Bob Martin',
    carol: 'Carol Durand'
  };

  const statusLabels = {
    inprogress: 'En cours',
    completed: 'Terminé'
  };

  const formattedDeadline = new Date(project.deadline).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  card.innerHTML = `
    <div class="project-header">
      <h3 class="project-title">${project.name}</h3>
      <span class="project-status status-${project.status}">${statusLabels[project.status]}</span>
    </div>
    <p class="project-description">${project.description}</p>
    <div class="project-collaborators">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="7" r="4">${collaborators[project.collaborators]}</circle>
        <path d="M5.5 21a8.38 8.38 0 0 1 13 0"></path>
      </svg>
      Collaborateur: ${collaborators[project.collaborators]}
    </div>
    <div class="project-deadline">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      Date limite: ${formattedDeadline}
    </div>
  `;
  
  return card;
}

function addProject() {
  const name = document.getElementById('projectName').value;
  const description = document.getElementById('projectDescription').value;
  const collaborators = document.getElementById('projectManager').value;
  const status = document.getElementById('projectStatus').value;
  const deadline = document.getElementById('projectDeadline').value;
  
  const newProject = {
    id: projects.length + 1,
    name,
    description,
    collaborators,
    status,
    deadline
  };
  
  projects.push(newProject);
  renderProjects();
  
  document.getElementById('addProjectModal').classList.add('hidden');
  document.getElementById('addProjectForm').reset();
}

// Contacts
function renderContacts() {
  const contactsList = document.getElementById('contactsList');
  contactsList.innerHTML = '';
  
  if (contacts.length === 0) {
    contactsList.innerHTML = '<p style="color: var(--color-text-secondary);">Aucun contact pour le moment. Ajoutez votre premier contact !</p>';
    return;
  }
  
  contacts.forEach(contact => {
    const card = createContactCard(contact);
    contactsList.appendChild(card);
  });
}

function createContactCard(contact) {
  const card = document.createElement('div');
  card.className = 'contact-card';
  
  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  card.innerHTML = `
    <div class="contact-avatar">${initials}</div>
    <div class="contact-name">${contact.name}</div>
    <div class="contact-role">${contact.role || 'Non spÃ©cifiÃ©'}</div>
    <div class="contact-info">
      <div class="contact-info-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        ${contact.email}
      </div>
      ${contact.phone ? `
        <div class="contact-info-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          ${contact.phone}
        </div>
      ` : ''}
    </div>
  `;
  
  return card;
}

function addContact() {
  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const phone = document.getElementById('contactPhone').value;
  const role = document.getElementById('contactRole').value;
  
  const newContact = {
    id: contacts.length + 1,
    name,
    email,
    phone,
    role
  };
  
  contacts.push(newContact);
  renderContacts();
  
  document.getElementById('addContactModal').classList.add('hidden');
  document.getElementById('addContactForm').reset();
}