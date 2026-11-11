// 닫을 수 있는 띠: .js-dismiss를 누르면 .js-dismiss-target에 is-hidden(높이 접힘), .js-dismiss-restore는 되돌리기.
export function init(root) {
  const target = root.querySelector(".js-dismiss-target");
  const closeBtn = root.querySelector(".js-dismiss");
  const restoreBtns = [...document.querySelectorAll(`.js-dismiss-restore[aria-controls="${target?.id}"]`)];
  if (!target || !closeBtn) return { destroy() {} };

  const set = (hidden) => {
    target.classList.toggle("is-hidden", hidden);
    target.inert = hidden;
    restoreBtns.forEach((b) => (b.disabled = !hidden));
  };
  const onClose = () => set(true);
  const onRestore = () => set(false);

  closeBtn.addEventListener("click", onClose);
  restoreBtns.forEach((b) => b.addEventListener("click", onRestore));
  set(false);

  return {
    destroy() {
      closeBtn.removeEventListener("click", onClose);
      restoreBtns.forEach((b) => b.removeEventListener("click", onRestore));
    },
  };
}
