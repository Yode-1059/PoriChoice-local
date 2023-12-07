<?php

require __DIR__.'/vendor/autoload.php'; // remove this line if you use a PHP Framework.

use Orhanerday\OpenAi\OpenAi;

$open_ai_key = getenv('OPENAI_API_KEY');
$open_ai = new OpenAi("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");

// APIリクエスト
$chat = $open_ai->chat([
    'model' => 'gpt-3.5-turbo',
    'messages' => [
        [
            "role" => "system",
            "content" => "You are a helpful assistant."
        ],
        [
            "role" => "user",
            "content" => "このデータに含まれる人名データを割り出して: ".$jsonData
        ],
    ],
    'temperature' => 1.0,
    'max_tokens' => 4000,
    'frequency_penalty' => 0,
    'presence_penalty' => 0,
]);

var_dump($chat);
echo "<br>";
echo "<br>";
echo "<br>";
// レスポンスをデコード
$d = json_decode($chat);
// コンテンツを取得
echo ($d->choices[0]->message->content);

?>