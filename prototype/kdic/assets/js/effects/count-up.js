// 숫자 굴려 올리기: .js-count[data-to] 가 화면에 들어오면 0에서 data-to까지 올라간다.
// data-prefix·data-suffix 로 앞뒤 글자, data-duration(ms)로 시간. 동작 줄이기면 바로 최종값.
import { prefersReducedMotion, tween } from "../utils/motion.js";

const fmt = new Intl.NumberFormat("ko-KR");

export function init(root) {
  const nums = root.querySelectorAll(".js-count").length ? [...root.querySelectorAll(".js-count")] : [root];
  const text = (el, n) => `${el.dataset.prefix ?? ""}${fmt.format(Math.round(n))}${el.dataset.suffix ?? ""}`;
  const cancels = [];

  if (prefersReducedMotion()) {
    nums.forEach((el) => (el.textContent = text(el, Number(el.dataset.to))));
    return { destroy() {} };
  }
  nums.forEach((el) => (el.textContent = text(el, 0)));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const el = e.target;
        const to = Number(el.dataset.to);
        cancels.push(tween(Number(el.dataset.duration ?? 1600), (p) => (el.textContent = text(el, to * p))));
      }
    },
    { threshold: 0.6 },
  );
  nums.forEach((el) => io.observe(el));
  return {
    destroy() {
      io.disconnect();
      cancels.forEach((c) => c());
    },
  };
}
