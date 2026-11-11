// 포인터 빛: root(그리드) 위에서 포인터가 움직이면 각 타일(.js-glow)에 포인터의 상대 위치 --mx, --my를 쓴다.
// 그리드 전체에 하나의 빛이 지나가는 것처럼 이웃 타일 테두리도 함께 빛난다. 위에 있을 때 root에 is-glowing.
// 타일 위치는 들어올 때 한 번 재고(스크롤·크기 변경 때 다시), 쓰기는 rAF 한 번에 모은다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  const tiles = [...root.querySelectorAll(".js-glow")];
  if (!tiles.length || prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return { destroy() {} };
  let rects = null;
  let frame = 0;
  let x = 0;
  let y = 0;

  const measure = () => (rects = tiles.map((t) => t.getBoundingClientRect()));
  // 빛의 반지름(CSS 22rem)보다 먼 타일은 어차피 안 보이므로 값을 다시 쓰지 않는다(다시 그리기 줄이기)
  const reach = parseFloat(getComputedStyle(document.documentElement).fontSize) * 23;
  const far = tiles.map(() => false);
  const apply = () => {
    frame = 0;
    tiles.forEach((t, i) => {
      const r = rects[i];
      const dx = Math.max(r.left - x, 0, x - r.right);
      const dy = Math.max(r.top - y, 0, y - r.bottom);
      const isFar = Math.hypot(dx, dy) > reach;
      if (isFar && far[i]) return;
      far[i] = isFar;
      t.style.setProperty("--mx", `${x - r.left}px`);
      t.style.setProperty("--my", `${y - r.top}px`);
    });
  };
  const onMove = (event) => {
    x = event.clientX;
    y = event.clientY;
    if (!rects) measure();
    if (!frame) frame = requestAnimationFrame(apply);
  };
  const onEnter = () => {
    measure();
    root.classList.add("is-glowing");
  };
  const onLeave = () => root.classList.remove("is-glowing");
  const reset = () => (rects = null);

  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  addEventListener("scroll", reset, { passive: true });
  addEventListener("resize", reset);
  return {
    destroy() {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      removeEventListener("scroll", reset);
      removeEventListener("resize", reset);
    },
  };
}
