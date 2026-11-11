// 더 보기: root 안의 .js-more-item 중 처음엔 hidden 인 것을, 버튼(.js-more)을 누를 때마다 data-batch 개씩 연다.
// 다 열리면 버튼 줄(부모)을 숨긴다. 아래 항목은 열릴 때에야 이미지를 불러온다(loading=lazy + hidden).
export function init(root) {
  const btn = root.querySelector(".js-more");
  const items = [...root.querySelectorAll(".js-more-item")];
  if (!btn || !items.length) return { destroy() {} };
  const size = Number(root.dataset.batch ?? 9);
  const sync = () => {
    btn.parentElement.hidden = !items.some((el) => el.hidden);
  };
  const onClick = () => {
    items.filter((el) => el.hidden).slice(0, size).forEach((el) => (el.hidden = false));
    sync();
  };
  btn.addEventListener("click", onClick);
  sync();
  return { destroy: () => btn.removeEventListener("click", onClick) };
}
