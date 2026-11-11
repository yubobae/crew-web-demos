// 스크롤 진행률: root(또는 .js-sp-target)가 화면 아래로 들어오기 시작할 때 0, 위쪽 끝이 화면의 data-sp-end(기본 0.25) 높이에 오면 1.
// 그 값을 root에 --sp로 쓴다. 화면에 보일 때만 스크롤을 듣고(IntersectionObserver), 읽기는 스크롤마다 한 번(rAF).
// 동작 줄이기면 --sp를 1로 고정(CSS 기본값).
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  const target = root.querySelector(".js-sp-target") ?? root;
  const end = Number(root.dataset.spEnd ?? 0.25);
  let frame = 0;
  let last = -1;

  const update = () => {
    frame = 0;
    const top = target.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (innerHeight - top) / (innerHeight * (1 - end))));
    const v = Math.round(p * 1000) / 1000;
    if (v === last) return;
    last = v;
    root.style.setProperty("--sp", String(v));
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    } else removeEventListener("scroll", onScroll);
  });
  io.observe(root);
  update();
  return {
    destroy() {
      io.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
    },
  };
}
