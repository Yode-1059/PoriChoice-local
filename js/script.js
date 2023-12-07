document.addEventListener("DOMContentLoaded", (event) => {
  // ここに今までのJavaScriptのコードを移動
  const video = document.getElementById("video");
  // const outputDiv = document.getElementById("output");
  const captureButton = document.getElementById("captureButton");
  const politician = document.querySelector(".politician");
  const modalBack = document.querySelector(".modal-back");
  const politician__explanation = document.querySelector(
    ".politician__explanation"
  );
  const politician__name = document.querySelector(".politician__name");
  const affiliation = document.querySelector(".affiliation");
  const politician__link = document.querySelector(".politician__link");
  const politicianClose = document.querySelector(".politician__close");
  const age = document.querySelector(".age");
  const shotBox = document.querySelector(".shot__image-box");
  let per = true;
  const changeSub = (obj) => {
    politician__name.textContent = obj.name;
    const wordsToHighlight = ["現状", "政治", "公約", "コロナ禍"];
    let description = obj.description;

    wordsToHighlight.forEach((word) => {
      const regex = new RegExp(word, "g");
      description = description.replace(
        regex,
        `<span class="word">${word}</span>`
      );
    });

    politician__explanation.innerHTML = description;
    age.textContent = obj.age;
    affiliation.textContent = obj.affiliation;
    politician__link.setAttribute("href", obj.link);
    const words = document.querySelectorAll(".word");
    words.forEach((word) => {
      word.addEventListener("touchstart", async () => {
        // word.addEventListener("mousedown", async () => {
        word.style.background = "#A3E517";
        const detailContent = document.createElement("div");
        detailContent.classList.add("detail");

        let detailText = word.textContent;

        const detailArrow = document.createElement("div");
        detailArrow.classList.add("detail__arrow");

        const detailWord = document.createElement("h2");
        detailWord.textContent = detailText;
        detailWord.classList.add("detail__word");
        if (detailText == "公約") {
          detailText = "マニフェスト";
        }
        const endpoint = "https://ja.wikipedia.org/w/api.php";
        const params = {
          action: "query",
          prop: "extracts",
          exintro: true,
          explaintext: true,
          titles: detailText,
          format: "json",
          origin: "*",
        };
        const url = endpoint + "?" + new URLSearchParams(params).toString();
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const detailExplanation = document.createElement("p");
            const pageId = Object.keys(data.query.pages)[0];
            const content = data.query.pages[pageId].extract;
            const line = content.split("\n");
            let check = 1;
            line.forEach((element) => {
              if (
                element.endsWith("。") &&
                !element.endsWith("ありうる。") &&
                check == 1
              ) {
                detailExplanation.textContent = element;
                check = 0;
              }
            });
            detailExplanation.classList.add("detail__explanation");
            if (
              word.offsetLeft <
              window.innerWidth / 2 - word.offsetWidth / 2
            ) {
              detailContent.style.left = "-50%";
              detailContent.style.right = "auto";
              detailArrow.style.left = "11%";
              detailArrow.style.right = "auto";
            } else {
              detailContent.style.left = "auto";
              detailContent.style.right = "-50%";
              detailArrow.style.left = "auto";
              detailArrow.style.right = "5.5%";
            }
            word.append(detailContent);
            detailContent.append(detailArrow);
            detailContent.append(detailWord);
            detailContent.append(detailExplanation);
          });
      });
      word.addEventListener("touchend", () => {
        word.style.background = "#ffffff";
        const detail = document.querySelector(".detail");
        detail.remove();
      });
    });
    modalBack.classList.add("active");
    modalBack.classList.remove("none");
  };

  const deleteSub = () => {
    politician__name.textContent = "";
    politician__explanation.textContent = "";
    age.textContent = "";
    affiliation.textContent = "";
    politician__link.setAttribute("href", "#");
  };

  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "environment",
      },
    })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error("Error accessing the camera", err);
    });

  // モーダル非表示処理
  const modalClose = () => {
    per = true;
    politician.classList.toggle("active");
    if (modalBack.classList.contains("active")) {
      modalBack.classList.add("none");
      modalBack.classList.remove("active");
    } else {
      modalBack.classList.add("active");
      modalBack.classList.remove("none");
    }
    const shotImage = document.querySelector(".shot__image");
    shotImage.remove();
  };
  politicianClose.addEventListener("click", () => {
    modalClose();
  });
  modalBack.addEventListener("click", () => {
    modalClose();
    // politician__link.classList.add("none");
  });

  // 吹き出し（スマホ版）

  // 文字読み込みをした時の処理
  captureButton.addEventListener("click", () => {
    // deleteSub();
    if (per == false) return;
    per = false;
    const canvas = document.createElement("canvas");
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    canvas.width = video.clientWidth;
    canvas.height = video.clientWidth / videoAspectRatio;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgDataUrl = canvas.toDataURL("image/png");
    const shotImage = document.createElement("img");
    shotImage.classList.add("shot__image");
    shotImage.setAttribute("src", imgDataUrl);
    shotBox.append(shotImage);
    //表示切替

    // サーバー処理
    fetch("imageAnalysis.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageDataUrl: imgDataUrl }),
    })
      .then((response) => response.json())
      .then((data) => fetchWikipediaData(data.data))
      .catch((error) => {
        alert("もう一度試してください");
        shotImage.remove();
        per = true;
        console.error(error);
        // console.log("Error:", error);
      });
  });

  function fetchWikipediaData(pageName) {
    const endpoint = "https://ja.wikipedia.org/w/api.php";
    const params = {
      action: "parse",
      page: pageName,
      format: "json",
      prop: "text", // ページの内容を取得
      section: 0, // 概要部分を取得
      origin: "*",
    };

    const url = endpoint + "?" + new URLSearchParams(params).toString();

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const content = data.parse.text["*"];
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");

        // 概要部分の取得
        const introParagraphs = doc.querySelectorAll("p");
        let introText = "";
        for (let i = 0; i < introParagraphs.length && i < 3; i++) {
          introText += introParagraphs[i].textContent + "\n";
        }

        // 情報ボックスの取得
        const infobox = doc.querySelector(".infobox");
        const tbody = infobox ? infobox.querySelector("tbody") : null;

        // 特定の情報を検索
        const birthDateRow = tbody
          ? Array.from(tbody.querySelectorAll("tr")).find((row) =>
              row.innerText.includes("生年月日")
            )
          : null;
        const affiliationRow = tbody
          ? Array.from(tbody.querySelectorAll("tr")).find((row) =>
              row.innerText.includes("所属政党")
            )
          : null;
        const siteRow = tbody
          ? Array.from(tbody.querySelectorAll("tr")).find((row) =>
              row.innerText.includes("公式サイト")
            )
          : null;
        //要約
        fetch("overviewSummary.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ summary: introText }),
        })
          .then((response) => response.json())
          .then((data) => {
            // ここでPHPからの応答を処理
            const info = {
              name: pageName,
              age: birthDateRow
                ? birthDateRow.querySelector("td").textContent
                : "情報が見つかりません",
              affiliation: affiliationRow
                ? affiliationRow.querySelector("td").textContent
                : "情報が見つかりません",
              site: siteRow
                ? siteRow
                    .querySelector("td")
                    .querySelector("a")
                    .getAttribute("href")
                : "#",
              description: data.data,
            };
            changeSub(info);
            politician__link.classList.remove("none");
            politician.classList.toggle("active");
          })
          .catch((error) => {
            alert("もう一度試してください");
            shotImage.remove();
            per = true;
          });
      })
      .catch((error) => {
        alert("もう一度試してください");
        shotImage.remove();
        per = true;
        // politician__name.textContent = "もう一度試してください";
      });
  }
});
