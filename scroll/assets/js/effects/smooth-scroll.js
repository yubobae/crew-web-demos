// 부드러운(관성) 스크롤: 마우스 휠을 굴리면 목표 위치로 미끄러지듯 따라간다(Lenis 같은 느낌, 라이브러리 없이).
// - html.is-smooth일 때만 동작(scroll-settings에서 켜고 끔), 섹션 스냅이 켜져 있으면 쉰다(둘이 싸우지 않게)
// - 터치 기기·동작 줄이기·Ctrl+휠(확대)·안쪽 스크롤 상자 위에서는 브라우저 기본 스크롤
// - 키보드·스크롤바로 움직이면 그 위치를 그대로 따른다. 페이지 안 링크(#id)도 부드럽게 이동
import { prefersReducedMotion } from "../utils/motion.js";
import { isSmooth, isSnap, setSmooth } from "../utils/scroll-mode.js";

const DAMPING = 9;          // 따라가는 빠르기(초당). 화면 주사율(60·120·144Hz)과 상관없이 같은 느낌
const WHEEL_SCALE = 1;      // 휠 한 칸 이동량 배율
const STOP_PX = 0.25;       // 이만큼 가까워지면 멈춤

export function init() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (prefersReducedMotion() || coarse) {
    setSmooth(false);
    return { destroy() {} };
  }

  let target = scrollY;
  let current = scrollY;
  let frame = 0;
  let animating = false;
  let lastTime = 0;
  let maxY = 0;

  const measure = () => (maxY = document.documentElement.scrollHeight - innerHeight);
  const active = () => isSmooth() && !isSnap();

  // 시간 기준 감쇠: 프레임 간격(dt)만큼 남은 거리를 줄인다. 프레임이 한 번 늦어도 위치가 튀지 않는다.
  const tick = (now) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 1 / 60);
    lastTime = now;
    current += (target - current) * (1 - Math.exp(-DAMPING * dt));
    if (Math.abs(target - current) < STOP_PX) {
      current = target;
      animating = false;
    }
    window.scrollTo(0, current);
    if (animating) frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (animating) return;
    animating = true;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const canScrollInside = (el, dy) => {
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      const s = getComputedStyle(node);
      if (!/(auto|scroll)/.test(s.overflowY) || node.scrollHeight <= node.clientHeight) continue;
      if ((dy > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) || (dy < 0 && node.scrollTop > 0)) return true;
    }
    return false;
  };

  const onWheel = (event) => {
    if (!active() || event.ctrlKey || document.documentElement.classList.contains("is-locked")) return;
    if (canScrollInside(event.target, event.deltaY)) return;
    event.preventDefault();
    const delta = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY; // 줄 단위 휠 보정
    if (!animating) {
      current = target = scrollY;
      measure(); // 페이지 높이는 움직이기 시작할 때 한 번만 읽는다(매 프레임 읽으면 레이아웃 계산이 생김)
    }
    target = Math.max(0, Math.min(maxY, target + delta * WHEEL_SCALE));
    start();
  };

  // 키보드·스크롤바·다른 코드로 움직였을 때 목표를 따라 맞춘다
  const onScroll = () => {
    if (!animating) target = current = scrollY;
  };

  const onLink = (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!active() || !link || link.getAttribute("href") === "#") return;
    const el = document.getElementById(link.getAttribute("href").slice(1));
    if (!el) return;
    event.preventDefault();
    measure();
    current = scrollY;
    target = Math.max(0, Math.min(maxY, el.getBoundingClientRect().top + scrollY));
    start();
    history.replaceState(null, "", link.getAttribute("href"));
  };

  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", onLink);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      removeEventListener("wheel", onWheel);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onLink);
    },
  };
}
