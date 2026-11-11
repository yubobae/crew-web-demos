// 고정 구간 진행률: root가 화면 위에 붙어 있는 동안(root 높이 − 화면 높이만큼 스크롤) 0→1을 --pp로 쓴다.
// 첫 화면을 붙여 두고 그 위에서 장면을 바꿀 때 쓴다. 화면에 보일 때만 스크롤을 듣고, 읽기는 스크롤마다 한 번(rAF).
// 동작 줄이기면 아무것도 하지 않는다(CSS가 고정을 풀고 --pp는 0).
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  let frame = 0;
  let last = -1;

  const update = () => {
    frame = 0;
    const span = root.offsetHeight - innerHeight;
    const p = span > 0 ? Math.min(1, Math.max(0, -root.getBoundingClientRect().top / span)) : 0;
    const v = Math.round(p * 1000) / 1000;
    if (v === last) return;
    last = v;
    root.style.setProperty("--pp", String(v));
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
