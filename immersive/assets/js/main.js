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
  for (let gx = -1; gx <= 1; gx++) {
    for (let gz = -1; gz <= 1; gz++) {
      const h = 1 + ((gx + gz + 4) % 3);
      for (let l = 0; l < h; l++) {
        const [a, b] = PAL[(n + l) % PAL.length];
        cluster.append(cuboid(gx * unit * 1.15, -l * unit * 0.78, gz * unit * 1.15, unit, unit * 0.74, unit, a, b));
      }
      n++;
    }
  }

  for (let i = 0; i < 22; i++) {
    const side = i % 2 ? 1 : -1;
    const [a, b] = PAL[i % PAL.length];
    tunnel.append(cuboid(side * (150 + (i % 3) * 36), ((i * 53) % 120) - 60, -i * 260, 110, 80 + (i % 4) * 14, 150, a, b));
    if (i % 3 === 0) tunnel.append(cuboid(0, 150 - (i % 5) * 14, -i * 260 - 100, 90, 60, 120, a, b));
  }

  for (let i = 0; i < 7; i++) {
    const c = document.createElement("div");
    c.className = "s-clouds__layer";
    c.style.cssText = `--l:${i};--ox:${((i * 37) % 60) - 30}%;--oy:${((i * 23) % 40) - 20}%`;
    clouds.append(c);
  }

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

function init() {
  const root = document.querySelector('[data-module="scenes"]');
  if (!root) return;
  build(root);
  if (reduce) return;

  const scenes = [...root.querySelectorAll(".s-scene")];
  const rows = [...root.querySelectorAll(".js-row")];
  const noEl = document.querySelector(".js-no");
  const nameEl = document.querySelector(".js-name");
  const fill = document.querySelector(".l-bar__fill");
  const N = scenes.length;
  let frame = 0;
  let cur = -1;

  const update = () => {
    frame = 0;
    const span = root.offsetHeight - innerHeight;
    const p = clamp(-root.getBoundingClientRect().top / span);
    root.style.setProperty("--p", p.toFixed(4));
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
    for (let i = 0; i < N; i++) root.style.setProperty(`--k${i + 1}`, clamp(p * N - i).toFixed(4));
    rows.forEach((r) => r.style.setProperty("--shift", `${(p * N - 3) * Number(r.dataset.dir) * 22}%`));
    const idx = Math.min(N - 1, Math.floor(p * N));
    if (idx !== cur) {
      cur = idx;
      noEl.textContent = String(idx + 1).padStart(2, "0");
      nameEl.textContent = scenes[idx].dataset.name;
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
