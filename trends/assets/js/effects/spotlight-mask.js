// 커서 스포트라이트: root 위 포인터 위치를 root 기준 --mx, --my(px)로 쓴다. rAF 한 번에 모아 쓰기.
// 마우스가 없거나 동작 줄이기면 CSS 기본값(가운데)을 그대로 둔다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return { destroy() {} };
  let rect = null;
  let frame = 0;
  let x = 0;
  let y = 0;

  const apply = () => {
    frame = 0;
    rect ??= root.getBoundingClientRect(); // 스크롤로 비운 뒤라면 다시 잰다
    root.style.setProperty("--mx", `${x - rect.left}px`);
    root.style.setProperty("--my", `${y - rect.top}px`);
  };
  const onMove = (event) => {
    if (!rect) rect = root.getBoundingClientRect();
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(apply);
  };
  const reset = () => (rect = null);

  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", reset);
  addEventListener("scroll", reset, { passive: true });
  addEventListener("resize", reset);
  return {
    destroy() {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", reset);
      removeEventListener("scroll", reset);
      removeEventListener("resize", reset);
    },
  };
}
