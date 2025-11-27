<?php
$servername = "http://localhost/phpmyadmin";  // ou l'adresse de votre serveur MySQL
$username = "root";         // votre utilisateur MySQL
$password = "";             // votre mot de passe MySQL
$dbname = "gtf"; // nom de votre base

// Créer la connexion
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérifier la connexion
if ($conn->connect_error) {
    die("Connexion échouée : " . $conn->connect_error);
}
?>
