// 값 풍선 슬라이더: input[type=range] 값이 바뀌면 root에 --p(0~100)를 쓰고 풍선 글자를 바꾼다. 잡는 동안 is-dragging.
// root: .c-range, 안에 .js-range(입력), .js-range-bubble(풍선), 풍선 글자 형식은 data-suffix.
export function init(root) {
  const input = root.querySelector(".js-range");
  const bubble = root.querySelector(".js-range-bubble");
  if (!input) return { destroy() {} };

  const render = () => {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const p = ((Number(input.value) - min) / (max - min)) * 100;
    root.style.setProperty("--p", String(p));
    if (bubble) bubble.textContent = `${input.value}${root.dataset.suffix ?? ""}`;
  };
  const down = () => root.classList.add("is-dragging");
  const up = () => root.classList.remove("is-dragging");

  input.addEventListener("input", render);
  input.addEventListener("pointerdown", down);
  addEventListener("pointerup", up);
  input.addEventListener("blur", up);
  render();
  return {
    destroy() {
      input.removeEventListener("input", render);
      input.removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      input.removeEventListener("blur", up);
    },
  };
}
