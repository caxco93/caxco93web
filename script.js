const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Starfield in the sky above the horizon; drifts and gently reacts to the pointer
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
const pointer = { x: 0, y: 0 };
let stars = [];

function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const count = Math.floor((canvas.width * canvas.height) / 7000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    depth: Math.random() * 0.8 + 0.2,
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const star of stars) {
    star.y = (star.y + star.depth * 0.15) % canvas.height;
    const x = star.x + pointer.x * star.depth * 30;
    const y = star.y + pointer.y * star.depth * 30;
    // Fade out towards the horizon, where the sky glows
    const fade = 1 - star.y / canvas.height;
    ctx.fillStyle = `rgba(255, 255, 255, ${star.depth * fade})`;
    ctx.fillRect(x, y, star.depth * 2, star.depth * 2);
  }
}

// Mode 7 floor: every screen row below the horizon is an affine slice of an
// infinite textured plane. Row y maps to depth z = cameraHeight * focal / (y + 1),
// and each pixel on that row steps across the texture at a constant rate, which
// is what the SNES did per scanline. The texture is sampled with nearest-neighbour.
const floorCanvas = document.getElementById("floor");
const floorCtx = floorCanvas.getContext("2d");
const FLOOR_W = 320;
const FLOOR_H = 100;
const FOCAL = 120;
const CAMERA_HEIGHT = 1;
const SCROLL_SPEED = 1.5; // world units per second
const TEX_SIZE = 64; // texels per world unit
const LINE_TEXELS = 3;
const CELL = 2; // world units per grid square

floorCanvas.width = FLOOR_W;
floorCanvas.height = FLOOR_H;
const floorImage = floorCtx.createImageData(FLOOR_W, FLOOR_H);

const FLOOR_BASE = [18, 0, 43];
const LINE_COLOR = [255, 60, 190];
const HORIZON_GLOW = [255, 42, 109];

const mix = (a, b, t) => a + (b - a) * t;

function isLineTexel(u, v) {
  const tu = Math.floor((u / CELL) * TEX_SIZE) & (TEX_SIZE - 1);
  const tv = Math.floor((v / CELL) * TEX_SIZE) & (TEX_SIZE - 1);
  return tu < LINE_TEXELS || tv < LINE_TEXELS;
}

function drawFloor(time) {
  const data = floorImage.data;
  const scroll = (time / 1000) * SCROLL_SPEED;
  const sway = pointer.x * 3;
  for (let y = 0; y < FLOOR_H; y++) {
    const rowDistance = y + 1;
    const z = (CAMERA_HEIGHT * FOCAL) / rowDistance;
    const v = z + scroll;
    // Distant grid lines shrink below a pixel, so fade them out into the floor
    // and let a glow build up towards the horizon (row 0)
    const haze = 1 - rowDistance / FLOOR_H;
    const lineStrength = 1 - Math.pow(haze, 1.5);
    const glow = Math.pow(haze, 3) * 0.8;
    for (let x = 0; x < FLOOR_W; x++) {
      const u = ((x - FLOOR_W / 2) * z) / FOCAL + sway;
      const strength = isLineTexel(u, v) ? lineStrength : 0;
      const i = (y * FLOOR_W + x) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const color = mix(FLOOR_BASE[channel], LINE_COLOR[channel], strength);
        data[i + channel] = mix(color, HORIZON_GLOW[channel], glow);
      }
      data[i + 3] = 255;
    }
  }
  floorCtx.putImageData(floorImage, 0, 0);
}

function frame(time) {
  drawStars();
  drawFloor(time);
  if (!reducedMotion) {
    requestAnimationFrame(frame);
  }
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / window.innerWidth - 0.5;
  pointer.y = event.clientY / window.innerHeight - 0.5;
});

resize();
requestAnimationFrame(frame);
