// Ambient sound uses a short looping WebAudio drone (no asset files needed).
let audioCtx = null;
let ambientNode = null;
let muted = true;

export function playIntro() {
  const intro = document.getElementById("intro");
  if (!intro) return;
  // Fade the intro overlay out after a beat.
  setTimeout(() => intro.classList.add("hidden"), 1800);
}

function buildAmbient() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.04;
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 72; // low drone
  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 6;
  lfo.connect(lfoGain).connect(osc.frequency);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  lfo.start();
  ambientNode = gain;
}

export function initAudioToggle() {
  const btn = document.getElementById("mute");
  btn.addEventListener("click", () => {
    if (!audioCtx) buildAmbient();
    if (audioCtx.state === "suspended") audioCtx.resume();
    muted = !muted;
    ambientNode.gain.value = muted ? 0 : 0.04;
    btn.setAttribute("aria-pressed", String(!muted));
    btn.textContent = muted ? "Sound · off" : "Sound · on";
  });
}
