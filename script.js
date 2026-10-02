const phrases = [
  "Software Developer",
  "builds things for the web",
  "turns coffee into code",
  "says hello 👋🏽",
];

const typed = document.getElementById("typed");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function typeLoop() {
  if (reducedMotion) {
    typed.textContent = phrases[0];
    return;
  }
  for (let i = 0; ; i = (i + 1) % phrases.length) {
    const phrase = [...phrases[i]];
    for (let n = 1; n <= phrase.length; n++) {
      typed.textContent = phrase.slice(0, n).join("");
      await sleep(70);
    }
    await sleep(1800);
    for (let n = phrase.length; n >= 0; n--) {
      typed.textContent = phrase.slice(0, n).join("");
      await sleep(35);
    }
    await sleep(300);
  }
}

// Starfield that drifts and gently reacts to the pointer
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
const pointer = { x: 0, y: 0 };
let stars = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const count = Math.floor((canvas.width * canvas.height) / 9000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    depth: Math.random() * 0.8 + 0.2,
  }));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const star of stars) {
    star.y = (star.y + star.depth * 0.25) % canvas.height;
    const x = star.x + pointer.x * star.depth * 30;
    const y = star.y + pointer.y * star.depth * 30;
    ctx.fillStyle = `rgba(255, 255, 255, ${star.depth * 0.8})`;
    ctx.fillRect(x, y, star.depth * 2, star.depth * 2);
  }
  if (!reducedMotion) {
    requestAnimationFrame(draw);
  }
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / window.innerWidth - 0.5;
  pointer.y = event.clientY / window.innerHeight - 0.5;
});

resize();
typeLoop();
draw();
