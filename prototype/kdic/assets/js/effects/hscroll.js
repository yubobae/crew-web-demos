// 가로 필름 레일: 세로로 스크롤하는 동안 화면에 고정된 채 사진 줄이 가로로 밀린다.
// root(.c-film)에 is-pinned 를 붙이고, 구역 높이(--film-h = 화면 높이 + 이동 거리), 이동 거리(--hs), 진행률(--hp 0~1)을 넣는다.
// 820px 미만·동작 줄이기: 고정하지 않고 손가락으로 넘기는 평소 가로 목록(CSS)이다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  const track = root.querySelector(".c-film__track");
  const viewport = root.querySelector(".c-film__viewport");
  if (!track || !viewport) return { destroy() {} };
  const wide = matchMedia("(min-width: 820px)");
  let shift = 0;
  let frame = 0;
  let visible = false;

  const measure = () => {
    if (!wide.matches) {
      root.classList.remove("is-pinned");
      root.style.removeProperty("--film-h");
      return;
    }
    root.classList.add("is-pinned");
    shift = Math.max(0, track.scrollWidth - viewport.clientWidth);
    root.style.setProperty("--hs", `${shift}px`);
    root.style.setProperty("--film-h", `${innerHeight + shift}px`);
    update();
  };
  const update = () => {
    frame = 0;
    if (!root.classList.contains("is-pinned")) return;
    const top = root.getBoundingClientRect().top;
    const p = shift > 0 ? Math.min(1, Math.max(0, -top / shift)) : 0;
    root.style.setProperty("--hp", p.toFixed(4));
  };
  const onScroll = () => {
    if (visible && !frame) frame = requestAnimationFrame(update);
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) update();
  });

  measure();
  io.observe(root);
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", measure);
  const imgs = [...root.querySelectorAll("img")];
  imgs.forEach((img) => img.addEventListener("load", measure, { once: true }));
  return {
    destroy() {
      cancelAnimationFrame(frame);
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", measure);
      root.classList.remove("is-pinned");
    },
  };
}
