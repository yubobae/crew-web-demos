// 스크롤 따라 천천히 움직이는 패럴랙스: root 안의 .js-par[data-speed] 가 화면 가운데에서 벗어난 만큼
// --py(px)로 밀린다. 값은 transform에만 쓰이고, 화면 밖이면 계산하지 않는다. 동작 줄이기면 켜지 않는다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  const items = [...root.querySelectorAll(".js-par")];
  if (root.classList.contains("js-par")) items.push(root);
  if (!items.length) return { destroy() {} };
  const visible = new Set();
  let frame = 0;
  const update = () => {
    frame = 0;
    const mid = innerHeight / 2;
    for (const el of visible) {
      const r = el.getBoundingClientRect();
      const d = r.top + r.height / 2 - mid;
      el.style.setProperty("--py", `${(-d * Number(el.dataset.speed || 0.1)).toFixed(1)}px`);
    }
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      request();
    },
    { rootMargin: "20% 0px" },
  );
  items.forEach((el) => io.observe(el));
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
  return {
    destroy() {
      io.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
    },
  };
}
