<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Manejo de preflight request de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verifica si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    
    // Validar que el JSON es vÃ¡lido antes de guardarlo
    $data = json_decode($inputJSON, true);
    if ($data !== null) {
        $file = 'capas_admin.json';
        
        // Escribe el archivo en la ruta raÃ­z
        if (file_put_contents($file, $inputJSON)) {
            echo json_encode(["status" => "success", "message" => "Capas guardadas exitosamente en $file"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "No se pudo escribir en el archivo. Verifica permisos."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El JSON enviado es invÃ¡lido."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "MÃ©todo no permitido. Se requiere POST."]);
}
?>
