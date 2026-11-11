// 막대 자라기: .js-bar[data-ratio](0~1)가 화면에 들어오면 --w 가 0에서 비율까지 자란다(CSS transition). 동작 줄이기면 바로 최종 길이.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  const bars = [...root.querySelectorAll(".js-bar")];
  const set = (bar, on) => bar.style.setProperty("--w", on ? bar.dataset.ratio : "0");
  if (prefersReducedMotion()) {
    bars.forEach((bar) => set(bar, true));
    return { destroy() {} };
  }
  bars.forEach((bar) => set(bar, false));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        set(e.target, true);
        io.unobserve(e.target);
      }
    },
    { threshold: 0.5 },
  );
  bars.forEach((bar) => io.observe(bar));
  return {
    destroy() {
      io.disconnect();
    },
  };
}
