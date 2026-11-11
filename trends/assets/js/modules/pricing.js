// 요금 전환: 안쪽 glider(select)가 보내는 glider:change(value: month|year)를 받아 가격을 바꾼다.
// 가격(.js-price[data-month][data-year])은 옛 숫자가 위로 빠지고 새 숫자가 아래에서 올라온다.
// .js-price-note[data-month][data-year]는 글자만 바꾼다.
import { prefersReducedMotion } from "../utils/motion.js";

const fmt = new Intl.NumberFormat("ko-KR");
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function init(root) {
  const prices = [...root.querySelectorAll(".js-price")];
  const notes = [...root.querySelectorAll(".js-price-note")];
  const reduce = prefersReducedMotion();

  const swap = (el, value) => {
    const old = el.querySelector(".c-pricing__num");
    if (old?.textContent === value) return;
    const next = document.createElement("span");
    next.className = "c-pricing__num";
    next.textContent = value;
    if (!old || reduce) {
      el.replaceChildren(next);
      return;
    }
    el.append(next);
    const opt = { duration: 420, easing: EASE };
    old.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-70%)", opacity: 0 }], opt).finished.then(() => old.remove());
    next.animate([{ transform: "translateY(70%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], opt);
  };

  const render = (period) => {
    prices.forEach((el) => swap(el, fmt.format(Number(el.dataset[period]))));
    notes.forEach((el) => (el.textContent = el.dataset[period]));
  };

  const onChange = (event) => render(event.detail.value);
  root.addEventListener("glider:change", onChange);
  render("month");
  return {
    destroy() {
      root.removeEventListener("glider:change", onChange);
    },
  };
}
