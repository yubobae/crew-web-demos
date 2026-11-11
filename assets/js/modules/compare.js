// 전후 비교: 안쪽 range(.js-compare-range) 값(0~100)을 root의 --pos로 쓴다. 잡는 동안 is-dragging.
export function init(root) {
  const range = root.querySelector(".js-compare-range");
  if (!range) return { destroy() {} };
  const render = () => root.style.setProperty("--pos", range.value);
  const down = () => root.classList.add("is-dragging");
  const up = () => root.classList.remove("is-dragging");

  range.addEventListener("input", render);
  range.addEventListener("pointerdown", down);
  addEventListener("pointerup", up);
  render();
  return {
    destroy() {
      range.removeEventListener("input", render);
      range.removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
    },
  };
}
