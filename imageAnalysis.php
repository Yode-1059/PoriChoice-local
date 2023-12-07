<?php
header('Content-Type: application/json');
require __DIR__ . '/vendor/autoload.php';
use Google\Cloud\Vision\V1\ImageAnnotatorClient;
use Orhanerday\OpenAi\OpenAi;

putenv('GOOGLE_APPLICATION_CREDENTIALS=' . __DIR__ . '/adminkey.json');

// クライアントから送信されたデータを受け取る
$input = json_decode(file_get_contents('php://input'), true);

$imageDataUrl = $input['imageDataUrl']; // ここでデータURLを取得

// データURLから画像データを抽出
list($type, $imageData) = explode(';', $imageDataUrl);
list(, $imageData) = explode(',', $imageData);
$imageData = base64_decode($imageData); // ここでBase64デコード

$imageAnnotator = new ImageAnnotatorClient();
$responseText = $imageAnnotator->textDetection($imageData);
$texts = $responseText->getTextAnnotations();
$words = explode("\n", $texts[0]->getDescription());
$res = [
    "texts" => $words
];
$textData = implode("", $words);

$pattern = '/[^\x{4e00}-\x{9faf}]/u';
$textData = preg_replace($pattern, "", $textData);

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
            "content" => "Do not output any spaces or line breaks. Identify and output the most likely full Japanese name present in the text. If multiple names are detected, choose the one that seems most prominent or relevant."
        ],
        [
            "role" => "user",
            "content" => "この文字列から最も人名らしいものを1つだけ選んで出力してください: " . $textData
        ],
    ],
    'temperature' => 1.0,
    'max_tokens' => 3000,
    'frequency_penalty' => 0,
    'presence_penalty' => 0,
]);

// $textData は VisionAI からの出力で、変更する可能性がある

$d = json_decode($chat);

// コンテンツを取得
// echo $textData;
// echo $chat;
echo json_encode(["data" => $d->choices[0]->message->content, "res" => $textData]);
?>