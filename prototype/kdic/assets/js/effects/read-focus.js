// 읽는 자리 선명하게: root 안의 .js-focus 요소가 화면 가운데 띠에 가까울수록 --f(0~1)가 커져 CSS가 흐림 → 선명을 그린다.
// 화면에 보이는 요소만 스크롤마다 한 번 계산한다(rAF로 묶음). 동작 줄이기면 처음부터 선명(--f 없음 = 1).
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  const items = [...root.querySelectorAll(".js-focus")];
  const live = new Set();
  let frame = 0;

  const update = () => {
    frame = 0;
    const mid = innerHeight * 0.55;
    for (const el of live) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid) / (innerHeight * 0.5);
      el.style.setProperty("--f", Math.max(0, Math.min(1, 1.35 - d)).toFixed(3));
    }
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) (e.isIntersecting ? live.add(e.target) : live.delete(e.target));
    onScroll();
  });
  items.forEach((el) => {
    el.style.setProperty("--f", "0");
    io.observe(el);
  });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  return {
    destroy() {
      cancelAnimationFrame(frame);
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      items.forEach((el) => el.style.removeProperty("--f"));
    },
  };
}
