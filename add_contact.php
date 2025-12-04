<?php
header('Content-Type: application/json');
require 'config.php';

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

$fullName = trim($data['full_name'] ?? '');
$email    = trim($data['email']     ?? '');
$phone    = trim($data['phone']     ?? '');
$role     = trim($data['role']      ?? '');
$userId   = $data['user_id']        ?? null;

if ($fullName === '' || $email === '') {
    echo json_encode(['status' => 'error', 'message' => 'Nom et email requis']);
    exit;
}

try {
    $stmt = $bdd->prepare("
        INSERT INTO contacts (full_name, email, phone, role, user_id)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$fullName, $email, $phone, $role, $userId]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur serveur']);
}
