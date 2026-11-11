// 자석 버튼: root 안에서 커서가 버튼(.js-magnet) 가까이(반지름의 RANGE배 안) 오면 버튼을 끌어당기고,
// 글자(.js-magnet-label)는 더 많이 끌어당긴다. 멀어지면 CSS 스프링 전환으로 제자리.
// 마우스(hover 가능) 기기·동작 줄이기 꺼짐에서만 동작. 이동 계산은 rAF 한 번에 모아서.
import { prefersReducedMotion } from "../utils/motion.js";

const RANGE = 1.6;
const PULL = 0.35;
const LABEL_PULL = 0.55;

export function init(root) {
  const btn = root.querySelector(".js-magnet");
  const label = root.querySelector(".js-magnet-label");
  if (!btn || prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return { destroy() {} };
  let frame = 0;
  let px = 0;
  let py = 0;
  let rect = null;

  const apply = () => {
    frame = 0;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = px - cx;
    const dy = py - cy;
    const near = Math.hypot(dx, dy) < (rect.width / 2) * RANGE;
    btn.classList.toggle("is-pulling", near);
    btn.style.transform = near ? `translate(${dx * PULL}px, ${dy * PULL}px)` : "";
    if (label) label.style.transform = near ? `translate(${dx * LABEL_PULL * 0.4}px, ${dy * LABEL_PULL * 0.4}px)` : "";
  };

  const onMove = (event) => {
    px = event.clientX;
    py = event.clientY;
    if (!rect) rect = btn.getBoundingClientRect(); // 움직이는 동안은 처음 잰 값(끌려간 위치가 아니라 제자리)을 쓴다
    if (!frame) frame = requestAnimationFrame(apply);
  };
  const onLeave = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    rect = null;
    btn.classList.remove("is-pulling");
    btn.style.transform = "";
    if (label) label.style.transform = "";
  };
  const reset = () => (rect = null); // 스크롤·크기 변경 뒤에는 다시 잰다

  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  addEventListener("scroll", reset, { passive: true });
  addEventListener("resize", reset);
  return {
    destroy() {
      onLeave();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      removeEventListener("scroll", reset);
      removeEventListener("resize", reset);
    },
  };
}
