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
        SELECT lists.id AS id,
               lists.title AS title,
               lists.position AS position
        FROM lists
        INNER JOIN boards ON lists.board_id = boards.id
        WHERE boards.project_id = ?
        ORDER BY lists.position ASC, lists.id ASC
    ");
    $stmt->execute([$projectId]);

    echo json_encode([
        'status' => 'success',
        'lists'  => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

