<?php
header('Content-Type: application/json');
require 'config.php';

$projectId = isset($_GET['project_id']) ? (int)$_GET['project_id'] : 0;

if ($projectId <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'project_id manquant']);
    exit;
}

try {
    $stmt = $bdd->prepare("
        SELECT id, list_id, title, description, status, due_date, assigned_to, contact_id, project_id
        FROM cards
        WHERE project_id = ?
        ORDER BY id ASC
    ");
    $stmt->execute([$projectId]);

    echo json_encode([
        'status' => 'success',
        'cards'  => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur serveur']);
}
