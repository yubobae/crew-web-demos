// 재생 엔진: 화면에 들어오고 나갈 때 효과를 어떻게 실행할지 정한다.
// 모든 효과는 CSS에서 --p(0~1) 하나로 모양을 정하고(c-play.css), 이 모듈은 --p를 바꾸기만 한다.
//
// 재생 방식(html[data-play-mode] 또는 요소의 data-play-mode가 우선)
//   once    한 번만      : 처음 들어올 때 0→1, 다시 나가도 그대로
//   repeat  매번         : 화면 밖으로 완전히 나가면 조용히 0으로 되돌려 두고, 들어올 때마다 다시 0→1
//   reverse 되감기       : 나가는 순간 1→0으로 거꾸로 재생(위·아래 어느 쪽으로 나가도)
//   scrub   스크롤에 맞춰: 스크롤 위치에 따라 --p가 바로 따라감(멈추면 멈추고, 올리면 거꾸로)
// 같은 묶음(data-play-group) 안에서는 순서대로 조금씩 늦게(--i).
// 이벤트: window의 play-mode:change를 받으면 모든 요소를 새 방식으로 다시 맞춘다.
import { prefersReducedMotion } from "../utils/motion.js";

const MODES = ["once", "repeat", "reverse", "scrub"];

export function init(root) {
  const items = [...root.querySelectorAll(".c-play")];
  if (!items.length) return { destroy() {} };
  if (prefersReducedMotion()) {
    items.forEach((el) => el.style.setProperty("--p", "1"));
    return { destroy() {} };
  }

  // 묶음 안 순서
  const groups = new Map();
  items.forEach((el) => {
    const key = el.closest("[data-play-group]") ?? el;
    const n = groups.get(key) ?? 0;
    el.style.setProperty("--i", String(n));
    groups.set(key, n + 1);
  });

  const modeOf = (el) => {
    const m = el.dataset.playMode || document.documentElement.dataset.playMode || "reverse";
    return MODES.includes(m) ? m : "reverse";
  };
  const state = new Map(); // el → { visible, played }
  const set = (el, value, animate = true) => {
    el.classList.toggle("is-instant", !animate);
    el.style.setProperty("--p", String(value));
  };

  // 풀페이지 안의 요소는 "보이는 화면(활성 패널)"으로 판단한다(덮인 화면도 화면 안에 있긴 해서 IO로는 구분 안 됨)
  const inFullpage = (el) => !!el.closest(".l-fp.is-enabled .l-fp__panel");

  const enter = (el) => {
    const s = state.get(el) ?? { visible: false, played: false };
    if (s.visible) return;
    const mode = modeOf(el);
    // 매번 모드: 처음부터 다시 보이도록 0으로 순간 이동 후 재생
    if (mode === "repeat" && s.played) set(el, 0, false);
    s.visible = true;
    s.played = true;
    state.set(el, s);
    requestAnimationFrame(() => set(el, 1));
  };
  const leave = (el, { quiet = false } = {}) => {
    const s = state.get(el) ?? { visible: false, played: false };
    if (!s.visible) return;
    s.visible = false;
    state.set(el, s);
    const mode = modeOf(el);
    if (mode === "reverse" || mode === "scrub") set(el, 0);
    else if (mode === "repeat" && quiet) set(el, 0, false);
  };

  // 들어오고 나가기(once·repeat·reverse)
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (inFullpage(el) || modeOf(el) === "scrub") continue;
        if (entry.isIntersecting) enter(el);
        else leave(el);
      }
    },
    { threshold: 0.2 },
  );

  const onFullpage = (event) => {
    items.forEach((el) => {
      const panel = el.closest(".l-fp__panel");
      if (!panel || !inFullpage(el)) return;
      if (panel.classList.contains("is-active")) enter(el);
      else leave(el, { quiet: true });
    });
  };

  // 완전히 화면 밖(repeat용 조용한 되돌리기)
  const ioOut = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting || inFullpage(entry.target) || modeOf(entry.target) !== "repeat") continue;
        set(entry.target, 0, false);
      }
    },
    { threshold: 0 },
  );

  // 스크롤에 맞춰(scrub)
  let frame = 0;
  const scrubItems = () => items.filter((el) => modeOf(el) === "scrub" && !inFullpage(el));
  const scrub = () => {
    frame = 0;
    const vh = innerHeight;
    const list = scrubItems();
    const values = list.map((el) => {
      const r = el.getBoundingClientRect();
      // 요소 위쪽이 화면의 from 지점(기본 90%)에 닿을 때 0, to 지점(기본 45%)까지 올라오면 1.
      // 페이지 위쪽에 있는 요소(첫 화면의 큰 사진 등)는 data-scrub-from / data-scrub-to로 범위를 당긴다.
      const from = Number(el.dataset.scrubFrom ?? 0.9);
      const to = Number(el.dataset.scrubTo ?? 0.45);
      return Math.min(1, Math.max(0, (vh * from - r.top) / (vh * (from - to))));
    });
    list.forEach((el, k) => set(el, values[k].toFixed(3), false));
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(scrub);
  };

  // 재생 방식을 바꿨을 때: 지금 보이는 것은 보이는 상태로, 나머지는 처음 상태로 맞춘다
  const apply = () => {
    items.forEach((el) => {
      const mode = modeOf(el);
      if (mode === "scrub" && !inFullpage(el)) return;
      const panel = el.closest(".l-fp__panel");
      let inView;
      if (panel && inFullpage(el)) inView = panel.classList.contains("is-active");
      else {
        const r = el.getBoundingClientRect();
        inView = r.top < innerHeight * 0.85 && r.bottom > innerHeight * 0.1;
      }
      set(el, inView ? 1 : 0, false);
      state.set(el, { visible: inView, played: inView });
    });
    scrub();
  };

  items.forEach((el) => {
    el.style.setProperty("--p", "0");
    io.observe(el);
    ioOut.observe(el);
  });
  // 풀페이지 모듈이 먼저 준비됐다면 지금 활성 화면을 바로 반영
  requestAnimationFrame(() => {
    scrub();
    onFullpage();
  });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  addEventListener("play-mode:change", apply);
  document.addEventListener("fullpage:change", onFullpage);

  return {
    destroy() {
      document.removeEventListener("fullpage:change", onFullpage);
      io.disconnect();
      ioOut.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("play-mode:change", apply);
    },
  };
}
