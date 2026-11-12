// 몰입형 스크롤: 스크롤 진행률 하나(--p)에서 장면별 진행률(--k1~--k6)을 만들고, 마우스는 --mx/--my 로 쓴다.
// 읽기는 스크롤마다 한 번(rAF). 상자·구름·글자 쪼개기는 장식이라 JS가 만든다(제목·본문은 HTML에 있다).
// 동작 줄이기면 아무것도 움직이지 않고, CSS가 장면을 세로로 펼친다.
const clamp = (v) => Math.min(1, Math.max(0, v));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function cuboid(x, y, z, w, h, d, c1, c2) {
  const el = document.createElement("div");
  el.className = "s-cube";
  el.style.cssText = `--x:${x}px;--y:${y}px;--z:${z}px;--w:${w}px;--h:${h}px;--d:${d}px;--c1:${c1};--c2:${c2}`;
  for (const f of ["front", "back", "right", "left", "top", "bottom"]) {
    const s = document.createElement("i");
    s.className = `s-cube__f s-cube__f--${f}`;
    el.append(s);
  }
  return el;
}

const PAL = [
  ["oklch(0.7 0.2 38)", "oklch(0.58 0.22 30)"],
  ["oklch(0.62 0.22 288)", "oklch(0.5 0.22 295)"],
  ["oklch(0.86 0.14 90)", "oklch(0.74 0.15 75)"],
  ["oklch(0.8 0.1 235)", "oklch(0.62 0.14 250)"],
];

function build(root) {
  const cluster = root.querySelector(".js-cluster");
  const tunnel = root.querySelector(".js-tunnel");
  const clouds = root.querySelector(".s-clouds");
  const letters = root.querySelector(".js-letters");

  const unit = 78;
  let n = 0;
  for (let gx = -1; cluster && gx <= 1; gx++) {
    for (let gz = -1; gz <= 1; gz++) {
      const h = 1 + ((gx + gz + 4) % 3);
      for (let l = 0; l < h; l++) {
        const [a, b] = PAL[(n + l) % PAL.length];
        cluster.append(cuboid(gx * unit * 1.15, -l * unit * 0.78, gz * unit * 1.15, unit, unit * 0.74, unit, a, b));
      }
      n++;
    }
  }

  for (let i = 0; tunnel && i < 22; i++) {
    const side = i % 2 ? 1 : -1;
    const [a, b] = PAL[i % PAL.length];
    tunnel.append(cuboid(side * (150 + (i % 3) * 36), ((i * 53) % 120) - 60, -i * 260, 110, 80 + (i % 4) * 14, 150, a, b));
    if (i % 3 === 0) tunnel.append(cuboid(0, 150 - (i % 5) * 14, -i * 260 - 100, 90, 60, 120, a, b));
  }

  for (let i = 0; clouds && i < 7; i++) {
    const c = document.createElement("div");
    c.className = "s-clouds__layer";
    c.style.cssText = `--l:${i};--ox:${((i * 37) % 60) - 30}%;--oy:${((i * 23) % 40) - 20}%`;
    clouds.append(c);
  }

  if (!letters) return;
  const text = letters.textContent.trim();
  letters.textContent = "";
  letters.setAttribute("aria-label", text);
  let i = 0;
  text.split(" ").forEach((word, w, all) => {
    const wrap = document.createElement("span");
    wrap.className = "s-big__w";
    wrap.setAttribute("aria-hidden", "true");
    for (const ch of word) {
      const s = document.createElement("span");
      s.className = "s-big__ch";
      s.style.setProperty("--i", i++);
      s.textContent = ch;
      wrap.append(s);
    }
    letters.append(wrap);
    if (w < all.length - 1) {
      letters.append(" ");
      i++;
    }
  });
}


/* ── 링 · 비행 · 방 페이지용 장식 ── */
const el = (cls, css = "", text = "", tag = "div") => {
  const e = document.createElement(tag);
  e.className = cls;
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};
const GRAD = [
  ["oklch(0.7 0.2 38)", "oklch(0.55 0.23 20)"],
  ["oklch(0.62 0.22 288)", "oklch(0.45 0.2 270)"],
  ["oklch(0.86 0.14 90)", "oklch(0.72 0.16 60)"],
  ["oklch(0.8 0.1 235)", "oklch(0.55 0.15 255)"],
  ["oklch(0.72 0.17 160)", "oklch(0.5 0.14 190)"],
];
const KIND = ["BRAND", "WEB", "MOTION", "3D", "APP", "PRINT", "VIDEO", "SOUND", "TYPE", "GAME", "DATA", "SPACE"];

function card(i, cls = "") {
  const [a, b] = GRAD[i % GRAD.length];
  const c = el(`s-card ${cls}`, `--c1:${a};--c2:${b}`);
  c.append(el("s-card__no", "", String(i + 1).padStart(2, "0"), "span"), el("s-card__kind", "", KIND[i % KIND.length], "span"));
  return c;
}

function buildRing(root) {
  const ring = root.querySelector(".js-ring");
  if (ring) for (let i = 0; i < 12; i++) ring.append(Object.assign(card(i), { style: `--c1:${GRAD[i % 5][0]};--c2:${GRAD[i % 5][1]};--a:${i * 30}deg` }));

  const helix = root.querySelector(".js-helix");
  if (helix) for (let i = 0; i < 18; i++) helix.append(Object.assign(card(i, "s-card--sm"), { style: `--c1:${GRAD[i % 5][0]};--c2:${GRAD[i % 5][1]};--a:${i * 40}deg;--y:${(8.5 - i) * 40}px` }));

  const globe = root.querySelector(".js-globe");
  if (globe) {
    const N = 110;
    const pins = new Set([4, 19, 37, 52, 71, 90]);
    const names = ["SEOUL", "BUSAN", "JEJU", "TOKYO", "PARIS", "NYC"];
    let pin = 0;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const az = (i * 137.508) % 360;
      const el0 = (Math.asin(y) * 180) / Math.PI;
      const d = pins.has(i) ? el("s-dot s-dot--pin", `--az:${az}deg;--el:${el0}deg`, names[pin++], "span") : el("s-dot", `--az:${az}deg;--el:${el0}deg`);
      globe.append(d);
    }
    for (let r = 0; r < 3; r++) globe.append(el("s-orbit", `--r:${r}`));
  }

  const fan = root.querySelector(".js-fan");
  if (fan) for (let i = 0; i < 7; i++) fan.append(Object.assign(card(i, "s-card--fan"), { style: `--c1:${GRAD[i % 5][0]};--c2:${GRAD[i % 5][1]};--f:${i - 3}` }));
}

function buildFlight(root) {
  const corridor = root.querySelector(".js-corridor");
  if (corridor) {
    corridor.append(el("s-floor"));
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 1 : -1;
      const [a, b] = GRAD[i % 5];
      const f = el("s-frame", `--side:${side};--z:${-300 - i * 340};--c1:${a};--c2:${b}`);
      f.append(el("s-frame__no", "", `FRAME ${String(i + 1).padStart(2, "0")}`, "span"), el("s-frame__kind", "", KIND[i % KIND.length], "span"));
      corridor.append(f);
    }
  }
  const warp = root.querySelector(".js-warp");
  if (warp) {
    for (let i = 0; i < 110; i++) {
      // 겉보기 난수 대신 고정 수열: 새로 고쳐도 같은 별자리
      const a = (i * 137.508) % 360;
      const d = 0.25 + (((i * 61) % 100) / 100) * 0.9;
      warp.append(el("s-streak", `--a:${a.toFixed(1)}deg;--d:${d.toFixed(2)}`));
    }
  }
}

function init() {
  const root = document.querySelector('[data-module="scenes"]');
  if (!root) return;
  build(root);
  buildRing(root);
  buildFlight(root);
  if (reduce) return;

  const scenes = [...root.querySelectorAll(".s-scene")];
  const rows = [...root.querySelectorAll(".js-row")];
  const noEl = document.querySelector(".js-no");
  const nameEl = document.querySelector(".js-name");
  const fill = document.querySelector(".l-bar__fill");
  const N = Number(root.dataset.steps) || scenes.length;
  const names = (root.dataset.names || "").split(",");
  let frame = 0;
  let cur = -1;

  const update = () => {
    frame = 0;
    const span = root.offsetHeight - innerHeight;
    const p = clamp(-root.getBoundingClientRect().top / span);
    root.style.setProperty("--p", p.toFixed(4));
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
    // 방 페이지용: 벽마다 잠시 머물렀다 넘어가도록 계단 모양으로 다듬은 진행(0~N-1)
    const x = p * (N - 1);
    const fr = x - Math.floor(x);
    root.style.setProperty("--w", (Math.floor(x) + fr * fr * fr * (fr * (fr * 6 - 15) + 10)).toFixed(4));
    for (let i = 0; i < N; i++) root.style.setProperty(`--k${i + 1}`, clamp(p * N - i).toFixed(4));
    rows.forEach((r) => r.style.setProperty("--shift", `${(p * N - 3) * Number(r.dataset.dir) * 22}%`));
    const idx = Math.min(N - 1, Math.floor(p * N));
    if (idx !== cur) {
      cur = idx;
      noEl.textContent = String(idx + 1).padStart(2, "0");
      nameEl.textContent = scenes[idx]?.dataset.name ?? names[idx] ?? "";
      scenes.forEach((s, i) => s.classList.toggle("is-on", i === idx));
    }
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  addEventListener(
    "pointermove",
    (e) => {
      root.style.setProperty("--mx", ((e.clientX / innerWidth - 0.5) * 2).toFixed(3));
      root.style.setProperty("--my", ((e.clientY / innerHeight - 0.5) * 2).toFixed(3));
    },
    { passive: true },
  );
  update();
}

init();
