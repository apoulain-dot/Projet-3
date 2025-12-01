<?php
// Connexion à la base de données
try {
    $bdd = new PDO('mysql:host=localhost;dbname=gtf;charset=utf8;', 'root', '');
    $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die('Erreur : ' . $e->getMessage());
}

// Requête
$requete = $bdd->query("SELECT * FROM users");
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion de Projets</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Page de connexion -->
    <div class="container">
        <div class="tabs">
            <button class="tab-btn active" data-tab="signup">Inscription</button>
            <button class="tab-btn" data-tab="login">Connexion</button>
        </div>

        <div class="header">
            <h1 id="headerTitle">Inscription</h1>
            <p id="headerDesc">Créez votre compte pour commencer</p>
        </div>

        <div class="success-message" id="successMessage">
            ✓ Inscription réussie ! Redirection en cours...
        </div>

        <div class="success-message" id="loginSuccessMessage">
            ✓ Connexion réussie ! Redirection en cours...
        </div>

        <form id="signupForm" novalidate class="form-content" data-form="signup">
            <div class="form-group">
                <label for="fullname">Nom complet <span class="required">*</span></label>
                <input 
                    type="text" 
                    id="fullname" 
                    name="fullname" 
                    class="form-control"
                    placeholder="Jean Dupont"
                    required
                >
                <div class="error-message" id="fullnameError"></div>
            </div>

            <div class="form-group">
                <label for="email">Adresse e-mail <span class="required">*</span></label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    class="form-control"
                    placeholder="votre.email@exemple.com"
                    required
                >
                <div class="error-message" id="emailError"></div>
            </div>

            <div class="form-group">
                <label for="password">Mot de passe <span class="required">*</span></label>
                <div class="password-wrapper">
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-control"
                        placeholder="Minimum 8 caractères"
                        required
                    >
                    <button type="button" class="toggle-password" id="togglePassword" aria-label="Afficher/Masquer le mot de passe">
                        👁️
                    </button>
                </div>
                <div class="password-strength">
                    <div class="strength-bar" id="strengthBar"></div>
                </div>
                <div class="error-message" id="passwordError"></div>
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirmez le mot de passe <span class="required">*</span></label>
                <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    class="form-control"
                    placeholder="Confirmez votre mot de passe"
                    required
                >
                <div class="error-message" id="confirmPasswordError"></div>
            </div>

            <div class="terms-group">
                <input 
                    type="checkbox" 
                    id="terms" 
                    name="terms" 
                    required
                >
                <label for="terms" class="terms-text">
                    J'accepte les <a href="#" onclick="event.preventDefault()">conditions d'utilisation</a> et la <a href="#" onclick="event.preventDefault()">politique de confidentialité</a>
                </label>
            </div>
            <div class="error-message" id="termsError"></div>

            <button type="submit" class="btn btn--primary btn--full-width">S'inscrire</button>
        </form>

        <form id="loginForm" novalidate class="form-content" data-form="login" style="display: none;">
            <div class="form-group">
                <label for="loginEmail">Adresse e-mail <span class="required">*</span></label>
                <input 
                    type="email" 
                    id="loginEmail" 
                    name="loginEmail" 
                    class="form-control"
                    placeholder="votre.email@exemple.com"
                    required
                >
                <div class="error-message" id="loginEmailError"></div>
            </div>

            <div class="form-group">
                <label for="loginPassword">Mot de passe <span class="required">*</span></label>
                <div class="password-wrapper">
                    <input 
                        type="password" 
                        id="loginPassword" 
                        name="loginPassword" 
                        class="form-control"
                        placeholder="Entrez votre mot de passe"
                        required
                    >
                    <button type="button" class="toggle-password" id="toggleLoginPassword" aria-label="Afficher/Masquer le mot de passe">
                        👁️
                    </button>
                </div>
                <div class="error-message" id="loginPasswordError"></div>
            </div>

            <div class="terms-group">
                <input 
                    type="checkbox" 
                    id="rememberMe" 
                    name="rememberMe"
                >
                <label for="rememberMe" class="terms-text">
                    Se souvenir de moi
                </label>
            </div>

            <button type="submit" class="btn btn--primary btn--full-width">Se connecter</button>
        </form>
    </div>
    
    <!-- Page principale -->
    <div id="mainApp" class="hidden">
        <!-- Header -->
        <header class="app-header">
            <div class="container">
                <div class="header-content">
                    <h1>Guardia Task Force</h1>
                    <div class="header-actions">
                        <span id="userWelcome" class="user-welcome"></span>
                        <button id="logoutBtn" class="btn btn--secondary btn--sm">Déconnexion</button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="app-nav">
            <div class="container">
                <button class="nav-btn active" data-view="projects">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                    Projets
                </button>
                <button class="nav-btn" data-view="contacts">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Contacts
                </button>
            </div>
        </nav>

        <!-- Contenu principal -->
        <main class="app-main">
            <div class="container">
                <!-- Visualisation des projets -->
                <div id="projectsView" class="view active">
                    <div class="view-header">
                        <h2>Projets en cours</h2>
                        <button id="addProjectBtn" class="btn btn--primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Nouveau projet
                        </button>
                    </div>
                    <div id="projectsList" class="projects-grid"></div>
                </div>

                <!-- Visualisation des contacts -->
                <div id="contactsView" class="view hidden">
                    <div class="view-header">
                        <h2>Mes contacts</h2>
                        <button id="addContactBtn" class="btn btn--primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Nouveau contact
                        </button>
                    </div>
                    <div id="contactsList" class="contacts-grid"></div>
                </div>
            </div>
        </main>
    </div>

    <!-- Module ajout de projets -->
    <div id="addProjectModal" class="modal hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Nouveau projet</h2>
                <button class="modal-close" data-modal="addProjectModal">&times;</button>
            </div>
            <form id="addProjectForm">
                <div class="form-group">
                    <label for="projectName">Nom du projet</label>
                    <input type="text" id="projectName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="projectDescription">Description</label>
                    <textarea id="projectDescription" class="form-control" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="projectCollaborators">Collaborateurs</label>
                    <input type="text" id="projectCollaborators" class="form-control">
                </div>
                <div class="form-group">
                    <label for="projectStatus">Statut</label>
                    <select id="projectStatus" class="form-control" required>
                        <option value="inprogress" selected>En cours</option>
                        <option value="completed">Terminé</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="projectDeadline">Date limite</label>
                    <input type="date" id="projectDeadline" class="form-control" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn--secondary" data-modal="addProjectModal">Annuler</button>
                    <button type="submit" class="btn btn--primary">Créer</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Module ajout de contact -->
    <div id="addContactModal" class="modal hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Nouveau contact</h2>
                <button class="modal-close" data-modal="addContactModal">&times;</button>
            </div>
            <form id="addContactForm">
                <div class="form-group">
                    <label for="contactName">Nom complet</label>
                    <input type="text" id="contactName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="contactEmail">Email</label>
                    <input type="email" id="contactEmail" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="contactPhone">Téléphone</label>
                    <input type="tel" id="contactPhone" class="form-control">
                </div>
                <div class="form-group">
                    <label for="contactRole">Rôle</label>
                    <input type="text" id="contactRole" class="form-control" placeholder="Ex: Chef de projet, Développeur...">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn--secondary" data-modal="addContactModal">Annuler</button>
                    <button type="submit" class="btn btn--primary">Ajouter</button>
                </div>
            </form>
        </div>
    </div>

    <script src="app.js" defer></script>
</body>
</html>
