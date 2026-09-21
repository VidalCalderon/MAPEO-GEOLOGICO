<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$file = 'capas_admin.json';
if (file_exists($file)) {
    echo file_get_contents($file);
} else {
    echo "[]";
}
?>
