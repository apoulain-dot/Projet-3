<?php
header('Content-Type: application/json');
require 'config.php';

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'ID invalide']);
    exit;
}

try {
    $stmt = $bdd->prepare("DELETE FROM projets WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur serveur']);
}
