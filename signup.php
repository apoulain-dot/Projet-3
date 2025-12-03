<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Méthode non autorisée"]);
    exit;
}

require 'config.php'; // doit définir $bdd (PDO)

$data = json_decode(file_get_contents('php://input'), true);

$fullname = trim($data['full_name'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';        

if (empty($fullname) || empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Champs manquants"]);
    exit;
}

// Vérification email basique
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Email invalide"]);
    exit;
}

try {
    // Vérifier si l'email existe déjà
    $check = $bdd->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        echo json_encode(["status" => "error", "message" => "Email déjà utilisé"]);
        exit;
    }

    // Hash du mot de passe
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT); // [web:41]

    // Insertion
$stmt = $bdd->prepare(
    "INSERT INTO users (full_name, email, mdp) VALUES (:full_name, :email, :mdp)"
);

$stmt->execute([
    ':full_name' => $fullname,
    ':email'     => $email,
    ':mdp'       => $hashedPassword
]);

    echo json_encode(["status" => "success", "message" => "Inscription réussie"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erreur serveur"]);
}
