// 숫자 굴리기: box(display: inline-grid) 안의 글자를 새 값으로 바꾸며, 옛 글자는 빠지고 새 글자가 들어온다.
// dir 1이면 아래에서 위로(커질 때), -1이면 위에서 아래로(작아질 때). 동작 줄이기면 바로 바꾼다.
import { prefersReducedMotion } from "./motion.js";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function roll(box, value, { dir = 1, className, duration = 380 } = {}) {
  const old = box.lastElementChild;
  if (old?.textContent === String(value)) return;
  const next = document.createElement("span");
  if (className) next.className = className;
  next.textContent = value;
  if (!old || prefersReducedMotion()) {
    box.replaceChildren(next);
    return;
  }
  // 빠르게 여러 번 누르면 이전에 나가던 글자는 바로 치운다
  [...box.children].slice(0, -1).forEach((el) => el.remove());
  box.append(next);
  const opt = { duration, easing: EASE };
  old.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${-80 * dir}%)`, opacity: 0 }], opt).finished.then(
    () => old.remove(),
    () => old.remove(),
  );
  next.animate([{ transform: `translateY(${80 * dir}%)`, opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], opt);
}
