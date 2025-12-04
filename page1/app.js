
// ==========================================
// GESTION D'ÉTAT (State Management)
// ==========================================
let currentUser = null;
let currentUserId = null; // ajouter cette variable globale

let projects = [
  {
    id: 1,
    name: 'Gestionnaire de projet',
    description: 'Création d\'un site web pour gérer des projets, des tâches et des contacts.',
    status: 'inprogress',
    deadline: '2025-12-05',
    collaborators: [1, 2]
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
  {
    id: 2,
    name: 'Alice Dupont',
    email: 'adupont@test.com',
    phone: '+33 7 87 65 43 21',
    role: 'Backend Developer'
  }
];

let registeredUsers = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    fullname: 'Administrator'
  }
];

let editingProjectId = null;
let selectedCollaborators = [];

// ==========================================
// ÉLÉMENTS DU DOM
// ==========================================

const container = document.querySelector('.container');
const mainApp = document.getElementById('mainApp');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const headerTitle = document.getElementById('headerTitle');
const headerDesc = document.getElementById('headerDesc');
const successMessage = document.getElementById('successMessage');
const loginSuccessMessage = document.getElementById('loginSuccessMessage');
const logoutBtn = document.getElementById('logoutBtn');
const userWelcome = document.getElementById('userWelcome');

// ==========================================
// INITIALISATION DE L'APPLICATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupAuthEventListeners();
  setupAppEventListeners();
});

// ==========================================
// AUTHENTIFICATION - TAB SWITCHING
// ==========================================

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Mise à jour de l'onglet actif
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Affichage/Masquage des formulaires
    if (tabName === 'signup') {
      signupForm.style.display = 'block';
      loginForm.style.display = 'none';
      headerTitle.textContent = 'Inscription';
      headerDesc.textContent = 'Créez votre compte pour commencer';
    } else {
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
      headerTitle.textContent = 'Connexion';
      headerDesc.textContent = 'Connectez-vous à votre compte';
    }

    // Réinitialisation des messages
    successMessage.classList.remove('show');
    loginSuccessMessage.classList.remove('show');
  });
});

// ==========================================
// AUTHENTIFICATION - INSCRIPTION
// ==========================================

const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsInput = document.getElementById('terms');
const togglePasswordBtn = document.getElementById('togglePassword');
const strengthBar = document.getElementById('strengthBar');

// Indicateur de force du mot de passe
passwordInput.addEventListener('input', () => {
  const value = passwordInput.value;
  let strength = 0;
    
  if (value.length >= 8) strength++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
  if (/[0-9]/.test(value)) strength++;
  if (/[^a-zA-Z0-9]/.test(value)) strength++;

  strengthBar.classList.remove('medium', 'strong');
  if (strength === 2) strengthBar.classList.add('medium');
  else if (strength >= 3) strengthBar.classList.add('strong');
  
  validateSignupField(passwordInput);
});

// Affichage/Masquage du mot de passe - Inscription
togglePasswordBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

// Validation au blur
fullnameInput.addEventListener('blur', () => validateSignupField(fullnameInput));
emailInput.addEventListener('blur', () => validateSignupField(emailInput));
passwordInput.addEventListener('blur', () => validateSignupField(passwordInput));
confirmPasswordInput.addEventListener('blur', () => validateSignupField(confirmPasswordInput));

function validateSignupField(field) {
  const errorElement = document.getElementById(field.id + 'Error');
  let isValid = true;
  let errorMsg = '';

  if (field.id === 'fullname') {
    if (!field.value.trim()) {
      isValid = false;
      errorMsg = 'Le nom complet est requis';
    } else if (field.value.trim().length < 3) {
      isValid = false;
      errorMsg = 'Le nom doit contenir au moins 3 caractères';
    }
  }

  if (field.id === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!field.value.trim()) {
      isValid = false;
      errorMsg = 'L\'adresse e-mail est requise';
    } else if (!emailRegex.test(field.value)) {
      isValid = false;
      errorMsg = 'Veuillez entrer une adresse e-mail valide';
    }
  }

  if (field.id === 'password') {
    if (!field.value) {
      isValid = false;
      errorMsg = 'Le mot de passe est requis';
    } else if (field.value.length < 8) {
      isValid = false;
      errorMsg = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/[a-z]/.test(field.value) || !/[A-Z]/.test(field.value)) {
      isValid = false;
      errorMsg = 'Le mot de passe doit contenir des majuscules et minuscules';
    }
  }

  if (field.id === 'confirmPassword') {
    if (!field.value) {
      isValid = false;
      errorMsg = 'La confirmation est requise';
    } else if (field.value !== passwordInput.value) {
      isValid = false;
      errorMsg = 'Les mots de passe ne correspondent pas';
    }
  }

  if (isValid) {
    field.classList.remove('error');
    field.classList.add('success');
    errorElement.classList.remove('show');
  } else {
    field.classList.remove('success');
    field.classList.add('error');
    errorElement.textContent = errorMsg;
    errorElement.classList.add('show');
  }

  return isValid;
}

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Validation de tous les champs
  const fullnameValid = validateSignupField(fullnameInput);
  const emailValid = validateSignupField(emailInput);
  const passwordValid = validateSignupField(passwordInput);
  const confirmValid = validateSignupField(confirmPasswordInput);

  // Validation des conditions
  let termsValid = true;
  const termsError = document.getElementById('termsError');
  if (!termsInput.checked) {
    termsValid = false;
    termsError.textContent = 'Vous devez accepter les conditions';
    termsError.classList.add('show');
  } else {
    termsError.classList.remove('show');
  }

  if (fullnameValid && emailValid && passwordValid && confirmValid && termsValid) {

    const userData = {
    fullname: fullnameInput.value,
    email: emailInput.value,
    password: passwordInput.value
};
        
fetch('../signup.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
})
.then(response => response.json())
.then(data => {
    if (data.status === 'success') {
        // Succès : afficher le message
        signupForm.style.display = 'none';
        successMessage.classList.add('show');
        
        // Redirection après 2 secondes
        setTimeout(() => {
            loginForm.style.display = 'block';
            successMessage.classList.remove('show');
            signupForm.style.display = 'block';
            signupForm.reset();
            
            // Passage à l'onglet connexion
            tabButtons.forEach(b => b.classList.remove('active'));
            tabButtons[1].classList.add('active');
            headerTitle.textContent = 'Connexion';
            headerDesc.textContent = 'Connectez-vous à votre compte';
        }, 2000);
    } else {
        // Erreur du serveur
        alert('Erreur : ' + (data.message || 'Une erreur est survenue'));
    }
})
.catch(error => {
    console.error('Erreur:', error);
    alert('Erreur de connexion au serveur');
});
    // Enregistrement de l'utilisateur
    registeredUsers.push({
      email: emailInput.value,
      password: passwordInput.value,
      fullname: fullnameInput.value
    });

    // Affichage du message de succès
    signupForm.style.display = 'none';
    successMessage.classList.add('show');
    
    // Redirection après 2 secondes
    setTimeout(() => {
      loginForm.style.display = 'block';
      successMessage.classList.remove('show');
      signupForm.style.display = 'block';
      signupForm.reset();
      
      // Passage à l'onglet connexion
      tabButtons.forEach(b => b.classList.remove('active'));
      tabButtons[1].classList.add('active');
      headerTitle.textContent = 'Connexion';
      headerDesc.textContent = 'Connectez-vous à votre compte';
    }, 2000);
  }
});

// ==========================================
// AUTHENTIFICATION - CONNEXION
// ==========================================

const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const toggleLoginPasswordBtn = document.getElementById('toggleLoginPassword');
const rememberMeInput = document.getElementById('rememberMe');

// Affichage/Masquage du mot de passe - Connexion
toggleLoginPasswordBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const type = loginPasswordInput.type === 'password' ? 'text' : 'password';
  loginPasswordInput.type = type;
  toggleLoginPasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

// Validation au blur
loginEmailInput.addEventListener('blur', () => validateLoginField(loginEmailInput));
loginPasswordInput.addEventListener('blur', () => validateLoginField(loginPasswordInput));

function validateLoginField(field) {
  const errorElement = document.getElementById(field.id + 'Error');
  let isValid = true;
  let errorMsg = '';

  if (field.id === 'loginEmail') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!field.value.trim()) {
      isValid = false;
      errorMsg = 'L\'adresse e-mail est requise';
    } else if (!emailRegex.test(field.value)) {
      isValid = false;
      errorMsg = 'Veuillez entrer une adresse e-mail valide';
    }
  }

  if (field.id === 'loginPassword') {
    if (!field.value) {
      isValid = false;
      errorMsg = 'Le mot de passe est requis';
    }
  }

  if (isValid) {
    field.classList.remove('error');
    field.classList.add('success');
    errorElement.classList.remove('show');
  } else {
    field.classList.remove('success');
    field.classList.add('error');
    errorElement.textContent = errorMsg;
    errorElement.classList.add('show');
  }

  return isValid;
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Validation
  const emailValid = validateLoginField(loginEmailInput);
  const passwordValid = validateLoginField(loginPasswordInput);

  if (!emailValid || !passwordValid) return;

  const userData = {
    email: loginEmailInput.value,
    password: loginPasswordInput.value
  };

  fetch('../login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        currentUser = data.full_name;
        currentUserId = data.user_id;
        loginForm.style.display = 'none';
        loginSuccessMessage.classList.add('show');

        setTimeout(() => {
          showMainApp();
          loginForm.style.display = 'block';
          loginSuccessMessage.classList.remove('show');
          loginForm.reset();
          loginEmailInput.classList.remove('success', 'error');
          loginPasswordInput.classList.remove('success', 'error');
        }, 1500);
      } else {
        alert(data.message || 'Identifiants invalides');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Erreur de connexion au serveur');
    });
});

// ==========================================
// VÉRIFICATION DE L'AUTHENTIFICATION
// ==========================================

function checkAuth() {
  if (currentUser) {
    showMainApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  container.classList.remove('hidden');
  mainApp.classList.add('hidden');
}

function showMainApp() {
  container.classList.add('hidden');
  mainApp.classList.remove('hidden');
  userWelcome.textContent = `Bienvenue, ${currentUser}`;
  loadProjectsFromDB();
  loadContactsFromDB();
}

async function loadContactsFromDB() {
  try {
    const response = await fetch('../get_contacts.php?user_id=' + currentUserId);
    const data = await response.json();
    
    if (data.status === 'success') {
      contacts = data.contacts.map(c => ({
        id: parseInt(c.id, 10),
        name: c.full_name,
        email: c.email,
        phone: c.phone,
        role: c.role
      }));
    } else {
      contacts = [];
      console.error(data.message || 'Erreur lors du chargement des contacts');
    }
    renderContacts();
  } catch (error) {
    console.error('Erreur chargement contacts:', error);
    contacts = [];
  }
}


// Déconnexion
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  showLogin();
  loginForm.reset();
  signupForm.reset();
  tabButtons.forEach(b => b.classList.remove('active'));
  tabButtons[0].classList.add('active');
  headerTitle.textContent = 'Inscription';
  headerDesc.textContent = 'Créez votre compte pour commencer';
  signupForm.style.display = 'block';
  loginForm.style.display = 'none';
  loginEmailInput.classList.remove('success', 'error');
  loginPasswordInput.classList.remove('success', 'error');
});

// ==========================================
// GESTION DE L'APPLICATION - NAVIGATION
// ==========================================

function setupAppEventListeners() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (!view) return;
      
      switchView(view);
      
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Ajout de projet
  document.getElementById('addProjectBtn').addEventListener('click', () => {
    editingProjectId = null;
    selectedCollaborators = [];
    resetProjectForm();
    renderCollaboratorsList();
    document.getElementById('addProjectModal').classList.remove('hidden');
  });
  
  document.getElementById('addProjectForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addOrUpdateProject();
  });
  
  // Ajout de contact
  document.getElementById('addContactBtn').addEventListener('click', () => {
    document.getElementById('addContactModal').classList.remove('hidden');
  });
  
  document.getElementById('addContactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addContact();
  });
  
  // Boutons de fermeture des modales
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      document.getElementById(modalId).classList.add('hidden');
    });
  });
}

function setupAuthEventListeners() {
  // Déjà géré dans les sections inscription/connexion
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`${viewName}View`);
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }
}

// ==========================================
// GESTION DES COLLABORATEURS
// ==========================================

function renderCollaboratorsList() {
  const container = document.getElementById('projectCollaborators');
  if (!container) return;

  // Créer le conteneur si n'existe pas
  let collaboratorsContainer = document.getElementById('collaboratorsListContainer');
  if (!collaboratorsContainer) {
    collaboratorsContainer = document.createElement('div');
    collaboratorsContainer.id = 'collaboratorsListContainer';
    collaboratorsContainer.style.cssText = 'margin-top: 12px; padding: 12px; background: var(--color-secondary); border-radius: 8px;';
    container.parentElement.insertBefore(collaboratorsContainer, container.nextElementSibling);
  }

  let html = '<div style="margin-bottom: 12px;"><strong>Sélectionnez les collaborateurs :</strong></div>';
  html += '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';

  contacts.forEach(contact => {
    const isSelected = selectedCollaborators.includes(contact.id);
    html += `
      <button type="button" class="btn btn--sm" data-add-collaborator="${contact.id}" style="background: ${isSelected ? 'var(--color-primary)' : 'var(--color-surface)'}; color: ${isSelected ? 'var(--color-btn-primary-text)' : 'var(--color-text)'}; border: 1px solid var(--color-border); cursor: pointer;">
        ${contact.name}
      </button>
    `;
  });

  html += '</div>';

  // Afficher les collaborateurs sélectionnés
  if (selectedCollaborators.length > 0) {
    html += '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border);"><strong>Collaborateurs sélectionnés :</strong></div>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">';
    
    selectedCollaborators.forEach(id => {
      const contact = contacts.find(c => c.id === id);
      if (contact) {
        html += `
          <div style="background: var(--color-primary); color: var(--color-btn-primary-text); padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px; font-size: 13px;">
            ${contact.name}
            <button type="button" class="btn" data-remove-collaborator="${id}" style="background: none; border: none; color: inherit; cursor: pointer; padding: 0; font-size: 16px; line-height: 1;">×</button>
          </div>
        `;
      }
    });
    
    html += '</div>';
  }

  collaboratorsContainer.innerHTML = html;

  // Ajouter les event listeners
  collaboratorsContainer.querySelectorAll('[data-add-collaborator]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const contactId = parseInt(btn.dataset.addCollaborator);
      if (!selectedCollaborators.includes(contactId)) {
        selectedCollaborators.push(contactId);
        renderCollaboratorsList();
      }
    });
  });

  collaboratorsContainer.querySelectorAll('[data-remove-collaborator]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const contactId = parseInt(btn.dataset.removeCollaborator);
      selectedCollaborators = selectedCollaborators.filter(id => id !== contactId);
      renderCollaboratorsList();
    });
  });
}

// ==========================================
// GESTION DES PROJETS
// ==========================================

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
  
  const statusLabels = {
    inprogress: 'En cours',
    completed: 'Terminé'
  };

  // Sécuriser collaborators (les projets venant de la BDD n'ont pas forcément cette propriété)
  const collaboratorsList = contacts
    .filter(contact => Array.isArray(project.collaborators) && project.collaborators.includes(contact.id))
    .map(c => c.name)
    .join(', ');

  // Utiliser date_limite (BDD) ou l'ancien deadline si présent
  const rawDeadline = project.date_limite || project.deadline;
  const formattedDeadline = rawDeadline
    ? new Date(rawDeadline).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Aucune date';
  
  card.innerHTML = `
    <div class="project-header">
      <h3 class="project-title">${project.name}</h3>
      <span class="project-status status-${project.status}">${statusLabels[project.status] || project.status}</span>
    </div>
    <p class="project-description">${project.description}</p>
    ${collaboratorsList ? `<div class="project-collaborators"><strong>Collaborateurs:</strong> ${collaboratorsList}</div>` : ''}
    <div class="project-deadline">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      Date limite: ${formattedDeadline}
    </div>
    <div class="project-actions" style="display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border);">
      <button class="btn btn--sm btn--primary" data-edit-project="${project.id}" style="flex: 1;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Modifier
      </button>
      <button class="btn btn--sm btn--outline" data-open-project="${project.id}" style="flex: 1;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v6"></path>
          <path d="M12 22v-6"></path>
          <path d="M4 12h16"></path>
        </svg>
        Ouvrir
      </button>
      <button class="btn btn--sm btn--secondary" data-delete-project="${project.id}" style="flex: 1;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Supprimer
      </button>
    </div>
  `;

  // Ajouter les event listeners pour les boutons
  const editBtn = card.querySelector(`[data-edit-project="${project.id}"]`);
  const openBtn = card.querySelector(`[data-open-project="${project.id}"]`);
  const deleteBtn = card.querySelector(`[data-delete-project="${project.id}"]`);

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      editProject(project.id);
    });
  }

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openProject(project.id);
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      deleteProject(project.id);
    });
  }
  
  return card;
}


function editProject(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  editingProjectId = projectId;
  selectedCollaborators = [];

  // Remplir le formulaire avec les données du projet
  document.getElementById('projectName').value = project.name;
  document.getElementById('projectDescription').value = project.description;
  document.getElementById('projectStatus').value = project.status;
  document.getElementById('projectDeadline').value = project.date_limite || project.deadline;

  // Charger les collaborateurs existants
  if (project.collaborators && Array.isArray(project.collaborators)) {
    selectedCollaborators = [...project.collaborators];
  }

  // Changer le titre de la modale et le texte du bouton
  document.querySelector('#addProjectModal .modal-header h2').textContent = 'Modifier le projet';
  document.querySelector('#addProjectForm button[type="submit"]').textContent = 'Mettre à jour';

  // Afficher les collaborateurs
  renderCollaboratorsList();

  // Ouvrir la modale
  document.getElementById('addProjectModal').classList.remove('hidden');
}


async function deleteProject(id) {
  if (!confirm('Supprimer ce projet ?')) return;

  try {
    const res = await fetch('../delete_project.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();

    if (data.status === 'success') {
      projects = projects.filter(p => p.id !== id);
      renderProjects();
    } else {
      alert(data.message || 'Erreur lors de la suppression');
    }
  } catch (e) {
    console.error('Erreur deleteProject:', e);
    alert('Erreur de connexion au serveur');
  }
}


function openProject(projectId) {
  // Optionnel : garder aussi en localStorage
  try {
    localStorage.setItem('currentProjectId', projectId);
  } catch (e) {
    // ignore
  }

  // Passer l'id dans l'URL pour que projets.php le récupère
  window.location.href = '../projets.php?project_id=' + encodeURIComponent(projectId);
}


function resetProjectForm() {
  document.getElementById('addProjectForm').reset();
  document.querySelector('#addProjectModal .modal-header h2').textContent = 'Nouveau projet';
  document.querySelector('#addProjectForm button[type="submit"]').textContent = 'Créer';
  selectedCollaborators = [];
  const collaboratorsContainer = document.getElementById('collaboratorsListContainer');
  if (collaboratorsContainer) {
    collaboratorsContainer.remove();
  }
}

async function addOrUpdateProject() {
  const nameInput     = document.getElementById('projectName');
  const descInput     = document.getElementById('projectDescription');
  const statusInput   = document.getElementById('projectStatus');
  const deadlineInput = document.getElementById('projectDeadline');
  const contactSelect = document.getElementById('projectContact');

  const name        = nameInput.value.trim();
  const description = descInput.value.trim();
  const status      = statusInput.value;
  const dateLimite  = deadlineInput.value || null;
  const contactId   = contactSelect ? (contactSelect.value || null) : null;

  if (!name || !description) {
    alert('Nom et description sont obligatoires');
    return;
  }

  const projectData = {
    id: editingProjectId,
    name: name,
    description: description,
    status: status,
    date_limite: dateLimite,
    contact_id: contactId,
    collaborators: selectedCollaborators,  // ← AJOUTE CETTE LIGNE
    user_id: currentUserId
  };

  const url = editingProjectId ? '../update_project.php' : '../add_project.php';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    const data = await response.json();

    if (data.status === 'success') {
      await loadProjectsFromDB();
      document.getElementById('addProjectModal').classList.add('hidden');
      document.getElementById('addProjectForm').reset();
      editingProjectId = null;
    } else {
      alert(data.message || 'Erreur lors de l\'enregistrementdu projet');
    }
  } catch (error) {
    console.error('Erreur addOrUpdateProject:', error);
    alert('Erreur de connexion au serveur');
  }
}



async function loadProjectsFromDB() {
  try {
    const response = await fetch('../get_projects.php?user_id=' + currentUserId);
    const data = await response.json();
    projects = data;
    renderProjects();
  } catch (error) {
    console.error('Erreur chargement projets:', error);
  }
}





// ==========================================
// GESTION DES CONTACTS
// ==========================================

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

  // Utiliser contact.name (JS) ou full_name (DB)
  const displayName = contact.name || contact.full_name || '';

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  card.innerHTML = `
    <div class="contact-avatar">${initials}</div>
    <div class="contact-name">${displayName}</div>
    <div class="contact-role">${contact.role || 'Non spécifié'}</div>
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

async function addContact() {
  const nameInput  = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const phoneInput = document.getElementById('contactPhone');
  const roleInput  = document.getElementById('contactRole');

  const newContact = {  
    full_name: nameInput.value.trim(),
    email:     emailInput.value.trim(),
    phone:     phoneInput.value.trim(),
    role:      roleInput.value.trim(),
    user_id:   currentUserId          // <-- lier au user connecté
  };

  try {
    const res = await fetch('../add_contact.php', {   // même dossier que index.php
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact)
    });

    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const data = await res.json();

    if (data.status === 'success') {
      // Si ton PHP renvoie l'id créé, utilise-le, sinon garde la logique locale
      const newId = data.id
        ? data.id
        : (contacts.length ? contacts[contacts.length - 1].id + 1 : 1);

      contacts.push({
        id:    newId,
        name:  newContact.full_name,
        email: newContact.email,
        phone: newContact.phone,
        role:  newContact.role
      });

      renderContacts();
      document.getElementById('addContactModal').classList.add('hidden');
      document.getElementById('addContactForm').reset();
    } else {
      alert(data.message || 'Erreur lors de la création du contact');
    }
  } catch (err) {
    console.error('Erreur addContact:', err);
    alert('Erreur de connexion au serveur');
  }
}
