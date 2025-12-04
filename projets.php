<?php
try {
    $bdd = new PDO('mysql:host=localhost;dbname=gtf;charset=utf8', 'root', '');
    $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die('Erreur BDD : ' . $e->getMessage());
}

// TODO : à adapter : ici on suppose que l'id du projet arrive en GET
$projectId = isset($_GET['project_id']) ? (int)$_GET['project_id'] : 0;

// TODO : à adapter aussi : id de l'utilisateur connecté (session, etc.)
$userId = 1; // remplace par $_SESSION['user_id'] ou autre
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion de Projets</title>
    <link rel="stylesheet" href="page2/styleprojet.css">
</head>
<body>
    <header class="app-header">
        <div class="container">
            <div class="header-content">
                <button class="btnGTF" onclick="window.location.href='index.php'">Guardia Task Force</button>
                <div class="header-actions">
                    <span id="userWelcome" class="user-welcome"></span>
                </div>
            </div>
        </div>
    </header>
    <div class="container">
        <div class="header">
            <div>
                <h1>Gestion de Projets</h1>
                <p>Organisez vos tâches et collaborez en temps réel</p>
            </div>
        </div>

        <div class="main-container">
            <!-- Barre latérale des participants -->
            <div class="sidebar-participants">
                <h2>👥 Équipe</h2>
                <div class="participants-list" id="participantsList"></div>
            </div>

            <!-- Zone principale du tableau -->
            <div class="board-container">
                <!-- on passe l'id du projet au JS -->
                <div class="board"
                     id="board"
                     data-project-id="<?php echo htmlspecialchars($projectId, ENT_QUOTES, 'UTF-8'); ?>">
                </div>
            </div>
        </div>
    </div>

    <!-- Section Archives -->
    <div class="archive-section">
        <div class="archive-header">
            <h2>📦 Archive</h2>
            <button class="btn-toggle-archive" onclick="toggleArchive()">Afficher les archives</button>
        </div>
        <div class="archive-content" id="archiveContent">
            <div id="archiveList" class="archive-list">
                <div class="archive-empty">Aucune tâche archivée pour le moment</div>
            </div>
        </div>
    </div>

    <!-- Modal de création/modification de tâche -->
    <div class="modal-overlay hidden" id="taskModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Créer une nouvelle tâche</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="taskForm">
                    <div class="form-group">
                        <label for="taskInput">Titre de la tâche</label>
                        <input type="text" id="taskInput" placeholder="Entrez le titre..." required>
                    </div>

                    <div class="form-group">
                        <label for="taskDescription">Description</label>
                        <textarea id="taskDescription" placeholder="Décrivez la tâche..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="taskPriority">Degré d'urgence (1-10)</label>
                        <div class="priority-container">
                            <input type="range" id="taskPriority" min="1" max="10" value="3" class="priority-slider">
                            <div class="priority-indicator">
                                <span id="priorityValue">3</span> / 10
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Assignés</label>
                        <div class="members-list" id="membersList"></div>
                    </div>

                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="taskCompleted"> ✅ Marquer comme terminée
                        </label>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-cancel" onclick="closeModal()">Annuler</button>
                        <button type="button" id="deleteTaskBtn" class="btn-delete hidden" onclick="deleteCurrentTask()">Supprimer</button>
                        <button type="submit" id="submitBtn" class="btn-submit">Créer la tâche</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Exposer l'utilisateur courant au JS si besoin -->
    <script>
        window.currentUserId = <?php echo (int)$userId; ?>;
    </script>
    <script src="page2/appprojets.js"></script>
</body>
</html>
