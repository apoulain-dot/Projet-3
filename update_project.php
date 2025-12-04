<?php
session_start();
header('Content-Type: application/json');

// === LOGGING POUR DÉBOGUER ===
$logFile = __DIR__ . '/debug.log';
file_put_contents($logFile, "\n=== " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);

// Récupérer les données JSON
$input = file_get_contents('php://input');
file_put_contents($logFile, "INPUT BRUT: " . $input . "\n", FILE_APPEND);

$data = json_decode($input, true);
file_put_contents($logFile, "DATA DÉCODÉE: " . json_encode($data) . "\n", FILE_APPEND);

// Récupérer les paramètres
$id = isset($data['id']) ? (int)$data['id'] : 0;
$name = isset($data['name']) ? trim($data['name']) : '';
$description = isset($data['description']) ? trim($data['description']) : '';
$status = isset($data['status']) ? $data['status'] : 'inprogress';
$dateLimite = isset($data['date_limite']) ? $data['date_limite'] : null;
$contactId = isset($data['contact_id']) ? $data['contact_id'] : null;
$collaborators = isset($data['collaborators']) ? $data['collaborators'] : [];

file_put_contents($logFile, "PARAMÈTRES: id=$id, name=$name, desc=$description, status=$status\n", FILE_APPEND);
file_put_contents($logFile, "COLLABORATEURS: " . json_encode($collaborators) . "\n", FILE_APPEND);

// Validation minimum
if ($id <= 0 || $name === '' || $description === '') {
    file_put_contents($logFile, "ERREUR VALIDATION: id=$id, name=$name, desc=$description\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Données invalides']);
    exit;
}

try {
    // Inclure la connexion à la BD
    require_once 'config.php';
    file_put_contents($logFile, "CONNEXION: OK\n", FILE_APPEND);
    
    // 1) Mettre à jour le projet
    $stmt = $bdd->prepare("
        UPDATE projets
        SET name = ?, description = ?, status = ?, date_limite = ?, contact_id = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $name,
        $description,
        $status,
        $dateLimite,
        $contactId,
        $id
    ]);
    file_put_contents($logFile, "PROJECT UPDATE: OK\n", FILE_APPEND);
    
    // 2) Supprimer les anciens collaborateurs du projet
    $stmtDelete = $bdd->prepare("
        DELETE FROM project_collaborators
        WHERE project_id = ?
    ");
    $stmtDelete->execute([$id]);
    file_put_contents($logFile, "DELETE OLD COLLABORATORS: OK\n", FILE_APPEND);
    
    // 3) Insérer les nouveaux collaborateurs si fournis
    if (!empty($collaborators) && is_array($collaborators)) {
        file_put_contents($logFile, "INSERTING COLLABORATORS...\n", FILE_APPEND);
        $stmtCollab = $bdd->prepare("
            INSERT INTO project_collaborators (project_id, contact_id)
            VALUES (?, ?)
        ");
        
        foreach ($collaborators as $cId) {
            $cId = (int)$cId;
            if ($cId > 0) {
                $stmtCollab->execute([$id, $cId]);
                file_put_contents($logFile, "  - INSERTED: project_id=$id, contact_id=$cId\n", FILE_APPEND);
            }
        }
    } else {
        file_put_contents($logFile, "NO COLLABORATORS TO INSERT\n", FILE_APPEND);
    }
    
    file_put_contents($logFile, "SUCCESS\n", FILE_APPEND);
    echo json_encode(['status' => 'success']);
    
} catch (PDOException $e) {
    file_put_contents($logFile, "DATABASE ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur serveur: ' . $e->getMessage()]);
} catch (Exception $e) {
    file_put_contents($logFile, "GENERAL ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur: ' . $e->getMessage()]);
}
?>