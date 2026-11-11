// 부드러운(관성) 스크롤: 마우스 휠을 굴리면 목표 위치로 미끄러지듯 따라간다(Lenis 같은 느낌, 라이브러리 없이).
// - html.is-smooth일 때만 동작(scroll-settings에서 켜고 끔), 섹션 스냅이 켜져 있으면 쉰다(둘이 싸우지 않게)
// - 터치 기기·동작 줄이기·Ctrl+휠(확대)·안쪽 스크롤 상자 위에서는 브라우저 기본 스크롤
// - 키보드·스크롤바로 움직이면 그 위치를 그대로 따른다. 페이지 안 링크(#id)도 부드럽게 이동
import { prefersReducedMotion } from "../utils/motion.js";
import { isSmooth, isSnap, setSmooth } from "../utils/scroll-mode.js";

const LERP = 0.1;           // 따라가는 비율(작을수록 미끄러짐이 길다)
const WHEEL_SCALE = 1;      // 휠 한 칸 이동량 배율

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

  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const active = () => isSmooth() && !isSnap();

  const tick = () => {
    current += (target - current) * LERP;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      animating = false;
    }
    window.scrollTo(0, current);
    if (animating) frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (animating) return;
    animating = true;
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
    if (!animating) current = scrollY;
    target = Math.max(0, Math.min(maxScroll(), target + delta * WHEEL_SCALE));
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
    current = scrollY;
    target = Math.max(0, Math.min(maxScroll(), el.getBoundingClientRect().top + scrollY));
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
