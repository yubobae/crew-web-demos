// 맨 위 얇은 진행 막대: 페이지를 얼마나 내렸는지를 --p(0~1)로 막대 scaleX에 반영한다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init() {
  if (prefersReducedMotion()) return { destroy() {} };
  const bar = document.createElement("div");
  bar.className = "c-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.append(bar);
  let frame = 0;
  const update = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : "0");
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  addEventListener("scroll", request, { passive: true });
  update();
  return {
    destroy() {
      removeEventListener("scroll", request);
      cancelAnimationFrame(frame);
      bar.remove();
    },
  };
}
