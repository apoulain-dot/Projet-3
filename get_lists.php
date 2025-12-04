<?php
header('Content-Type: application/json');
require 'config.php';

$projectId = isset($_GET['project_id']) ? (int)$_GET['project_id'] : 0;

$stmt = $bdd->prepare("
    SELECT lists.id AS id,
           lists.title AS title,
           lists.position AS position
    FROM lists
    INNER JOIN boards ON lists.board_id = boards.id
    WHERE boards.project_id = ?
    ORDER BY lists.position ASC, lists.id ASC
");
$stmt->execute([$projectId]);

echo json_encode([
    'status' => 'success',
    'lists'  => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);

