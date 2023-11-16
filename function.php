<?php
function dbConect()
{
    $dsn = 'mysql:dbname=PoriChoice;host=localhost';
    $user = 'root';
    $pass = 'root';

    try {
        $dbh = new PDO($dsn, $user, $pass);
        echo '';
    } catch (PDOException $e) {
        exit();
    }

    return $dbh;
}

function sql($i)
{
    $dbh = dbConect();
    return $dbh->query($i);
}

require __DIR__ . '/vendor/autoload.php';
use Google\Cloud\Vision\V1\ImageAnnotatorClient;

// クライアントから送信されたデータを受け取る
$input = json_decode(file_get_contents('php://input'), true);
$imageDataUrl = $input['imageDataUrl'];

// データURLから画像データを抽出
list($type, $imageData) = explode(';', $imageDataUrl);
list(, $imageData) = explode(',', $imageData);
$imageData = base64_decode($imageData);

$imageAnnotator = new ImageAnnotatorClient();

// ラベル検出
$responseLabel = $imageAnnotator->labelDetection($imageData);
$labels = $responseLabel->getLabelAnnotations();

// 文字検出
$responseText = $imageAnnotator->textDetection($imageData);
$texts = $responseText->getTextAnnotations();

// 検出結果をクライアントに返す
$result = [
    'labels' => [],
    'name' => [],
    'description' => [],
    'texts' => [],
    'age' => [],
    'affiliation' => [],
    'link' => [],
];

$dbh = dbConect();
$sql = "SELECT * FROM `politician` WHERE `name` LIKE ?";
$stmt = $dbh->prepare($sql);

foreach ($labels as $label) {
    $result['labels'][] = $label->getDescription();
}

$str_leng = 0;
$words = explode("\n", $texts[0]->getDescription());
foreach ($words as $word) {
    $result['texts'][] = $word;
    $sql = "SELECT * FROM `politician` WHERE `name` LIKE ?";
    $stmt = $dbh->prepare($sql);
    $stmt->execute(["%" . $word . "%"]);
    if ($stmt) {
        if ($str_leng < strlen($word) && strlen($word) >= 2) {
            $t = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($t) {
                foreach ($t as $row) {
                    $result['name'][] = $row["name"];
                    $result['description'][] = $row["description"];
                    $result["affiliation"][] = $row["affiliation"];
                    $result["age"][] = $row["age"];
                    $result["link"][] = $row["link"];
                }
            }
        }
    }
    // if ($result["name"] == null) {
    //     $result['name'][] = "いないよ";
    //     $result['description'][] = "ないよ";
    // }
}

header('Content-Type: application/json');
echo json_encode($result);
?>