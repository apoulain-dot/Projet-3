<?php
header("Content-Type: application/json");
require "config.php";

$stmt = $bdd->query("SELECT * FROM projets ORDER BY id DESC");

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
