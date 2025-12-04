<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $pdo = isset($pdo) ? $pdo : $bdd;

    $stmt = $pdo->query("SELECT id, full_name, email, phone, role FROM contacts");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "contacts" => $rows
    ]);
} catch (Throwable $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}