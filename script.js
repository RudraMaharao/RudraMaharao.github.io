// =========================================================
//  Rudra Maharao — portfolio scripts
// =========================================================

// ----- Hero visual: a field of dots shaped by z = sin(x + t) · cos(y − t) -----

const canvas = document.getElementById("surface");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const COLS = 96;   // dots across
const ROWS = 36;   // dots going into the distance
const pointer = { x: 0, y: 0, strength: 0, target: 0 };
let width = 0;
let height = 0;
let frame = null;

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw(ms) {
  const t = ms * 0.0006;          // time, slowed down
  const lens = height * 1.1;      // strength of the perspective
  const horizon = height * 0.16;  // where the surface fades into the distance
  pointer.strength += (pointer.target - pointer.strength) * 0.08;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ededed";

  // far rows first, so nearer dots are drawn on top
  for (let row = ROWS - 1; row >= 0; row--) {
    const depth = 1.6 + row * 0.24;          // distance from the camera
    const near = 1 - row / (ROWS - 1);       // 1 = closest row, 0 = farthest

    for (let col = 0; col < COLS; col++) {
      const x = (col - (COLS - 1) / 2) * 0.11;
      const sx = width / 2 + (x / depth) * lens;
      if (sx < -4 || sx > width + 4) continue;  // off the panel

      let z = Math.sin(x * 1.6 + t) * Math.cos(depth * 1.3 - t) * 0.22;

      // lift the dots near the cursor
      if (pointer.strength > 0.01) {
        const restY = horizon + lens / depth;
        const dist2 = (sx - pointer.x) ** 2 + (restY - pointer.y) ** 2;
        z += pointer.strength * 0.3 * Math.exp(-dist2 / 3500);
      }

      const sy = horizon + ((1 - z) / depth) * lens;
      ctx.globalAlpha = 0.06 + near * 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.5 + near * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function loop(ms) {
  draw(ms);
  frame = requestAnimationFrame(loop);
}

function start() {
  if (!frame && !reduceMotion) frame = requestAnimationFrame(loop);
}

function stop() {
  cancelAnimationFrame(frame);
  frame = null;
}

resize();

// redraw at the right size whenever the panel changes size
new ResizeObserver(() => {
  resize();
  draw(performance.now());
}).observe(canvas);

// only animate while the panel is on screen
new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(canvas);

canvas.addEventListener("pointermove", (event) => {
  const box = canvas.getBoundingClientRect();
  pointer.x = event.clientX - box.left;
  pointer.y = event.clientY - box.top;
  pointer.target = 1;
});

canvas.addEventListener("pointerleave", () => {
  pointer.target = 0;
});

// ----- Live Mumbai time and the year in the footer -----

const clock = document.getElementById("clock");

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
}

updateClock();
setInterval(updateClock, 30000);

document.getElementById("year").textContent = new Date().getFullYear();
