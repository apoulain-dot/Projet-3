<?php
header('Content-Type: application/json');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$title       = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$listId      = (int)($data['list_id'] ?? 0);
$status      = $data['status'] ?? 'todo';
$dueDate     = $data['due_date'] ?? null;
$assignedTo  = $data['assigned_to'] ?? null;
$contactId   = $data['contact_id'] ?? null;
$projectId   = (int)($data['project_id'] ?? 0);

if ($title === '' || $listId <= 0 || $projectId <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Champs manquants']);
    exit;
}

try {
    $stmt = $bdd->prepare("
        INSERT INTO cards (list_id, title, description, status, due_date, assigned_to, contact_id, project_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$listId, $title, $description, $status, $dueDate, $assignedTo, $contactId, $projectId]);

    echo json_encode(['status' => 'success', 'id' => $bdd->lastInsertId()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
