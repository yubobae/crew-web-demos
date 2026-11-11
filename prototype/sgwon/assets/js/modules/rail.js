// 가로 레일: .c-rail__track 을 마우스로 끌어 넘기고(휴대폰·트랙패드는 그냥 밀기), 화살표 버튼으로 한 장씩 넘긴다.
// 스크롤 위치를 --prog(0~1)로 .c-rail 에 써서 진행 막대를 채운다. 끌고 난 뒤의 클릭은 링크로 이동하지 않게 막는다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  const track = root.querySelector(".c-rail__track");
  const prev = root.querySelector('[data-rail="prev"]');
  const next = root.querySelector('[data-rail="next"]');
  if (!track) return { destroy() {} };

  let frame = 0;
  let startX = 0;
  let startLeft = 0;
  let dragging = false;
  let moved = false;

  const update = () => {
    frame = 0;
    const max = track.scrollWidth - track.clientWidth;
    root.style.setProperty("--prog", (max > 0 ? track.scrollLeft / max : 0).toFixed(3));
    if (prev) prev.disabled = track.scrollLeft < 4;
    if (next) next.disabled = track.scrollLeft > max - 4;
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const step = (dir) => {
    const card = track.querySelector(".c-rail__card");
    const w = card ? card.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * w, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const onPrev = () => step(-1);
  const onNext = () => step(1);
  const onDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragging = true;
    moved = false;
    startX = event.clientX;
    startLeft = track.scrollLeft;
  };
  const onMove = (event) => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    if (!moved && Math.abs(dx) > 6) {
      moved = true;
      track.classList.add("is-dragging");
      track.setPointerCapture(event.pointerId);
    }
    if (moved) track.scrollLeft = startLeft - dx;
  };
  const onUp = (event) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture?.(event.pointerId)) track.releasePointerCapture(event.pointerId);
  };
  const onClickCapture = (event) => {
    if (moved) {
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }
  };

  update();
  track.addEventListener("scroll", onScroll, { passive: true });
  track.addEventListener("pointerdown", onDown);
  track.addEventListener("pointermove", onMove);
  track.addEventListener("pointerup", onUp);
  track.addEventListener("pointercancel", onUp);
  track.addEventListener("click", onClickCapture, true);
  prev?.addEventListener("click", onPrev);
  next?.addEventListener("click", onNext);
  addEventListener("resize", onScroll, { passive: true });
  return {
    destroy() {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      track.removeEventListener("click", onClickCapture, true);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      removeEventListener("resize", onScroll);
    },
  };
}
