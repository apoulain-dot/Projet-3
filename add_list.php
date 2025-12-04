<?php
header('Content-Type: application/json');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$title    = trim($data['title'] ?? '');
$boardId  = (int)($data['board_id'] ?? 0);
$position = (int)($data['position'] ?? 0);

if ($title === '' || $boardId <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Champs manquants']);
    exit;
}

try {
    $stmt = $bdd->prepare("
        INSERT INTO lists (board_id, title, position)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$boardId, $title, $position]);

    echo json_encode(['status' => 'success', 'id' => $bdd->lastInsertId()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
