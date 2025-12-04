<?php
header('Content-Type: application/json');
require 'config.php'; // $bdd

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

try {
    if ($userId > 0) {
        $stmt = $bdd->prepare("SELECT * FROM projets WHERE user_id = ?");
        $stmt->execute([$userId]);
    } else {
        // Si pas d'utilisateur, renvoyer liste vide
        $stmt = $bdd->prepare("SELECT * FROM projets WHERE 1 = 0");
        $stmt->execute();
    }

    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($projects);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur serveur']);
}
