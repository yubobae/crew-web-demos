// 명령 팔레트: .js-cmdk-open 또는 Ctrl/⌘+K로 <dialog class="js-cmdk">를 연다.
// 입력하면 [role=option]을 글자·data-keywords로 거르고, ↑↓로 고르고 Enter로 실행(닫힘), 바깥 누르면 닫힘.
// 이벤트: cmdk:select (detail: { value })
export function init(root) {
  const openBtn = root.querySelector(".js-cmdk-open");
  const dialog = root.querySelector(".js-cmdk");
  const input = dialog?.querySelector(".js-cmdk-input");
  const options = [...(dialog?.querySelectorAll("[role='option']") ?? [])];
  const empty = dialog?.querySelector(".js-cmdk-empty");
  if (!openBtn || !dialog || !input) return { destroy() {} };
  let active = 0;
  // 묶음 제목(.c-cmdk__group 등 role=presentation)과 그 아래 항목들
  const groups = [];
  for (const li of dialog?.querySelectorAll(".js-cmdk-list > li") ?? []) {
    if (li.getAttribute("role") === "presentation") groups.push({ head: li, items: [] });
    else groups.at(-1)?.items.push(li);
  }

  const visible = () => options.filter((o) => !o.hidden);
  const mark = (i) => {
    const list = visible();
    active = list.length ? (i + list.length) % list.length : 0;
    options.forEach((o) => o.setAttribute("aria-selected", "false"));
    const cur = list[active];
    if (cur) {
      cur.setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", cur.id);
      cur.scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  };

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    options.forEach((o) => {
      const text = `${o.textContent} ${o.dataset.keywords ?? ""}`.toLowerCase();
      o.hidden = q !== "" && !text.includes(q);
    });
    // 걸러진 뒤 비어 버린 묶음 제목은 숨긴다
    groups.forEach(({ head, items }) => (head.hidden = items.every((o) => o.hidden)));
    if (empty) empty.hidden = visible().length > 0;
    mark(0);
  };

  const open = () => {
    if (dialog.open) return;
    input.value = "";
    filter();
    dialog.showModal();
    input.focus();
  };
  const choose = (option) => {
    if (!option) return;
    root.dispatchEvent(new CustomEvent("cmdk:select", { bubbles: true, detail: { value: option.dataset.value } }));
    dialog.close();
  };

  const onKey = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      mark(active + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(visible()[active]);
    }
  };
  const onGlobalKey = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open();
    }
  };
  const onDialogClick = (event) => {
    if (event.target === dialog) dialog.close(); // 바깥(::backdrop) 누름
    const option = event.target.closest("[role='option']");
    if (option) choose(option);
  };
  const onPointerMove = (event) => {
    const option = event.target.closest("[role='option']");
    if (option) mark(visible().indexOf(option));
  };

  openBtn.addEventListener("click", open);
  input.addEventListener("input", filter);
  input.addEventListener("keydown", onKey);
  dialog.addEventListener("click", onDialogClick);
  dialog.addEventListener("pointermove", onPointerMove);
  addEventListener("keydown", onGlobalKey);

  return {
    destroy() {
      openBtn.removeEventListener("click", open);
      input.removeEventListener("input", filter);
      input.removeEventListener("keydown", onKey);
      dialog.removeEventListener("click", onDialogClick);
      dialog.removeEventListener("pointermove", onPointerMove);
      removeEventListener("keydown", onGlobalKey);
    },
  };
}
