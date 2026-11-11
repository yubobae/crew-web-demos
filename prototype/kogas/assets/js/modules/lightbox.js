// 크게 보기: root 안의 .js-lb-item(data-full, 안에 img)을 누르면 <dialog class="js-lb">를 열어 크게 보여 준다.
// ← → 버튼·방향키·휴대폰 좌우 밀기로 넘기고, Esc·바깥 누르기로 닫는다. 번호는 .js-lb-count.
export function init(root) {
  const items = [...root.querySelectorAll(".js-lb-item")];
  const dialog = root.querySelector(".js-lb");
  const img = dialog?.querySelector(".js-lb-img");
  const count = dialog?.querySelector(".js-lb-count");
  if (!items.length || !dialog || !img) return { destroy() {} };
  let index = 0;
  let touchX = null;

  let imgRef = img;
  const show = (i) => {
    index = (i + items.length) % items.length;
    const it = items[index];
    const thumb = it.querySelector("img");
    const next = imgRef.cloneNode(); // 새 요소로 바꿔 등장 애니메이션을 다시 돌린다
    next.src = it.dataset.full ?? thumb.src;
    next.alt = thumb.alt;
    imgRef.replaceWith(next);
    imgRef = next;
    if (count) count.textContent = `${index + 1} / ${items.length}`;
  };

  const onItem = (event) => {
    show(items.indexOf(event.currentTarget));
    dialog.showModal();
  };
  const onDialogClick = (event) => {
    const b = event.target.closest("[data-lb]");
    if (b?.dataset.lb === "prev") show(index - 1);
    else if (b?.dataset.lb === "next") show(index + 1);
    else if (b?.dataset.lb === "close" || event.target === dialog || event.target.classList.contains("c-lightbox__stage")) dialog.close();
  };
  const onKey = (event) => {
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  };
  const onTouchStart = (event) => (touchX = event.touches[0].clientX);
  const onTouchEnd = (event) => {
    if (touchX === null) return;
    const dx = event.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  };

  items.forEach((it) => it.addEventListener("click", onItem));
  dialog.addEventListener("click", onDialogClick);
  dialog.addEventListener("keydown", onKey);
  dialog.addEventListener("touchstart", onTouchStart, { passive: true });
  dialog.addEventListener("touchend", onTouchEnd);
  return {
    destroy() {
      items.forEach((it) => it.removeEventListener("click", onItem));
      dialog.removeEventListener("click", onDialogClick);
      dialog.removeEventListener("keydown", onKey);
      dialog.removeEventListener("touchstart", onTouchStart);
      dialog.removeEventListener("touchend", onTouchEnd);
    },
  };
}
