document.addEventListener("DOMContentLoaded", (event) => {
  // ここに今までのJavaScriptのコードを移動
  const video = document.getElementById("video");
  // const outputDiv = document.getElementById("output");
  const captureButton = document.getElementById("captureButton");
  const politician__explanation = document.querySelector(
    ".politician__explanation"
  );
  const politician__name = document.querySelector(".politician__name");
  const affiliation = document.querySelector(".affiliation");
  const politician__link = document.querySelector(".politician__link");
  const age = document.querySelector(".age");
  const pic__back = document.querySelector(".pic__back");
  const shot = document.querySelector(".shot");
  const load = document.querySelector(".load");
  const move = document.querySelector(".move");

  move.addEventListener("click", () => {
    console.log("click");
    shot.classList.toggle("none");
    load.classList.toggle("none");
    politician__link.classList.add("none");
  });

  const changeSub = (obj) => {
    politician__name.textContent = obj.name[obj.name.length - 1];
    politician__explanation.textContent =
      obj.description[obj.description.length - 1];
    age.textContent = `${obj.age[obj.age.length - 1]}歳`;
    affiliation.textContent = obj.affiliation[obj.affiliation.length - 1];
    politician__link.setAttribute("href", obj.link[obj.link.length - 1]);
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

  captureButton.addEventListener("click", () => {
    deleteSub();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    shot.classList.toggle("none");
    load.classList.toggle("none");

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgDataUrl = canvas.toDataURL("image/png");
    const imgElement = document.createElement("img");
    imgElement.src = imgDataUrl;
    imgElement.width = 200;

    pic__back.setAttribute("src", imgDataUrl);

    fetch("sample.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageDataUrl: imgDataUrl }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        changeSub(data);
        alert("できた");
        politician__link.classList.remove("none");
      })
      .catch((error) => {
        politician__name.textContent = "もう一度試してください";
        console.log("Error:", error);
      });
  });
});
