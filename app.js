// =======================
// PERSONALIZA AQUÍ 👇
// =======================
const NOMBRE_NOVIA = "Mi niña hermosa"; // <-- cambia esto
const TU_NOMBRE = "Walter";             // <-- cambia esto
const FECHA_INICIO = "2025-02-15T00:00:00"; // <-- 15 de febrero (año/mes/día)

// Mensajes para el efecto "typing"
const FRASES = [
  "Eres mi lugar seguro.",
  "Mi parte favorita del día eres tú.",
  "Te elijo hoy, mañana y siempre.",
  "Gracias por quedarte.",
  "Te amo más de lo que puedo escribir."
];

// =======================
// UTILIDADES
// =======================
const $ = (id) => document.getElementById(id);

$("toName").textContent = `Para: ${NOMBRE_NOVIA}`;

// Typing loop
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const current = FRASES[phraseIndex];
  const shown = deleting ? current.slice(0, charIndex--) : current.slice(0, charIndex++);
  $("typing").textContent = shown;

  let delay = deleting ? 35 : 55;

  if (!deleting && charIndex > current.length) {
    deleting = true;
    delay = 900;
  } else if (deleting && charIndex < 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % FRASES.length;
    charIndex = 0;
    delay = 250;
  }
  setTimeout(typeLoop, delay);
}
typeLoop();

// Timer
const startDate = new Date(FECHA_INICIO);

function pad(n) { return String(n).padStart(2, "0"); }

function updateTimer() {
  const now = new Date();
  let diff = Math.max(0, now - startDate);

  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  $("timer").textContent = `${days} días ${pad(hours)} horas ${pad(minutes)} minutos ${pad(seconds)} segundos`;
}
updateTimer();
setInterval(updateTimer, 1000);

// Music toggle
let musicOn = false;
$("btnMusic").addEventListener("click", async () => {
  const song = $("song");
  try{
    if (!musicOn) {
      await song.play();
      musicOn = true;
      $("btnMusic").textContent = "⏸️ Pausar";
    } else {
      song.pause();
      musicOn = false;
      $("btnMusic").textContent = "🎵 Música";
    }
  }catch(e){
    alert("Si estás en celular, a veces debes tocar otra vez para permitir audio 🙂");
  }
});

// Surprise: lluvia intensa de corazones 2s
let burstUntil = 0;
$("btnSurprise").addEventListener("click", () => {
  burstUntil = Date.now() + 2000;
});

// =======================
// CANVAS: árbol/corazón + hojitas cayendo
// =======================
const canvas = $("canvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

function rand(min, max){ return Math.random() * (max - min) + min; }

const leaves = [];
const LEAF_COUNT = 120;

function makeLeaf(extraFast=false){
  const speed = extraFast ? rand(2.5, 5.5) : rand(0.8, 2.2);
  return {
    x: rand(0, W),
    y: rand(-H, 0),
    r: rand(3, 7),
    vy: speed,
    vx: rand(-0.6, 0.6),
    rot: rand(0, Math.PI*2),
    vr: rand(-0.05, 0.05),
    hue: rand(330, 360), // rositas
    alpha: rand(0.55, 0.95)
  };
}
for(let i=0;i<LEAF_COUNT;i++) leaves.push(makeLeaf());

function drawBackground(){
  // brillo suave
  const g = ctx.createRadialGradient(W*0.5, H*0.35, 10, W*0.5, H*0.5, W*0.6);
  g.addColorStop(0, "rgba(255, 255, 255, 0.55)");
  g.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
}

function drawTrunk(){
  // tronco
  ctx.save();
  ctx.translate(W*0.56, H*0.78);
  ctx.fillStyle = "rgba(120, 70, 45, .95)";
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.bezierCurveTo(-35, -60, -25, -130, -8, -190);
  ctx.bezierCurveTo(0, -225, 25, -240, 38, -260);
  ctx.bezierCurveTo(25, -210, 35, -140, 25, -80);
  ctx.bezierCurveTo(18, -40, 15, -10, 18, 0);
  ctx.closePath();
  ctx.fill();

  // sombra
  ctx.fillStyle = "rgba(70, 35, 22, .22)";
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.bezierCurveTo(-4, -70, 10, -150, 20, -235);
  ctx.bezierCurveTo(28, -214, 30, -140, 26, -80);
  ctx.bezierCurveTo(20, -35, 18, -10, 20, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHeartCanopy(time){
  // copa en forma de corazón (muchos puntos)
  const cx = W*0.56;
  const cy = H*0.34;

  const pulse = 1 + Math.sin(time*0.002)*0.02;

  for(let i=0;i<900;i++){
    const t = Math.random() * Math.PI * 2;

    // cardioide/heart-ish param (ajustada)
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);

    const px = cx + x * 9.2 * pulse + rand(-10, 10);
    const py = cy - y * 8.8 * pulse + rand(-10, 10);

    const s = rand(2.2, 5.2);

    // color variado en rosas/rojos
    const r = Math.floor(rand(230, 255));
    const g = Math.floor(rand(60, 140));
    const b = Math.floor(rand(120, 180));
    ctx.fillStyle = `rgba(${r},${g},${b},${rand(0.25,0.85)})`;

    ctx.beginPath();
    ctx.arc(px, py, s, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawLeaf(leaf){
  ctx.save();
  ctx.translate(leaf.x, leaf.y);
  ctx.rotate(leaf.rot);

  // corazón simple
  const size = leaf.r;
  ctx.beginPath();
  ctx.moveTo(0, size*0.35);
  ctx.bezierCurveTo(-size, -size*0.55, -size*0.9, -size*1.3, 0, -size*0.75);
  ctx.bezierCurveTo(size*0.9, -size*1.3, size, -size*0.55, 0, size*0.35);
  ctx.closePath();

  ctx.fillStyle = `hsla(${leaf.hue}, 90%, 65%, ${leaf.alpha})`;
  ctx.fill();
  ctx.restore();
}

function drawTextOverlay(time){
  // texto “flotando” sutil en canvas
  const bob = Math.sin(time*0.003)*2.5;
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "rgba(60,10,25,.65)";
  ctx.font = "700 18px system-ui";
  ctx.fillText(`Con amor, ${TU_NOMBRE} ❤️`, 18, 40 + bob);
  ctx.restore();
}

function loop(time){
  ctx.clearRect(0,0,W,H);

  drawBackground();
  drawHeartCanopy(time);
  drawTrunk();
  drawTextOverlay(time);

  const burst = Date.now() < burstUntil;

  // update leaves
  for(let i=0;i<leaves.length;i++){
    const leaf = leaves[i];
    leaf.x += leaf.vx + Math.sin(time*0.002 + i)*0.2;
    leaf.y += leaf.vy * (burst ? 1.8 : 1);
    leaf.rot += leaf.vr;

    drawLeaf(leaf);

    if(leaf.y > H + 20){
      leaves[i] = makeLeaf(burst);
      leaves[i].y = rand(-60, -10);
    }
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
