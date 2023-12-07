<?php
header('Content-Type: application/json');
require __DIR__.'/vendor/autoload.php';
use Orhanerday\OpenAi\OpenAi;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__, '.env.local');
$dotenv->load();

$input = file_get_contents('php://input');
$data = json_decode($input, true);
$summary = $data['summary'];

$open_ai_key = getenv('OPENAI_API_KEY');
if (!$open_ai_key) {
    echo json_encode(["error" => "APIキーが設定されていません"]);
    exit;
}

$open_ai = new OpenAi($open_ai_key);
$chat = $open_ai->chat([
    'model' => 'gpt-3.5-turbo',
    'messages' => [
        [
            "role" => "system",
            "content" => "You are a political science teacher and should respond as if you are explaining to a student."
        ],
        [
            "role" => "user",
            "content" => "これを要約してください: ".$summary
        ],
    ],
    'temperature' => 1.0,
    'max_tokens' => 3000,
    'frequency_penalty' => 0,
    'presence_penalty' => 0,
]);

$d = json_decode($chat);
echo $chat;
echo json_encode(["data" => $d->choices[0]->message->content]);