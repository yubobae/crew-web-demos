// 스크롤 연동 고정 구역: root(.c-flow)가 길게 늘어나 있고 안의 무대가 화면에 붙어 있는 동안,
// 스크롤 진행률(0~1)에 따라 단계가 바뀐다. root에 data-active(0부터)와 --p 를 쓴다.
// 좁은 화면에서는 CSS가 고정을 풀고 전부 펼쳐 보이게 하므로 JS는 값만 갱신한다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  const items = [...root.querySelectorAll(".js-flow-item")];
  const dots = [...root.querySelectorAll(".js-flow-dot")];
  const count = items.length;
  if (!count) return { destroy() {} };
  root.style.setProperty("--n", String(count));
  let frame = 0;
  let on = false;
  const update = () => {
    frame = 0;
    if (!on) return;
    const r = root.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    root.style.setProperty("--p", p.toFixed(4));
    const idx = Math.min(count - 1, Math.floor(p * count));
    if (root.dataset.active !== String(idx)) {
      root.dataset.active = String(idx);
      items.forEach((el, i) => el.classList.toggle("is-active", i === idx));
      dots.forEach((el, i) => el.classList.toggle("is-active", i === idx));
    }
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver(
    ([e]) => {
      on = e.isIntersecting;
      request();
    },
    { rootMargin: "10% 0px" },
  );
  root.dataset.active = "0";
  items[0].classList.add("is-active");
  dots[0]?.classList.add("is-active");
  io.observe(root);
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
