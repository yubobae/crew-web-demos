// 숫자 스테퍼: .js-step[data-step="1|-1"] 로 값을 data-min~data-max 안에서 바꾸고 숫자를 굴린다.
// 끝에 닿은 쪽 버튼은 disabled. 값 칸(.js-step-value)은 role=status 로 읽어 준다.
import { roll } from "../utils/roll.js";

export function init(root) {
  const box = root.querySelector(".js-step-value");
  const btns = [...root.querySelectorAll(".js-step")];
  if (!box || !btns.length) return { destroy() {} };
  const min = Number(root.dataset.min ?? 0);
  const max = Number(root.dataset.max ?? 99);
  let value = Number(root.dataset.value ?? min);

  const sync = () => btns.forEach((b) => (b.disabled = Number(b.dataset.step) < 0 ? value <= min : value >= max));
  const onClick = (event) => {
    const step = Number(event.currentTarget.dataset.step);
    const next = Math.min(max, Math.max(min, value + step));
    if (next === value) return;
    value = next;
    roll(box, value, { dir: Math.sign(step), className: "c-stepper__num" });
    sync();
  };

  btns.forEach((b) => b.addEventListener("click", onClick));
  roll(box, value, { className: "c-stepper__num" });
  sync();
  return {
    destroy() {
      btns.forEach((b) => b.removeEventListener("click", onClick));
    },
  };
}
