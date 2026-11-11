// 큰 글자 띠: 스크롤을 내릴 때마다 줄(.js-drift)들이 흐른다(--dx). 속도·방향은 data-speed(음수면 반대).
// 화면 밖이면 계산하지 않는다. 동작 줄이기면 가만히 둔다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  const rows = [...root.querySelectorAll(".js-drift")];
  let on = false;
  let frame = 0;
  const update = () => {
    frame = 0;
    if (!on) return;
    const p = root.getBoundingClientRect().top - innerHeight / 2;
    rows.forEach((row) => row.style.setProperty("--dx", `${(p * Number(row.dataset.speed || 0.4)).toFixed(1)}px`));
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    request();
  });
  io.observe(root);
  addEventListener("scroll", request, { passive: true });
  return {
    destroy() {
      io.disconnect();
      removeEventListener("scroll", request);
      cancelAnimationFrame(frame);
    },
  };
}
