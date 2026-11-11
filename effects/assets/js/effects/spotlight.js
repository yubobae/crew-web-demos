// 스포트라이트 + 기울기: root 안의 .c-spotlight-card에 마우스 위치(--spot-x/y)와 기울기(--tilt-x/y)를 넣는다.
// 마우스가 있는 기기에서만, reduced-motion이면 기울기는 빼고 빛만.
import { prefersReducedMotion } from "../utils/motion.js";

const MAX_TILT_DEG = 6;

export function init(root) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return { destroy() {} };
  const cards = [...root.querySelectorAll(".c-spotlight-card")];
  const tilt = !prefersReducedMotion();
  const handlers = [];

  cards.forEach((card) => {
    let frame = 0;
    const move = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = event.clientX - r.left;
        const y = event.clientY - r.top;
        card.style.setProperty("--spot-x", `${x}px`);
        card.style.setProperty("--spot-y", `${y}px`);
        if (tilt) {
          card.style.setProperty("--tilt-x", `${((x / r.width) - 0.5) * MAX_TILT_DEG * 2}deg`);
          card.style.setProperty("--tilt-y", `${(0.5 - (y / r.height)) * MAX_TILT_DEG * 2}deg`);
        }
      });
    };
    const enter = () => card.classList.add("is-hover");
    const leave = () => {
      card.classList.remove("is-hover");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    handlers.push(() => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
    });
  });

  return {
    destroy() {
      handlers.forEach((off) => off());
    },
  };
}
