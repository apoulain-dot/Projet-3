<?php
header("Content-Type: application/json");
require "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $bdd->prepare("
    INSERT INTO contacts (full_name, email, phone, role)
    VALUES (?, ?, ?, ?)
");

$stmt->execute([
    $data["full_name"],
    $data["email"],
    $data["phone"],
    $data["role"]
]);

echo json_encode(["status" => "success"]);
?>
