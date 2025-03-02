import App from "./app";

// const loadingText = document.createElement("div");
// loadingText.id = "loading";
// loadingText.style.zIndex = "0";
// loadingText.innerText = "Loading";
// loadingText.style.fontSize = "20px";
// loadingText.style.fontWeight = "bold";
// loadingText.style.position = "absolute";
// loadingText.style.top = "50%";
// loadingText.style.left = "50%";
// loadingText.style.transform = "translate(-50%, -50%)";
// document.body.appendChild(loadingText);

// let dots = "";
// let loadingInterval = setInterval(() => {
//   dots = dots.length < 3 ? dots + "." : "";
//   loadingText.innerText = `Loading${dots}`;
// }, 500);

// start when button #startButton is clicked
document.querySelector("#startButton").addEventListener("click", () => {
  // hide button
  document.querySelector("#startButton").remove();

  // Create the canvas HTML element and attach it to the webpage
  const canvas = document.createElement("canvas");
  canvas.id = "gameCanvas";
  document.body.appendChild(canvas);

  new App("gameCanvas");
});

// export function hideLoading() {
//   const l = document.querySelector("#loading") as HTMLElement;
//   l.remove();
// }
