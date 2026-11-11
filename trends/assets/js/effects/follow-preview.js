// 따라오는 미리 보기: 목록(root) 위에서 포인터를 따라 카드(.js-follow)가 살짝 늦게(보간) 따라오고,
// 올린 줄(.js-follow-row[data-preview])의 그림(.js-follow-img)이 켜진다. 목록에 is-previewing.
// 움직이는 동안만 rAF를 돌리고, 거의 따라잡으면 멈춘다. 마우스 기기·동작 줄이기 꺼짐에서만.
import { prefersReducedMotion } from "../utils/motion.js";

const EASE = 0.18; // 프레임마다 남은 거리의 18%만큼 다가간다

export function init(root) {
  const card = root.querySelector(".js-follow");
  const rows = [...root.querySelectorAll(".js-follow-row")];
  const imgs = [...root.querySelectorAll(".js-follow-img")];
  if (!card || prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return { destroy() {} };
  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let frame = 0;
  let rect = null;
  let half = null;

  const tick = () => {
    x += (tx - x) * EASE;
    y += (ty - y) * EASE;
    card.style.transform = `translate3d(${x - half.w}px, ${y - half.h}px, 0)`;
    frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
  };
  const onMove = (event) => {
    rect ??= root.getBoundingClientRect();
    half ??= { w: card.offsetWidth / 2, h: card.offsetHeight / 2 };
    tx = event.clientX - rect.left;
    ty = event.clientY - rect.top;
    if (!root.classList.contains("is-previewing")) {
      x = tx; // 처음 나타날 때는 커서 자리에서 시작
      y = ty;
      root.classList.add("is-previewing");
    }
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const onRow = (event) => {
    const n = Number(event.currentTarget.dataset.preview);
    imgs.forEach((img, i) => img.classList.toggle("is-active", i === n));
  };
  const onLeave = () => {
    root.classList.remove("is-previewing");
    rect = null;
  };
  const reset = () => (rect = null);

  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  rows.forEach((r) => r.addEventListener("pointerenter", onRow));
  addEventListener("scroll", reset, { passive: true });
  return {
    destroy() {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      rows.forEach((r) => r.removeEventListener("pointerenter", onRow));
      removeEventListener("scroll", reset);
    },
  };
}
