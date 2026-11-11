// 열고 닫기 공통: .js-disclosure-toggle을 누르면 root에 is-open을 붙였다 뗀다.
// .js-disclosure-close(닫기 버튼·어두운 막)는 닫기만, .js-disclosure-panel은 닫혀 있을 때 inert(초점 이동 막기).
// 열려 있을 때 Esc로 닫고 여는 버튼으로 초점을 돌려준다.
// 이벤트: disclosure:change (detail: { open })
export function init(root) {
  const toggles = [...root.querySelectorAll(".js-disclosure-toggle")];
  const closers = [...root.querySelectorAll(".js-disclosure-close")];
  const panel = root.querySelector(".js-disclosure-panel");
  if (!toggles.length) return { destroy() {} };
  let open = false;

  const set = (next) => {
    open = next;
    root.classList.toggle("is-open", open);
    toggles.forEach((t) => t.setAttribute("aria-expanded", String(open)));
    if (panel) panel.inert = !open;
    root.dispatchEvent(new CustomEvent("disclosure:change", { bubbles: true, detail: { open } }));
  };

  const onToggle = () => set(!open);
  const onClose = () => {
    set(false);
    toggles[0].focus();
  };
  const onKey = (event) => {
    if (event.key === "Escape" && open) onClose();
  };

  toggles.forEach((t) => t.addEventListener("click", onToggle));
  closers.forEach((c) => c.addEventListener("click", onClose));
  root.addEventListener("keydown", onKey);
  if (panel) panel.inert = true;

  return {
    destroy() {
      toggles.forEach((t) => t.removeEventListener("click", onToggle));
      closers.forEach((c) => c.removeEventListener("click", onClose));
      root.removeEventListener("keydown", onKey);
    },
  };
}
