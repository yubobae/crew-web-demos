// 자석 버튼: root 안의 .c-btn 에 포인터가 가까이 오면 살짝 끌려오고(--mx,--my), 떠나면 CSS 스프링으로 제자리.
// 마우스 기기·동작 줄이기 꺼짐에서만.
import { prefersReducedMotion } from "../utils/motion.js";

const PULL = 0.32;

export function init(root) {
  if (prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return { destroy() {} };
  const btns = root.classList.contains("c-btn") ? [root] : [...root.querySelectorAll(".c-btn")];
  const cleanups = btns.map((btn) => {
    let frame = 0;
    let ev = null;
    const apply = () => {
      frame = 0;
      const r = btn.getBoundingClientRect();
      const dx = ev.clientX - (r.left + r.width / 2);
      const dy = ev.clientY - (r.top + r.height / 2);
      btn.style.setProperty("--mx", `${(dx * PULL).toFixed(1)}px`);
      btn.style.setProperty("--my", `${(dy * PULL).toFixed(1)}px`);
    };
    const move = (e) => {
      ev = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      btn.style.setProperty("--mx", "0px");
      btn.style.setProperty("--my", "0px");
    };
    btn.addEventListener("pointermove", move, { passive: true });
    btn.addEventListener("pointerleave", leave);
    return () => {
      btn.removeEventListener("pointermove", move);
      btn.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  });
  return {
    destroy() {
      cleanups.forEach((c) => c());
    },
  };
}
