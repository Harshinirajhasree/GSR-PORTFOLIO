/* GSR Digital Portfolio – script.js */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const resOf = a => 300 - 240 * a;               // illustrative model: 60–300 kΩ

/* ---------- Content ---------- */
const apps = [
  [["🌿", "Relaxation training", "Biofeedback helps people gain control of body processes to increase relaxation."],
   ["💆", "Pain relief", "Learning self-regulation through visual or audio feedback is used to help relieve pain."],
   ["🧘", "Stress management", "A falling reading and red LEDs show rising tension; a rising reading shows the person is calming."]],
  [["😰", "Arousal and emotion studies", "Skin resistance falls with tension or excitement, giving an objective index of emotional arousal."],
   ["🎓", "Self-regulation learning", "Subjects watch or hear their own response and learn to bring it back toward a reference value."],
   ["🕵️", "Polygraph testing", "Electrodermal activity is one of the physiological signals recorded in polygraph (lie detector) systems."]],
  [["📡", "Electrodermal activity research", "Basal (BSR) and phasic (GSR) components are studied to understand sweat gland and autonomic activity."],
   ["⌚", "Wearable sensing", "Because only two small surface electrodes are needed, GSR suits compact, wearable monitors."],
   ["🧪", "Multi-signal biofeedback", "GSR is combined with EMG, temperature and pulse, the other commonly used biofeedback variables."]]
];
const adv = ["Non-invasive: only surface electrodes on fingers or palm", "Simple instrumentation: constant current source, amplifiers, RC network and meters", "Real-time visual and audio feedback (kΩ display, LEDs, tone)", "Sensitive to sweat gland activity, hence to emotional arousal", "Separates slow baseline (BSR) from quick response (GSR)"];
const lim = ["Shows that arousal changed, not which emotion caused it", "Heat and noise also change sweating, so conditions must be controlled", "Movement, talking or posture change alters contact resistance", "Electrode site and pressure must be kept the same for comparable readings", "Skin resistance varies widely between people (1 kΩ to 500 kΩ range)"];
const facts = [
  ["⚡", "Resistance or conductance?", "Conductance is the reciprocal of resistance. Many researchers report skin conductance, which rises as resistance falls."],
  ["✋", "Why the palm?", "The palms and fingers have the highest concentration of sweat glands in the body."],
  ["⏱️", "Why 3 to 5 s?", "The RC time constant lets the slow baseline fade away while quick responses still pass through."],
  ["🎧", "You can hear it", "The BF017G turns skin resistance into an audio tone, so a person can hear their own tension change."],
  ["🔬", "Two signals in one", "BSR is the average level; GSR is the high and low points caused by a stimulus."],
  ["🕵️", "Part of the polygraph", "Electrodermal activity is one of the signals recorded in polygraph systems."]
];
const take = ["GSR is the skin's electrical resistance; it falls as sweat gland activity rises.", "A constant dc current makes voltage proportional to resistance (R = V / I).", "An RC network (3 to 5 s) separates the quick GSR from the slow BSR baseline.", "The BF017G shows the result as a kΩ reading, 11 green and 5 red LEDs, and an audio tone.", "Relaxation raises resistance; tension lowers it.", "GSR is simple and non-invasive but non-specific, so conditions must be controlled."];
const setupInfo = [
  ["Active electrode (index finger)", "A silver surface electrode, similar to an ECG electrode, that carries the dc current into the skin."],
  ["Neutral electrode (middle finger)", "Completes the circuit on the same hand. Same site and pressure each time keep contact resistance steady."],
  ["Input cable", "Connects the finger electrodes to the INPUT socket of the biofeedback unit."],
  ["BF017G unit", "Supplies the constant current, amplifies the voltage and shows resistance in kΩ with LEDs and audio feedback."]
];
const blockInfo = [
  ["Active and neutral electrodes", "Silver electrodes on the palm and wrist or fingers that carry the dc current through the skin."],
  ["dc current source", "Passes a small constant current through the skin, so the voltage across it is proportional to skin resistance."],
  ["Amplifier A1", "Amplifies the skin voltage; its output drives the BSR meter (baseline resistance)."],
  ["BSR meter", "Shows the basal skin resistance, the slow baseline reflecting average sweat gland activity."],
  ["C and R network", "Time constant of 3 to 5 s; blocks the slow baseline and passes only the quick change."],
  ["Amplifier A2", "Amplifies the changing component that passes through the C and R network."],
  ["GSR meter", "Shows the galvanic skin response, the change in skin resistance caused by the sweat glands."]
];

/* ---------- Page chrome ---------- */
const secs = $$("main section");
$("#dots").innerHTML = secs.map(s => `<a href="#${s.id}" title="${$("h2", s).textContent}"></a>`).join("");
const navLinks = $$("#menu a"), dotLinks = $$("#dots a");
$("#burger").onclick = () => $("#menu").classList.toggle("open");
navLinks.forEach(a => a.onclick = () => $("#menu").classList.remove("open"));
secs.forEach(sec => new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  navLinks.forEach(l => l.classList.toggle("on", l.hash === "#" + sec.id));
  dotLinks.forEach(l => l.classList.toggle("on", l.hash === "#" + sec.id));
}), { rootMargin: "-45% 0px -50% 0px" }).observe(sec));
addEventListener("scroll", () => {
  const h = document.documentElement;
  $("#prog").style.width = (scrollY / (h.scrollHeight - innerHeight) * 100) + "%";
  $("#toTop").classList.toggle("show", scrollY > 700);
});
$("#toTop").onclick = () => scrollTo({ top: 0, behavior: "smooth" });

const rv = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  $$("[data-count]", e.target).forEach(c => {
    const end = +c.dataset.count; let n = 0; delete c.dataset.count;
    const id = setInterval(() => { n += Math.max(1, end / 40); c.textContent = Math.round(Math.min(n, end)); if (n >= end) clearInterval(id); }, 30);
  });
}), { threshold: .1 });
[...secs, ...$$(".card, .stat")].forEach(el => { el.classList.add("rv"); rv.observe(el); });

/* ---------- Signal model ---------- */
const bump = x => x > 0 ? Math.exp(-x / 2) - Math.exp(-x / .4) : 0;
function arousal(t, mode) {
  if (mode === 0) return .08 + .02 * Math.sin(t * .6);
  let s = 0; for (let k = 0; k < 40; k++) s += bump(t - k * 2.7 - (k % 3) * .5) * (.5 + (k % 4) * .12);
  return clamp(.5 + .08 * Math.sin(t * .4) + s * .5, 0, 1);
}
function plot(cv, fn, color, t, win = 10, fill = false, ymin = 40, ymax = 320) {
  const c = cv.getContext("2d"), W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H); c.strokeStyle = "rgba(100,150,180,.18)"; c.lineWidth = 1;
  for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(0, H * i / 5); c.lineTo(W, H * i / 5); c.stroke(); }
  c.beginPath();
  for (let x = 0; x <= W; x += 3) {
    const v = fn(t - win + win * x / W), y = H - 8 - (H - 16) * (v - ymin) / (ymax - ymin);
    x ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.strokeStyle = color; c.lineWidth = 2.5; c.stroke();
  if (fill) { c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.globalAlpha = .12; c.fillStyle = color; c.fill(); c.globalAlpha = 1; }
}

/* ---------- Hero ---------- */
const hero = $("#heroCanvas");
function sizeHero() { hero.width = hero.clientWidth; hero.height = hero.clientHeight; }
sizeHero(); addEventListener("resize", sizeHero);
/* ---------- Section 2 ---------- */
$("#ohmSlider").oninput = e => {
  const r = +e.target.value; $("#ohmRv").textContent = r; $("#ohmR").textContent = r + " kΩ";
  $("#ohmV").textContent = (10e-6 * r * 1e3).toFixed(2);
};
$("#ohmSlider").oninput({ target: $("#ohmSlider") });

/* ---------- Section 3 ---------- */
const chain = $$("#chain li");
function setArousal(v) {
  const a = v / 100, r = resOf(a);
  $("#arVal").textContent = v;
  $("#ductFill").setAttribute("y", 260 - 220 * a); $("#ductFill").setAttribute("height", 20 + 220 * a);
  $("#gSweat").style.width = v + "%"; $("#gCond").style.width = (6000 / r) + "%";
  $("#gRes").style.width = (r / 300 * 100) + "%";
  $("#resTxt").innerHTML = `Skin resistance ≈ <b>${Math.round(r)} kΩ</b> (conductance ≈ ${(1000 / r).toFixed(1)} µS)`;
  chain.forEach((li, i) => li.classList.toggle("on", v >= i * 20 + (i ? 1 : 0) && !(i === 0 && v < 1)));
}
$("#arSlider").oninput = e => setArousal(+e.target.value); setArousal(10);

/* ---------- Section 4 & 5: info panels ---------- */
function infoPanel(sel, box, data) {
  $$(sel).forEach(g => g.onclick = () => {
    $$(sel).forEach(x => x.classList.remove("sel")); g.classList.add("sel");
    const d = data[+g.dataset.i]; box.innerHTML = `<h3>${d[0]}</h3><p>${d[1]}</p>`;
  });
}
infoPanel(".hot", $("#setupInfo"), setupInfo);
infoPanel(".blk", $("#blkInfo"), blockInfo);

/* ---------- Section 6: RC high-pass ---------- */
const rc = { x: [], y: [], t: 0, px: 0, py: 0, tau: 4 };
const DT = .05;
$("#tauSlider").oninput = e => { rc.tau = +e.target.value; $("#tauV").textContent = rc.tau.toFixed(1); };
function rcInput(t) { return 170 + 55 * Math.sin(t / 9) - 120 * (arousal(t, 1) - .5) * 1.2; }
setInterval(() => {
  rc.t += DT; const x = rcInput(rc.t), a = rc.tau / (rc.tau + DT);
  const y = rc.x.length ? a * (rc.y[rc.y.length - 1] + x - rc.x[rc.x.length - 1]) : 0;
  rc.x.push(x); rc.y.push(y); if (rc.x.length > 400) { rc.x.shift(); rc.y.shift(); }
  drawRC();
}, DT * 1000);
function drawRC() {
  const cv = $("#rcCanvas"), c = cv.getContext("2d"), W = cv.width, H = cv.height, n = rc.x.length;
  c.clearRect(0, 0, W, H); c.font = "12px sans-serif"; c.fillStyle = "#5a7388";
  c.fillText("Input (kΩ)", 6, 14); c.fillText("Output: change only", 6, H / 2 + 14);
  c.strokeStyle = "rgba(100,150,180,.3)"; c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
  const line = (arr, y0, h, mid, span, col) => {
    c.beginPath(); arr.forEach((v, i) => { const X = W * i / 399, Y = y0 + h / 2 - (v - mid) / span * h; i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
    c.strokeStyle = col; c.lineWidth = 2.4; c.stroke();
  };
  if (n > 1) { line(rc.x, 20, H / 2 - 30, 170, 260, "#1565c0"); line(rc.y, H / 2 + 20, H / 2 - 30, 0, 90, "#00a6a6"); }
}

/* ---------- Section 7: BF017G ---------- */
const ledBox = $("#leds");
for (let i = 0; i < 16; i++) { const d = document.createElement("div"); d.className = "led " + (i < 11 ? "g" : "r"); ledBox.appendChild(d); }
$("#toneBars").innerHTML = "<i></i>".repeat(12);
const U = { mode: "relax", sw: "actual", R: 260, ema: 260, audio: false, ctx: null, osc: null, gain: null };
$$("#modeSeg button").forEach(b => b.onclick = () => { U.mode = b.dataset.m; $$("#modeSeg button").forEach(x => x.classList.toggle("on", x === b)); });
$$("#swSeg button").forEach(b => b.onclick = () => { U.sw = b.dataset.s; $$("#swSeg button").forEach(x => x.classList.toggle("on", x === b)); });
$("#sens").oninput = e => $("#sensV").textContent = e.target.value;
$("#audioBtn").onclick = () => {
  U.audio = !U.audio; $("#audioBtn").textContent = U.audio ? "🔊 Volume: On" : "🔇 Volume: Off";
  if (U.audio) {
    U.ctx = U.ctx || new (window.AudioContext || window.webkitAudioContext)();
    U.osc = U.ctx.createOscillator(); U.gain = U.ctx.createGain(); U.gain.gain.value = .04;
    U.osc.connect(U.gain).connect(U.ctx.destination); U.osc.start();
  } else if (U.osc) { U.osc.stop(); U.osc = null; }
};
setInterval(() => {
  const target = U.mode === "relax" ? 260 : 70 + Math.sin(Date.now() / 700) * 12;
  U.R = clamp(U.R + (target - U.R) * .06 + (Math.random() - .5) * 2, 1, 500);
  U.ema += (U.R - U.ema) * .01;
  const shown = U.sw === "basal" ? U.ema : U.R, s = +$("#sens").value / 5;
  const t = clamp((260 - shown) / 220 * s, 0, 1);
  $("#lcd").textContent = String(Math.round(shown)).padStart(4, "0");
  const g = Math.round((1 - t) * 11), r = t > .5 ? Math.ceil((t - .5) * 10) : 0;
  $$(".led", ledBox).forEach((l, i) => l.classList.toggle("lit", i < 11 ? i < g : i - 11 < r));
  $("#uState").textContent = t > .5 ? "TENSE" : "RELAX"; $("#uState").classList.toggle("t", t > .5);
  const f = 220 + t * 660; $("#toneTxt").textContent = U.audio ? Math.round(f) + " Hz" : "muted";
  $("#toneBars").classList.toggle("on", U.audio);
  if (U.osc) U.osc.frequency.setTargetAtTime(f, U.ctx.currentTime, .05);
}, 100);

/* ---------- Section 8: compare ---------- */
function setScrub(v) {
  const a = v / 100, r = Math.round(resOf(a));
  $("#sR").textContent = `Resistance ≈ ${r} kΩ`;
  $("#sS").textContent = `Sweat activity: ${v < 34 ? "low" : v < 67 ? "moderate" : "high"}`;
  $("#sL").textContent = v < 50 ? "LEDs: green bar" : "LEDs: red lit";
  $("#sT").textContent = `Tone: ${v < 34 ? "low" : v < 67 ? "mid" : "high"} pitch`;
  $("#sL").style.color = v < 50 ? "#1b9e55" : "#e53935";
}
$("#scrub").oninput = e => setScrub(+e.target.value); setScrub(0);

/* ---------- Tabs, lists, flips ---------- */
function showTab(i) {
  $("#tabBody").innerHTML = apps[i].map(a => `<article class="card in"><div class="ico">${a[0]}</div><h3>${a[1]}</h3><p>${a[2]}</p></article>`).join("");
  $$("#tabs button").forEach(b => b.classList.toggle("on", +b.dataset.t === i));
}
$$("#tabs button").forEach(b => b.onclick = () => showTab(+b.dataset.t)); showTab(0);
$("#advList").innerHTML = adv.map(t => `<li>${t}</li>`).join("");
$("#limList").innerHTML = lim.map(t => `<li>${t}</li>`).join("");
$("#takeList").innerHTML = take.map(t => `<li>${t}</li>`).join("");
$("#flips").innerHTML = facts.map(f => `<div class="flip" tabindex="0"><div><div class="f"><span>${f[0]}</span>${f[1]}</div><div class="b">${f[2]}</div></div></div>`).join("");
$$(".flip").forEach(f => { f.onclick = () => f.classList.toggle("on"); f.onkeydown = e => (e.key === "Enter" || e.key === " ") && f.classList.toggle("on"); });

/* ---------- Animation loop ---------- */
const t0 = performance.now();
(function loop(now) {
  const t = (now - t0) / 1000;
  // hero: alternates relax/stress every 10 s
  const hc = hero.getContext("2d"), W = hero.width, H = hero.height;
  hc.clearRect(0, 0, W, H);
  [[.0, .35, "rgba(255,255,255,.9)"], [.12, .15, "rgba(20,200,184,.8)"]].forEach(([off, amp, col], k) => {
    hc.beginPath();
    for (let x = 0; x <= W; x += 4) {
      const tt = t - (W - x) / W * 12 - off * 6, m = Math.floor(tt / 10) % 2 ? 1 : 0;
      const y = H * (.78 - .22 * (1 - (resOf(arousal(tt, m)) - 60) / 240 * 1) * (k ? .6 : 1) * 1) - k * 30;
      x ? hc.lineTo(x, y) : hc.moveTo(x, y);
    }
    hc.strokeStyle = col; hc.lineWidth = k ? 1.5 : 2.5; hc.stroke();
  });
  // decomposition
  const full = tt => resOf(arousal(tt, 1));
  const dc = $("#decompCanvas");
  plot(dc, full, "#00a6a6", t, 14, false, 40, 320);
  const c = dc.getContext("2d"); c.beginPath();
  for (let x = 0; x <= dc.width; x += 4) { const tt = t - 14 + 14 * x / dc.width, v = 175 + 15 * Math.sin(tt / 6), y = dc.height - 8 - (dc.height - 16) * (v - 40) / 280; x ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.strokeStyle = "#1565c0"; c.lineWidth = 3; c.stroke();
  // compare canvases
  plot($("#cvRelax"), tt => resOf(arousal(tt, 0)), "#00a6a6", t, 12, true);
  plot($("#cvStress"), tt => resOf(arousal(tt, 1)), "#e53935", t, 12, true);
  requestAnimationFrame(loop);
})(t0);
