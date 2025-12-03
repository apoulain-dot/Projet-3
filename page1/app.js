// ==========================================
// GESTION D'ÉTAT (State Management)
// ==========================================
let currentUser = null;
let projects = [
  {
    id: 1,
    name: 'Gestionnaire de projet',
    description: 'Création d\'un site web pour gérer des projets, des tâches et des contacts.',
    status: 'inprogress',
    deadline: '2025-12-05',
    collaborators: [1, 2]
  }
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
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

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

togglePasswordBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

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

// SUBMIT INSCRIPTION - APPEL À signup.php
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fullnameValid = validateSignupField(fullnameInput);
  const emailValid = validateSignupField(emailInput);
  const passwordValid = validateSignupField(passwordInput);
  const confirmValid = validateSignupField(confirmPasswordInput);

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
    fetch('signup.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: fullnameInput.value,
        email: emailInput.value,
        password: passwordInput.value
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        signupForm.style.display = 'none';
        successMessage.classList.add('show');
        setTimeout(() => {
          loginForm.style.display = 'block';
          successMessage.classList.remove('show');
          signupForm.style.display = 'block';
          signupForm.reset();
          tabButtons.forEach(b => b.classList.remove('active'));
          tabButtons[1].classList.add('active');
          headerTitle.textContent = 'Connexion';
          headerDesc.textContent = 'Connectez-vous à votre compte';
        }, 2000);
      } else {
        alert(data.message || "Erreur lors de l'inscription");
      }
    })
    .catch(() => {
      alert("Erreur serveur, réessayez plus tard.");
    });
  }
});

// ==========================================
// AUTHENTIFICATION - CONNEXION
// ==========================================
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const toggleLoginPasswordBtn = document.getElementById('toggleLoginPassword');
const rememberMeInput = document.getElementById('rememberMe');

toggleLoginPasswordBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const type = loginPasswordInput.type === 'password' ? 'text' : 'password';
  loginPasswordInput.type = type;
  toggleLoginPasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

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

// SUBMIT CONNEXION - APPEL À login.php
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailValid = validateLoginField(loginEmailInput);
  const passwordValid = validateLoginField(loginPasswordInput);

  if (emailValid && passwordValid) {
    fetch('login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginEmailInput.value,
        password: loginPasswordInput.value
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        currentUser = data.fullname;
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
        alert(data.message || "Identifiants incorrects.");
      }
    })
    .catch(() => {
      alert("Erreur serveur, réessayez plus tard.");
    });
  }
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
  renderProjects();
  renderContacts();
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
// GESTION DE L'APPLICATION - NAVIGATION (reste inchangé)
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
  document.getElementById('addProjectBtn')?.addEventListener('click', () => {
    editingProjectId = null;
    selectedCollaborators = [];
    resetProjectForm();
    renderCollaboratorsList();
    document.getElementById('addProjectModal')?.classList.remove('hidden');
  });

  document.getElementById('addProjectForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    addOrUpdateProject();
  });

  // Ajout de contact
  document.getElementById('addContactBtn')?.addEventListener('click', () => {
    document.getElementById('addContactModal')?.classList.remove('hidden');
  });

  document.getElementById('addContactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    addContact();
  });

  // Boutons de fermeture des modales
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      document.getElementById(modalId)?.classList.add('hidden');
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

// Fonctions restantes (projets, contacts) - inchangées
function renderProjects() {
  const projectsList = document.getElementById('projectsList');
  if (!projectsList) return;
  projectsList.innerHTML = projects.length ? '' : 'Aucun projet pour le moment. Créez votre premier projet !';
  projects.forEach(project => {
    const card = createProjectCard(project);
    projectsList.appendChild(card);
  });
}

function renderContacts() {
  const contactsList = document.getElementById('contactsList');
  if (!contactsList) return;
  contactsList.innerHTML = contacts.length ? '' : 'Aucun contact pour le moment. Ajoutez votre premier contact !';
  contacts.forEach(contact => {
    const card = createContactCard(contact);
    contactsList.appendChild(card);
  });
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  const statusLabels = { inprogress: 'En cours', completed: 'Terminé' };
  const collaboratorsList = contacts
    .filter(contact => project.collaborators?.includes(contact.id))
    .map(c => c.name)
    .join(', ');
  const formattedDeadline = new Date(project.deadline).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  card.innerHTML = `
    <h3>${project.name}</h3>
    <p>${project.description}</p>
    <div class="project-meta">
      <span class="status status-${project.status}">${statusLabels[project.status]}</span>
      <span class="deadline">📅 ${formattedDeadline}</span>
      ${collaboratorsList ? `<span class="collaborators">👥 ${collaboratorsList}</span>` : ''}
    </div>
  `;
  return card;
}

function createContactCard(contact) {
  const card = document.createElement('div');
  card.className = 'contact-card';
  const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase();
  card.innerHTML = `
    <div class="contact-avatar">${initials}</div>
    <div class="contact-info">
      <h4>${contact.name}</h4>
      <p>${contact.email}</p>
      <p>${contact.phone}</p>
      <span class="contact-role">${contact.role}</span>
    </div>
  `;
  return card;
}

// Fonctions utilitaires vides pour éviter les erreurs
function resetProjectForm() {}
function renderCollaboratorsList() {}
function addOrUpdateProject() {}
function addContact() {}
