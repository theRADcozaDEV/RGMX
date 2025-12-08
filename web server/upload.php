<?php
// server/upload.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS if needed
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$response = ['success' => false, 'message' => '', 'received_ids' => []];

// 1. Database Connection (Update credentials)
$host = 'localhost';
$db   = 'rgmx_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    $response['message'] = 'Database Connection Failed: ' . $e->getMessage();
    echo json_encode($response);
    exit;
}

// 2. Get Input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['scores']) || !is_array($input['scores'])) {
    $response['message'] = 'Invalid Input';
    echo json_encode($response);
    exit;
}

// 3. Process Scores
$received_ids = [];

// Prepare statements
$stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM game_scores WHERE id = ?");
$stmtInsert = $pdo->prepare("INSERT INTO game_scores (id, location, name, dept, score, date_played) VALUES (?, ?, ?, ?, ?, ?)");

foreach ($input['scores'] as $score) {
    try {
        $id = $score['id'];
        
        // Deduplication Check
        $stmtCheck->execute([$id]);
        if ($stmtCheck->fetchColumn() > 0) {
            // Already exists, mark as received so client removes it
            $received_ids[] = $id;
            continue;
        }

        // Insert
        $stmtInsert->execute([
            $id,
            $score['location'] ?? 'UNKNOWN',
            $score['name'],
            $score['dept'],
            $score['score'],
            $score['date'] 
        ]);
        
        $received_ids[] = $id;

    } catch (Exception $e) {
        // Log error but continue processing others
        error_log("Insert Error: " . $e->getMessage());
    }
}

$response['success'] = true;
$response['received_ids'] = $received_ids;

echo json_encode($response);
?>
