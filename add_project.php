<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require 'config.php'; // $bdd (PDO)

// 1) Lire le JSON
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

$name        = trim($data['name']        ?? '');
$description = trim($data['description'] ?? '');
$status      = $data['status']           ?? 'inprogress';
$dateLimite  = $data['date_limite']      ?? null;
$contactId   = $data['contact_id']       ?? null;
$userId      = $data['user_id']          ?? null;  // <- prend bien le 2

// ...

$stmt = $bdd->prepare("
    INSERT INTO projets (name, description, status, date_limite, contact_id, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $name,
    $description,
    $status,
    $dateLimite,
    $contactId,
    $userId           // <- inséré en dernier
]);


// 3) Validation minimum
if ($name === '' || $description === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Nom et description obligatoires']);
    exit;
}

try {
    // 4) Requête SQL : choisis la version qui correspond à ta table

    // VERSION SANS user_id (si ta table = id, name, description, status, date_limite, contact_id)
    $stmt = $bdd->prepare("
        INSERT INTO projets (name, description, status, date_limite, contact_id)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $description, $status, $dateLimite, $contactId]);

    /*
    // VERSION AVEC user_id (si tu as ajouté la colonne user_id)
    $stmt = $bdd->prepare("
        INSERT INTO projets (name, description, status, date_limite, contact_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $description, $status, $dateLimite, $contactId, $userId]);
    */

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur serveur']);
}
