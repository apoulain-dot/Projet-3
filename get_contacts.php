<?php
header('Content-Type: application/json');
require_once 'config.php';

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

try {
    // Utiliser $bdd défini dans config.php
    $pdo = isset($pdo) ? $pdo : $bdd;

    if ($userId > 0) {
        $stmt = $pdo->prepare("
            SELECT id, full_name, email, phone, role
            FROM contacts
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
    } else {
        // Si pas d'utilisateur, renvoyer une liste vide
        $stmt = $pdo->prepare("
            SELECT id, full_name, email, phone, role
            FROM contacts
            WHERE 1 = 0
        ");
        $stmt->execute();
    }

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status"   => "success",
        "contacts" => $rows
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Erreur serveur"
    ]);
}
