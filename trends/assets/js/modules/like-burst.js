// 좋아요: 누르면 aria-pressed를 바꾸고 숫자를 굴린다. 켤 때만 is-burst(하트 튐 + 점 터짐)를 잠깐 붙인다.
// root: button.c-like, 안에 .js-like-count[data-count]
import { roll } from "../utils/roll.js";

export function init(root) {
  const box = root.querySelector(".js-like-count");
  let count = Number(box?.dataset.count ?? 0);
  let timer = 0;

  const onClick = () => {
    const on = root.getAttribute("aria-pressed") !== "true";
    root.setAttribute("aria-pressed", String(on));
    count += on ? 1 : -1;
    if (box) roll(box, count.toLocaleString("ko-KR"), { dir: on ? 1 : -1, className: "c-like__num" });
    root.classList.remove("is-burst");
    clearTimeout(timer);
    if (on) {
      root.getBoundingClientRect(); // 연달아 눌러도 애니메이션이 처음부터 다시 돌게
      root.classList.add("is-burst");
      timer = setTimeout(() => root.classList.remove("is-burst"), 700);
    }
  };

  root.addEventListener("click", onClick);
  return {
    destroy() {
      clearTimeout(timer);
      root.removeEventListener("click", onClick);
    },
  };
}
