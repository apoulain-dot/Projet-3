<?php
header('Content-Type: application/json');

// Autoriser uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Méthode non autorisée"]);
    exit;
}

require 'config.php'; // $bdd (PDO)

$data = json_decode(file_get_contents('php://input'), true);

// Le JS envoie { email: "...", password: "..." }
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    echo json_encode(["status" => "error", "message" => "Email ou mot de passe manquant"]);
    exit;
}

try {
    // La colonne du mot de passe dans ta BDD = mdp
    $stmt = $bdd->prepare("SELECT id, full_name, email, mdp FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Vérification du hash stocké dans mdp
    if ($user && password_verify($password, $user['mdp'])) {
        echo json_encode([
            "status"    => "success",
            "full_name" => $user["full_name"],
            "user_id"   => $user["id"]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Identifiants invalides"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erreur serveur"]);
}
