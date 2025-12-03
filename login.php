<?php
header('Content-Type: application/json');

// Autoriser uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Méthode non autorisée"]);
    exit;
}

require 'config.php'; // doit définir $bdd (PDO)

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email ou mot de passe manquant"]);
    exit;
}

try {
    $stmt = $bdd->prepare("SELECT id, fullname, email, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        echo json_encode([
            "status" => "success",
            "fullname" => $user["fullname"],
            "user_id" => $user["id"]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Identifiants invalides"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erreur serveur"]);
}
