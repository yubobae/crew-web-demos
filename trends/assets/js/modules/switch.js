// 켜고 끄기 스위치: root 안 [role=switch]를 누르면 aria-checked를 바꾸고,
// .js-switch-state 글자를 data-on / data-off 로 바꾼다. 이벤트: switch:change (detail: { on })
export function init(root) {
  const sw = root.querySelector("[role='switch']");
  const state = root.querySelector(".js-switch-state");
  if (!sw) return { destroy() {} };

  const render = () => {
    const on = sw.getAttribute("aria-checked") === "true";
    if (state) state.textContent = on ? state.dataset.on : state.dataset.off;
    return on;
  };
  const onClick = () => {
    sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true"));
    root.dispatchEvent(new CustomEvent("switch:change", { bubbles: true, detail: { on: render() } }));
  };

  sw.addEventListener("click", onClick);
  render();
  return {
    destroy() {
      sw.removeEventListener("click", onClick);
    },
  };
}
