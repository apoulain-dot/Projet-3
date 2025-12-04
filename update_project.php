<?php
header('Content-Type: application/json');
require 'config.php';

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

$id          = isset($data['id']) ? (int)$data['id'] : 0;
$name        = trim($data['name']        ?? '');
$description = trim($data['description'] ?? '');
$status      = $data['status']           ?? 'inprogress';
$dateLimite  = $data['date_limite']      ?? null;
$contactId   = $data['contact_id']       ?? null;

if ($id <= 0 || $name === '' || $description === '') {
    echo json_encode(['status' => 'error', 'message' => 'Données invalides']);
    exit;
}

try {
    $stmt = $bdd->prepare("
        UPDATE projets
        SET name = ?, description = ?, status = ?, date_limite = ?, contact_id = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $description, $status, $dateLimite, $contactId, $id]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur serveur']);
}
