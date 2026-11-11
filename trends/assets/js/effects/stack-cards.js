// 쌓이는 카드: 각 카드(.js-stack-card)가 다음 카드에 얼마나 덮였는지(0~1)를 --cover로 쓴다.
// 다음 카드의 윗변이 이 카드의 윗변에 닿을수록 1. 보일 때만 스크롤을 듣고, 읽기를 모두 끝낸 뒤 쓰기(레이아웃 한 번).
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  const cards = [...root.querySelectorAll(".js-stack-card")];
  if (cards.length < 2 || prefersReducedMotion()) return { destroy() {} };
  let frame = 0;
  const last = cards.map(() => -1);

  const update = () => {
    frame = 0;
    const rects = cards.map((c) => c.getBoundingClientRect()); // 읽기 먼저
    cards.forEach((card, i) => {
      const next = rects[i + 1];
      const p = next ? Math.min(1, Math.max(0, 1 - (next.top - rects[i].top) / rects[i].height)) : 0;
      const v = Math.round(p * 100) / 100;
      if (v === last[i]) return;
      last[i] = v;
      card.style.setProperty("--cover", String(v)); // 그다음 쓰기
    });
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
  return {
    destroy() {
      io.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
    },
  };
}
