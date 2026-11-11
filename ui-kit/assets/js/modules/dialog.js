// 모달: root 안의 .js-dialog-open 버튼으로 <dialog class="js-dialog">를 연다.
// Esc 닫기, 포커스 가두기, 닫은 뒤 원래 버튼으로 포커스 복귀는 브라우저 기본 <dialog>가 처리한다.
// 바깥(어두운 배경)을 누르면 닫힌다. 이벤트: dialog:close (detail.returnValue)

export function init(root) {
  const dialog = root.querySelector(".js-dialog");
  if (!dialog) return { destroy() {} };
  const openers = [...root.querySelectorAll(".js-dialog-open")];
  const closers = [...dialog.querySelectorAll(".js-dialog-close")];

  const open = () => dialog.showModal();
  const close = (event) => dialog.close(event?.currentTarget?.value ?? "");
  const onBackdrop = (event) => {
    if (event.target === dialog) dialog.close("backdrop");
  };
  const onClose = () => {
    root.dispatchEvent(new CustomEvent("dialog:close", { bubbles: true, detail: { returnValue: dialog.returnValue } }));
  };

  openers.forEach((button) => button.addEventListener("click", open));
  closers.forEach((button) => button.addEventListener("click", close));
  dialog.addEventListener("click", onBackdrop);
  dialog.addEventListener("close", onClose);

  return {
    destroy() {
      openers.forEach((button) => button.removeEventListener("click", open));
      closers.forEach((button) => button.removeEventListener("click", close));
      dialog.removeEventListener("click", onBackdrop);
      dialog.removeEventListener("close", onClose);
      if (dialog.open) dialog.close();
    },
  };
}
