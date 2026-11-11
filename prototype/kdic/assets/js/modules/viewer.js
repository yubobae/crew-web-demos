// 크게 보기: root 안의 .js-vw-item(data-full, data-cap, 안에 img)을 누르면 <dialog class="js-vw">를 열어 크게 보여 준다.
// ← → 버튼·방향키·휴대폰 좌우 밀기로 넘기고, Esc·바깥 누르기로 닫는다. 번호 .js-vw-count, 설명 .js-vw-cap.
// 접힌(hidden) 칸은 넘기기에서 뺀다.
export function init(root) {
  const dialog = root.querySelector(".js-vw");
  const img = dialog?.querySelector(".js-vw-img");
  const count = dialog?.querySelector(".js-vw-count");
  const cap = dialog?.querySelector(".js-vw-cap");
  if (!dialog || !img) return { destroy() {} };
  const all = () => [...root.querySelectorAll(".js-vw-item")].filter((el) => !el.closest("[hidden]"));
  let list = [];
  let index = 0;
  let touchX = null;
  let imgRef = img;

  const show = (i) => {
    index = (i + list.length) % list.length;
    const it = list[index];
    const thumb = it.querySelector("img");
    const next = imgRef.cloneNode(); // 새 요소로 바꿔 등장 애니메이션을 다시 돌린다
    next.src = it.dataset.full ?? thumb.src;
    next.alt = thumb.alt;
    imgRef.replaceWith(next);
    imgRef = next;
    if (count) count.textContent = `${index + 1} / ${list.length}`;
    if (cap) cap.textContent = it.dataset.cap ?? "";
  };

  const onRoot = (event) => {
    const it = event.target.closest(".js-vw-item");
    if (!it || !root.contains(it)) return;
    list = all();
    show(list.indexOf(it));
    dialog.showModal();
  };
  const onDialogClick = (event) => {
    const b = event.target.closest("[data-vw]");
    if (b?.dataset.vw === "prev") show(index - 1);
    else if (b?.dataset.vw === "next") show(index + 1);
    else if (b?.dataset.vw === "close" || event.target === dialog || event.target.classList.contains("c-viewer__stage")) dialog.close();
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

  root.addEventListener("click", onRoot);
  dialog.addEventListener("click", onDialogClick);
  dialog.addEventListener("keydown", onKey);
  dialog.addEventListener("touchstart", onTouchStart, { passive: true });
  dialog.addEventListener("touchend", onTouchEnd);
  return {
    destroy() {
      root.removeEventListener("click", onRoot);
      dialog.removeEventListener("click", onDialogClick);
      dialog.removeEventListener("keydown", onKey);
      dialog.removeEventListener("touchstart", onTouchStart);
      dialog.removeEventListener("touchend", onTouchEnd);
    },
  };
}
