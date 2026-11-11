// 풀페이지: PC(1025px 이상)·동작 줄이기 꺼짐일 때만 섹션을 한 장씩 넘긴다(1000ms). 모바일은 일반 스크롤.
// 휠·키보드(↑↓ PageUp/Down Home End Space)·터치·옆 점으로 이동. 이벤트: fullpage:change (detail.index)
// root: .l-fullpage (안에 .l-fullpage__track > .l-fullpage__section, .js-fp-dots)
import { isDesktop, prefersReducedMotion } from "../utils/motion.js";
import { lockScroll, unlockScroll } from "../utils/scroll-lock.js";
import { createWheelIntent } from "../utils/wheel-intent.js";

const LOCK_MS = 800;          // 넘어가는 동안 새 입력은 기다리게(하나만 예약)
const QUEUE_AFTER_MS = 200;   // 넘김 직후 이 시간 안의 휠은 같은 동작의 연속으로 본다(트랙패드 쓸기의 가속 구간)

export function init(root) {
  const track = root.querySelector(".l-fullpage__track");
  const sections = [...root.querySelectorAll(".l-fullpage__section")];
  const dotsBox = root.querySelector(".js-fp-dots");
  if (!track || sections.length < 2) return { destroy() {} };

  let index = 0;
  let busy = false;
  let lastTriggerAt = 0;
  let queued = 0;
  const intent = createWheelIntent();
  let enabled = false;
  let touchY = null;
  const dots = [];

  if (dotsBox) {
    sections.forEach((section, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "c-fp-dots__dot";
      dot.setAttribute("aria-label", `${i + 1}번째 화면: ${section.getAttribute("aria-label") ?? ""}`.trim());
      dot.addEventListener("click", () => go(i));
      dotsBox.append(dot);
      dots.push(dot);
    });
  }

  const render = () => {
    root.style.setProperty("--fp-index", String(index));
    sections.forEach((s, i) => {
      s.classList.toggle("is-active", i === index);
      s.inert = enabled && i !== index; // 보이지 않는 섹션은 Tab 이동에서 뺀다
    });
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === index)));
  };

  const go = (next) => {
    if (!enabled) return;
    const target = Math.max(0, Math.min(sections.length - 1, next));
    if (target === index || busy) return;
    index = target;
    busy = true;
    render();
    root.dispatchEvent(new CustomEvent("fullpage:change", { bubbles: true, detail: { index } }));
    lastTriggerAt = performance.now();
    setTimeout(() => {
      busy = false;
      if (!queued) return;
      const d = queued;
      queued = 0;
      go(index + d);
    }, LOCK_MS);
  };

  const onWheel = (event) => {
    if (!enabled) return;
    event.preventDefault();
    const dir = intent(event);
    if (!dir) return;
    if (busy) {
      if (performance.now() - lastTriggerAt > QUEUE_AFTER_MS) queued = dir;
      return;
    }
    go(index + dir);
  };

  const onKey = (event) => {
    if (!enabled || event.target.closest("input, textarea, select, [contenteditable]")) return;
    // 탭 목록 안에서는 화살표·Home·End를 탭에 양보하고 PageUp/Down만 받는다
    if (event.target.closest("[role='tablist']") && !["PageDown", "PageUp"].includes(event.key)) return;
    // 버튼·링크 위의 Space는 누르기 동작이므로 건드리지 않는다
    if (event.key === " " && event.target.closest("button, a")) return;
    const map = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 };
    if (event.key === "Home") go(0);
    else if (event.key === "End") go(sections.length - 1);
    else if (event.key in map) go(index + (event.shiftKey && event.key === " " ? -1 : map[event.key]));
    else return;
    event.preventDefault();
  };

  // 페이지 안 링크(#id)는 해당 섹션으로 넘긴다
  const onLink = (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!enabled || !link) return;
    const target = document.getElementById(link.getAttribute("href").slice(1));
    const i = sections.findIndex((s) => s === target || s.contains(target));
    if (i < 0) return;
    event.preventDefault();
    go(i);
  };

  const onTouchStart = (event) => (touchY = event.touches[0].clientY);
  const onTouchEnd = (event) => {
    if (touchY === null) return;
    const dy = touchY - event.changedTouches[0].clientY;
    touchY = null;
    if (Math.abs(dy) > 50) go(index + (dy > 0 ? 1 : -1));
  };

  const update = () => {
    const should = isDesktop() && !prefersReducedMotion();
    if (should === enabled) return;
    enabled = should;
    root.classList.toggle("is-enabled", enabled);
    dotsBox?.classList.toggle("is-enabled", enabled);
    if (enabled) lockScroll();
    else {
      unlockScroll();
      sections.forEach((s) => (s.inert = false));
    }
    render();
  };

  update();
  addEventListener("resize", update);
  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("keydown", onKey);
  document.addEventListener("click", onLink);
  root.addEventListener("touchstart", onTouchStart, { passive: true });
  root.addEventListener("touchend", onTouchEnd);

  return {
    destroy() {
      removeEventListener("resize", update);
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      document.removeEventListener("click", onLink);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchend", onTouchEnd);
      if (enabled) unlockScroll();
    },
  };
}
