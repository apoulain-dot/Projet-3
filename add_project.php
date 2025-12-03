<?php
header("Content-Type: application/json");
require "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $bdd->prepare("
    INSERT INTO projets (name, description, status, date_limite, contact_id)
    VALUES (?, ?, ?, ?, ?)
");

$stmt->execute([
    $data["name"],
    $data["description"],
    $data["status"],
    $data["date_limite"],
    $data["contact_id"]
]);

echo json_encode(["status" => "success"]);
?>
