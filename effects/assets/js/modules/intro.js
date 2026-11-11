// 인트로: 숫자 카운트업, 강조 문구 열림(is-ready), 인트로 동안 스크롤 잠금.
// 이벤트: intro:done (인트로가 끝나면 root에서 발생)
import { prefersReducedMotion, tween } from "../utils/motion.js";
import { lockScroll, unlockScroll } from "../utils/scroll-lock.js";

const COUNT_DELAY_MS = 800;
const COUNT_DURATION_MS = 2000;
const INTRO_DURATION_MS = 4000;

export function init(root) {
  const counter = root.querySelector(".js-intro-count");
  const target = Number(counter?.dataset.countTo ?? 0);
  const timers = [];
  let cancelTween = () => {};
  let locked = false;

  const finish = () => {
    if (locked) unlockScroll();
    locked = false;
    root.dispatchEvent(new CustomEvent("intro:done", { bubbles: true }));
  };

  if (prefersReducedMotion()) {
    if (counter) counter.textContent = String(target);
    root.classList.add("is-ready");
    finish();
  } else {
    lockScroll();
    locked = true;
    requestAnimationFrame(() => root.classList.add("is-ready"));
    timers.push(
      setTimeout(() => {
        cancelTween = tween(COUNT_DURATION_MS, (p) => {
          if (counter) counter.textContent = String(Math.round(target * p));
        });
      }, COUNT_DELAY_MS),
      setTimeout(finish, INTRO_DURATION_MS),
    );
  }

  return {
    destroy() {
      timers.forEach(clearTimeout);
      cancelTween();
      if (locked) unlockScroll();
      locked = false;
    },
  };
}
