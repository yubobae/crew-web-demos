// 커서 링: 기본 커서는 그대로 두고, 뒤따라 오는 작은 링이 링크·버튼 위에서 커진다(.is-hot).
// 마우스 기기·동작 줄이기 꺼짐에서만 만든다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init() {
  if (prefersReducedMotion() || !matchMedia("(hover: hover) and (pointer: fine)").matches) return { destroy() {} };
  const ring = document.createElement("div");
  ring.className = "c-cursor";
  ring.setAttribute("aria-hidden", "true");
  document.body.append(ring);
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let frame = 0;
  let shown = false;
  const tick = () => {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
  };
  const move = (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!shown) {
      x = tx;
      y = ty;
      shown = true;
      ring.classList.add("is-on");
    }
    ring.classList.toggle("is-hot", !!e.target.closest?.("a, button, summary, [data-cursor]"));
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const out = () => {
    shown = false;
    ring.classList.remove("is-on");
  };
  addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", out);
  return {
    destroy() {
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", out);
      cancelAnimationFrame(frame);
      ring.remove();
    },
  };
}
