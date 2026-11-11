// 카드 여러 장 기울이기: root 안의 .js-tilt 카드마다 포인터 쪽으로 기울고(--rx,--ry), 빛(--gx,--gy)이 따라간다.
// 떠나면 CSS 스프링으로 제자리. 마우스 기기·동작 줄이기 꺼짐에서만.
import { prefersReducedMotion } from "../utils/motion.js";

const MAX = 7;

export function init(root) {
  if (prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return { destroy() {} };
  const cleanups = [...root.querySelectorAll(".js-tilt")].map((card) => {
    let rect = null;
    let frame = 0;
    let ev = null;
    const apply = () => {
      frame = 0;
      if (!rect) return;
      const x = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (ev.clientY - rect.top) / rect.height));
      card.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${((0.5 - y) * 2 * MAX).toFixed(2)}deg`);
      card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    };
    const enter = () => {
      rect = card.getBoundingClientRect();
      card.classList.add("is-tilting");
    };
    const move = (e) => {
      if (!rect) enter();
      ev = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      rect = null;
      card.classList.remove("is-tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", leave);
    return () => {
      leave();
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  });
  return {
    destroy() {
      cleanups.forEach((c) => c());
    },
  };
}
