<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

$fullname = $data['fullname'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$stmt = $bdd->prepare("INSERT INTO utilisateurs (fullname, email, password) VALUES (?, ?, ?)");
$stmt->execute([$fullname, $email, $password]);

echo json_encode(["status" => "success"]);
