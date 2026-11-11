// 기울기 카드: root 위에서 포인터가 움직이면 카드(.js-tilt-card)가 그쪽으로 기울고(--rx, --ry),
// 반사광 위치(--gx, --gy)가 따라간다. 벗어나면 CSS 스프링으로 제자리. 마우스 기기·동작 줄이기 꺼짐에서만.
import { prefersReducedMotion } from "../utils/motion.js";

const MAX_DEG = 14;

export function init(root) {
  const card = root.querySelector(".js-tilt-card");
  if (!card || prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return { destroy() {} };
  let rect = null;
  let frame = 0;
  let px = 0;
  let py = 0;

  const apply = () => {
    frame = 0;
    const x = Math.min(1, Math.max(0, (px - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (py - rect.top) / rect.height));
    card.style.setProperty("--ry", `${(x - 0.5) * 2 * MAX_DEG}deg`);
    card.style.setProperty("--rx", `${(0.5 - y) * 2 * MAX_DEG}deg`);
    card.style.setProperty("--gx", `${x * 100}%`);
    card.style.setProperty("--gy", `${y * 100}%`);
  };
  const onEnter = () => {
    rect = card.getBoundingClientRect();
    root.classList.add("is-tilting");
  };
  const onMove = (event) => {
    if (!rect) onEnter();
    px = event.clientX;
    py = event.clientY;
    if (!frame) frame = requestAnimationFrame(apply);
  };
  const onLeave = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    rect = null;
    root.classList.remove("is-tilting");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  return {
    destroy() {
      onLeave();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    },
  };
}
