// 크루 메인의 몰입형 스크롤: 스크롤 진행률 하나에서 장면별 진행률(--cur)을 만들어 각 장면 안 요소가 차례로 나타나게 한다.
// 상자·구름은 장식이라 JS가 만든다(제목·본문·링크는 HTML에 있다). 읽기는 스크롤마다 한 번(rAF).
// 메뉴의 #services·#work·#process·#standards·#contact 링크는 해당 장면 위치로 부드럽게 이동. 동작 줄이기면 아무것도 하지 않는다(CSS가 장면을 세로로 펼침).
import { prefersReducedMotion } from "../utils/motion.js";

const clamp = (v) => Math.min(1, Math.max(0, v));
const PAL = [
  ["oklch(0.7 0.2 38)", "oklch(0.58 0.22 30)"],
  ["oklch(0.62 0.22 288)", "oklch(0.5 0.22 295)"],
  ["oklch(0.86 0.14 90)", "oklch(0.74 0.15 75)"],
  ["oklch(0.8 0.1 235)", "oklch(0.62 0.14 250)"],
];

function cuboid(x, y, z, w, h, d, c1, c2) {
  const el = document.createElement("div");
  el.className = "c-run-cube";
  el.style.cssText = `--x:${x}px;--y:${y}px;--z:${z}px;--w:${w}px;--h:${h}px;--d:${d}px;--c1:${c1};--c2:${c2}`;
  for (const f of ["front", "back", "right", "left", "top", "bottom"]) {
    const s = document.createElement("i");
    s.className = `c-run-cube__f c-run-cube__f--${f}`;
    el.append(s);
  }
  return el;
}

function decorate(root) {
  const cluster = root.querySelector(".js-cluster");
  const tunnel = root.querySelector(".js-tunnel");
  const clouds = root.querySelector(".c-run-clouds");
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
  for (let i = 0; i < 4; i++) {
    const c = document.createElement("div");
    c.className = "c-run-clouds__layer";
    c.style.cssText = `--l:${i * 2};--ox:${((i * 37) % 60) - 30}%;--oy:${((i * 23) % 40) - 20}%`;
    clouds.append(c);
  }
}

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  decorate(root);

  const scenes = [...root.querySelectorAll(".c-run-scene")];
  const rows = [...root.querySelectorAll(".js-row")];
  const counters = [...root.querySelectorAll(".js-cnt")];
  const dots = [...root.querySelectorAll(".c-run-hud__dot")];
  const N = scenes.length;
  let frame = 0;
  let cur = -1;

  const update = () => {
    frame = 0;
    const span = root.offsetHeight - innerHeight;
    const p = clamp(-root.getBoundingClientRect().top / span);
    root.style.setProperty("--p", p.toFixed(4));
    scenes.forEach((s, i) => {
      const k = clamp(p * N - i);
      root.style.setProperty(`--k${i + 1}`, k.toFixed(4));
      s.style.setProperty("--cur", k.toFixed(4));
      s.classList.toggle("is-vis", (i === 0 ? k < 1 : k > 0) && (i === N - 1 ? true : k < 1));
    });
    rows.forEach((r) => r.style.setProperty("--shift", `${(p * N - 3) * Number(r.dataset.dir) * 22}%`));
    const k5 = clamp(p * N - 4);
    counters.forEach((c) => {
      c.firstChild.textContent = Math.round(Number(c.dataset.to) * clamp(k5 * 4));
    });
    const idx = Math.min(N - 1, Math.floor(p * N));
    if (idx !== cur) {
      cur = idx;
      dots.forEach((d, i) => d.classList.toggle("is-on", i === idx));
    }
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  // 메뉴 링크: 장면 위치로 이동
  const goScene = (id) => {
    const i = scenes.findIndex((s) => s.id === id);
    if (i < 0) return false;
    const span = root.offsetHeight - innerHeight;
    const top = root.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + ((i + 0.55) / N) * span, behavior: "smooth" });
    return true;
  };
  const onClick = (e) => {
    const a = e.target.closest?.("a[href*='#']");
    if (!a) return;
    const u = new URL(a.href, location.href);
    if (u.pathname !== location.pathname || !u.hash) return;
    if (goScene(u.hash.slice(1))) e.preventDefault();
  };
  document.addEventListener("click", onClick);
  if (location.hash) setTimeout(() => goScene(location.hash.slice(1)), 300);

  const onMove = (e) => {
    root.style.setProperty("--mx", ((e.clientX / innerWidth - 0.5) * 2).toFixed(3));
    root.style.setProperty("--my", ((e.clientY / innerHeight - 0.5) * 2).toFixed(3));
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  addEventListener("pointermove", onMove, { passive: true });
  update();
  return {
    destroy() {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("click", onClick);
    },
  };
}
