<?php
session_start();
header('Content-Type: application/json');

require_once 'config.php';

// Récupérer l'user_id depuis la requête
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($userId <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'user_id manquant']);
    exit;
}

try {
    // 1) Récupérer tous les projets de l'utilisateur
    $stmt = $bdd->prepare("
        SELECT id, name, description, status, date_limite, contact_id, user_id
        FROM projets
        WHERE user_id = ?
        ORDER BY id DESC
    ");
    $stmt->execute([$userId]);
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 2) Pour chaque projet, récupérer les collaborateurs
    foreach ($projects as &$project) {
        $stmtCollab = $bdd->prepare("
            SELECT contact_id
            FROM project_collaborators
            WHERE project_id = ?
        ");
        $stmtCollab->execute([$project['id']]);
        $collaborators = $stmtCollab->fetchAll(PDO::FETCH_COLUMN);
        
        // Ajouter les IDs des collaborateurs au projet
        $project['collaborators'] = array_map('intval', $collaborators);
    }
    
    echo json_encode($projects);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>