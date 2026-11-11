// 포인터를 따라다니는 빛: root 위에서 마우스를 움직이면 --sx, --sy(px)가 바뀐다. CSS가 이 위치에 빛을 그린다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return { destroy() {} };
  let frame = 0;
  let ev = null;
  const apply = () => {
    frame = 0;
    const r = root.getBoundingClientRect();
    root.style.setProperty("--sx", `${(ev.clientX - r.left).toFixed(0)}px`);
    root.style.setProperty("--sy", `${(ev.clientY - r.top).toFixed(0)}px`);
  };
  const move = (e) => {
    ev = e;
    if (!frame) frame = requestAnimationFrame(apply);
  };
  root.addEventListener("pointermove", move, { passive: true });
  return {
    destroy() {
      root.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    },
  };
}
