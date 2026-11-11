// 글자 뒤섞기: .js-scramble 에 올리거나 초점이 오면 글자가 무작위 기호로 흩어졌다가 왼쪽부터 원래 글자로 돌아온다.
// 원래 글자는 aria-label로 고정해 화면 읽기 도구는 섞인 글자를 읽지 않는다. 동작 줄이기면 아무것도 안 한다.
import { prefersReducedMotion } from "../utils/motion.js";

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=?/<>01";
const FRAMES = 22; // 약 0.4초(60fps)

export function init(root) {
  const els = root.querySelectorAll(".js-scramble").length ? [...root.querySelectorAll(".js-scramble")] : [root];
  if (prefersReducedMotion()) return { destroy() {} };
  const runs = new Map();

  const play = (el) => {
    const original = el.dataset.text;
    cancelAnimationFrame(runs.get(el));
    let f = 0;
    const tick = () => {
      f++;
      const settled = Math.floor((f / FRAMES) * original.length);
      el.textContent = [...original]
        .map((ch, i) => (i < settled || ch === " " ? ch : POOL[Math.floor(Math.random() * POOL.length)]))
        .join("");
      if (f < FRAMES) runs.set(el, requestAnimationFrame(tick));
      else el.textContent = original;
    };
    runs.set(el, requestAnimationFrame(tick));
  };
  const onEnter = (event) => play(event.currentTarget);

  els.forEach((el) => {
    el.dataset.text = el.textContent.trim();
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.dataset.text);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("focus", onEnter);
  });
  return {
    destroy() {
      runs.forEach((id) => cancelAnimationFrame(id));
      els.forEach((el) => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("focus", onEnter);
        el.textContent = el.dataset.text;
      });
    },
  };
}
