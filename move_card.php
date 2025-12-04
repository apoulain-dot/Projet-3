<?php
header('Content-Type: application/json');
require 'config.php';

$data  = json_decode(file_get_contents('php://input'), true);
$id     = (int)($data['id'] ?? 0);
$listId = (int)($data['list_id'] ?? 0);

if ($id <= 0 || $listId <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Données invalides']);
    exit;
}

try {
    $stmt = $bdd->prepare("UPDATE cards SET list_id = ? WHERE id = ?");
    $stmt->execute([$listId, $id]);
    echo json_encode(['status' => 'success']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
