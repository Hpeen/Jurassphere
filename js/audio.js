// Ambient sound: a looping rainforest bed with an occasional distant roar.
// Real recordings live in assets/audio/ (see CREDITS in README).
const AMBIENCE_URL = "assets/audio/jungle-ambience.mp3";
const ROAR_URL = "assets/audio/dino-roar.mp3";
const AMBIENCE_VOLUME = 0.34;

let ambient = null;
let roarTimer = null;
let started = false;
let muted = true;

export function playIntro() {
  const intro = document.getElementById("intro");
  if (!intro) return;
  // Fade the intro overlay out after a beat.
  setTimeout(() => intro.classList.add("hidden"), 1800);
}

function fadeTo(audio, target, ms = 900) {
  const steps = 24;
  const start = audio.volume;
  const step = (target - start) / steps;
  let i = 0;
  const id = setInterval(() => {
    i += 1;
    audio.volume = Math.min(1, Math.max(0, start + step * i));
    if (i >= steps) clearInterval(id);
  }, ms / steps);
}

function scheduleRoar() {
  // A distant call every 20–55 seconds keeps the jungle feeling alive
  // without becoming a jump-scare.
  const delay = 20000 + Math.random() * 35000;
  roarTimer = setTimeout(() => {
    if (!muted) {
      const roar = new Audio(ROAR_URL);
      roar.volume = 0.45;
      roar.play().catch(() => {});
    }
    scheduleRoar();
  }, delay);
}

function startAmbience() {
  ambient = new Audio(AMBIENCE_URL);
  ambient.loop = true;
  ambient.volume = 0;
  ambient.play().catch(() => {});
  fadeTo(ambient, AMBIENCE_VOLUME);
  scheduleRoar();
  started = true;
}

export function initAudioToggle() {
  const btn = document.getElementById("mute");
  btn.addEventListener("click", () => {
    muted = !muted;
    if (!started && !muted) {
      startAmbience();
    } else if (ambient) {
      fadeTo(ambient, muted ? 0 : AMBIENCE_VOLUME, 500);
    }
    btn.setAttribute("aria-pressed", String(!muted));
    btn.textContent = muted ? "Sound · off" : "Sound · on";
  });
}
