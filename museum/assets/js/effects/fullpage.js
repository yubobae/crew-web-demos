// 풀페이지(박물관 메인): 휠을 살짝만 굴려도 한 화면씩 넘어간다.
// - 넘김 방식(data-fp-mode): cover = 다음 화면이 아래에서 올라와 덮음(기본), slide = 화면 전체가 함께 밀려 올라감
// - 마지막 푸터(data-fp-auto)는 자기 높이만큼만 올라온다
// - 오른쪽 진행 표시(.js-fp-progress): 세로선 위 눈금 + 현재 번호 + 도는 점선 고리
// - 헤더 색: 화면마다 data-theme(light|dark)를 fullpage:change 이벤트로 알린다(헤더 모듈이 받음)
// - PC(1025px 이상)·동작 줄이기 꺼짐일 때만. 모바일은 일반 스크롤
// 휠 한 번 = 한 화면. 넘어가는 동안(LOCK_MS)과 관성 휠(트랙패드)이 잦아들 때까지는 추가 입력 무시
import { isDesktop, prefersReducedMotion } from "../utils/motion.js";
import { lockScroll, unlockScroll } from "../utils/scroll-lock.js";
import { createWheelIntent } from "../utils/wheel-intent.js";

const LOCK_MS = 750;          // 넘어가는 동안 새 입력은 기다리게(하나만 예약)
const QUEUE_AFTER_MS = 200;   // 넘김 직후 이 시간 안의 휠은 같은 동작의 연속으로 본다(트랙패드 쓸기의 가속 구간)

export function init(root) {
  const panels = [...root.querySelectorAll(".l-fp__panel")];
  const progress = root.querySelector(".js-fp-progress");
  if (panels.length < 2) return { destroy() {} };
  const mode = root.dataset.fpMode === "slide" ? "slide" : "cover";
  root.classList.add(`l-fp--${mode}`);

  let index = 0;
  let enabled = false;
  let busyUntil = 0;
  let lastTriggerAt = 0;
  let queued = 0;
  let queueTimer = 0;
  const intent = createWheelIntent();
  let touchY = null;
  const ticks = [];
  const numbered = panels.filter((p) => !p.hasAttribute("data-fp-auto"));

  // 진행 표시 만들기
  let numEl = null;
  if (progress) {
    const line = document.createElement("div");
    line.className = "c-fp-progress__line";
    numbered.forEach((panel, i) => {
      const tick = document.createElement("button");
      tick.type = "button";
      tick.className = "c-fp-progress__tick";
      tick.style.setProperty("--at", String(numbered.length === 1 ? 0 : i / (numbered.length - 1)));
      tick.setAttribute("aria-label", `${i + 1}번째 화면: ${panel.getAttribute("aria-label") ?? ""}`.trim());
      tick.addEventListener("click", () => go(panels.indexOf(panel)));
      line.append(tick);
      ticks.push(tick);
    });
    numEl = document.createElement("span");
    numEl.className = "c-fp-progress__current";
    numEl.setAttribute("aria-hidden", "true");
    line.append(numEl);
    progress.append(line);
  }

  const render = () => {
    const footer = panels[index].hasAttribute("data-fp-auto") ? panels[index] : null;
    panels.forEach((p, i) => {
      p.classList.toggle("is-active", i === index);
      p.classList.toggle("is-past", i < index);
      p.classList.toggle("is-future", i > index);
      p.classList.toggle("is-lifted", !!footer && i === index - 1);
      p.inert = enabled && i !== index && !(footer && i === index - 1);
    });
    // 푸터 단계: 마지막 화면을 푸터 높이만큼만 밀어 올린다
    root.style.setProperty("--fp-footer-shift", footer ? `${footer.offsetHeight}px` : "0px");
    root.style.setProperty("--fp-index", String(index));
    const n = Math.min(numbered.length - 1, numbered.indexOf(panels[index]) < 0 ? numbered.length - 1 : numbered.indexOf(panels[index]));
    ticks.forEach((t, i) => t.setAttribute("aria-current", String(i === n)));
    if (numEl) {
      numEl.textContent = String(n + 1).padStart(2, "0");
      numEl.style.setProperty("--at", String(numbered.length === 1 ? 0 : n / (numbered.length - 1)));
    }
    const themePanel = footer ? panels[index - 1] : panels[index];
    progress?.setAttribute("data-theme", themePanel?.dataset.theme ?? "dark");
    document.dispatchEvent(new CustomEvent("fullpage:change", { detail: { index, theme: themePanel?.dataset.theme ?? "dark" } }));
  };

  const go = (next) => {
    if (!enabled) return;
    const target = Math.max(0, Math.min(panels.length - 1, next));
    if (target === index || performance.now() < busyUntil) return;
    index = target;
    busyUntil = performance.now() + LOCK_MS;
    render();
    // 넘어가는 동안 예약된 방향이 있으면 끝나자마자 이어서 한 화면 더
    clearTimeout(queueTimer);
    queueTimer = setTimeout(() => {
      if (!queued) return;
      const d = queued;
      queued = 0;
      lastTriggerAt = performance.now();
      go(index + d);
    }, LOCK_MS);
  };

  // 휠: 새로 굴린 것만 한 화면 이동(관성은 무시). 넘어가는 중에 계속 굴리면 다음 한 화면을 예약
  const onWheel = (event) => {
    if (!enabled || event.ctrlKey) return;
    event.preventDefault();
    const dir = intent(event);
    if (!dir) return;
    const now = performance.now();
    if (now < busyUntil) {
      if (now - lastTriggerAt > QUEUE_AFTER_MS) queued = dir;
      return;
    }
    queued = 0;
    lastTriggerAt = now;
    go(index + dir);
  };

  const onKey = (event) => {
    if (!enabled || event.target.closest("input, textarea, select, [contenteditable], dialog[open]")) return;
    if (event.key === " " && event.target.closest("button, a")) return;
    const map = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 };
    if (event.key === "Home") go(0);
    else if (event.key === "End") go(panels.length - 1);
    else if (event.key in map) go(index + (event.shiftKey && event.key === " " ? -1 : map[event.key]));
    else return;
    event.preventDefault();
  };

  const onLink = (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!enabled || !link) return;
    const target = document.getElementById(link.getAttribute("href").slice(1));
    const i = panels.findIndex((p) => p === target || p.contains(target));
    if (i < 0) return;
    event.preventDefault();
    busyUntil = 0;
    go(i);
  };

  const onTouchStart = (event) => (touchY = event.touches[0].clientY);
  const onTouchEnd = (event) => {
    if (touchY === null) return;
    const dy = touchY - event.changedTouches[0].clientY;
    touchY = null;
    if (Math.abs(dy) > 40) go(index + (dy > 0 ? 1 : -1));
  };

  const update = () => {
    const should = isDesktop() && !prefersReducedMotion();
    if (should !== enabled) {
      enabled = should;
      root.classList.toggle("is-enabled", enabled);
      progress?.classList.toggle("is-enabled", enabled);
      if (enabled) lockScroll();
      else {
        unlockScroll();
        panels.forEach((p) => (p.inert = false));
      }
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
      clearTimeout(queueTimer);
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
