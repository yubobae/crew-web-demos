// 가운데 정렬 무한 슬라이더: 장마다 --offset(가운데 0, 양옆 ±1…)을 넣어 CSS가 위치·크기·투명도를 정한다.
// 복제 없이 나머지 계산으로 무한 반복. 이전/다음 버튼, 점, 키보드(← →), 끌기·밀기, 자동 재생(4초, 마우스·포커스·화면 밖이면 멈춤).
// 이벤트: carousel:change (detail.index)
import { prefersReducedMotion } from "../utils/motion.js";

const AUTOPLAY_MS = 4000;
const SWIPE_PX = 40;

export function init(root) {
  const viewport = root.querySelector(".c-carousel__viewport");
  const slides = [...root.querySelectorAll(".c-carousel__slide")];
  const dotsBox = root.querySelector(".js-carousel-dots");
  const status = root.querySelector(".js-carousel-status");
  if (!viewport || slides.length < 2) return { destroy() {} };

  const n = slides.length;
  let index = 0;
  let timer = 0;
  let paused = false;
  let visible = true;
  let startX = null;
  const dots = [];

  slides.forEach((slide, i) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "슬라이드");
    slide.setAttribute("aria-label", `${i + 1} / ${n}`);
    if (!dotsBox) return;
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "c-carousel__dot";
    dot.setAttribute("aria-label", `${i + 1}번째 슬라이드`);
    dot.addEventListener("click", () => go(i));
    dotsBox.append(dot);
    dots.push(dot);
  });

  const render = () => {
    slides.forEach((slide, i) => {
      let offset = (i - index + n) % n;
      if (offset > n / 2) offset -= n;
      slide.style.setProperty("--offset", String(offset));
      slide.classList.toggle("is-far", Math.abs(offset) > 2);
      slide.setAttribute("aria-hidden", String(offset !== 0));
    });
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === index)));
    if (status) status.textContent = `${n}장 중 ${index + 1}번째`;
  };

  const go = (next) => {
    index = (next + n) % n;
    render();
    root.dispatchEvent(new CustomEvent("carousel:change", { bubbles: true, detail: { index } }));
    restart();
  };

  const restart = () => {
    clearInterval(timer);
    if (!paused && visible && !prefersReducedMotion()) timer = setInterval(() => go(index + 1), AUTOPLAY_MS);
  };

  const onClick = (event) => {
    const arrow = event.target.closest("[data-carousel]");
    if (arrow) go(index + (arrow.dataset.carousel === "next" ? 1 : -1));
  };
  const onKey = (event) => {
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
    else return;
    event.preventDefault();
  };
  const pause = () => { paused = true; clearInterval(timer); };
  const resume = () => { paused = false; restart(); };
  const onDown = (event) => { startX = event.clientX; };
  const onUp = (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
  };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); }, { threshold: 0.3 });

  render();
  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKey);
  root.addEventListener("pointerenter", pause);
  root.addEventListener("pointerleave", resume);
  root.addEventListener("focusin", pause);
  root.addEventListener("focusout", resume);
  viewport.addEventListener("pointerdown", onDown);
  viewport.addEventListener("pointerup", onUp);
  io.observe(root);

  return {
    destroy() {
      clearInterval(timer);
      io.disconnect();
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("pointerenter", pause);
      root.removeEventListener("pointerleave", resume);
      root.removeEventListener("focusin", pause);
      root.removeEventListener("focusout", resume);
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointerup", onUp);
    },
  };
}
