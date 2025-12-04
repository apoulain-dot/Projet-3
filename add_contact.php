<?php
header('Content-Type: application/json');
require_once 'config.php'; // définit $bdd

try {
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $bdd->prepare("
        INSERT INTO contacts (full_name, email, phone, role)
        VALUES (?, ?, ?, ?)
    ");

    $stmt->execute([
        $data["full_name"] ?? null,
        $data["email"] ?? null,
        $data["phone"] ?? null,
        $data["role"] ?? null
    ]);

    echo json_encode(["status" => "success"]);
    exit;
} catch (Throwable $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit;
}